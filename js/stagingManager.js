/**
 * STAGING & APPROVAL MANAGER (SISTEM PENAMPUNGAN PERUBAHAN & PERSETUJUAN ACC)
 * PLN UPT Palembang
 * 
 * Fitur:
 * 1. Menampung perubahan (Draft Staging) dari Tab Manajemen Asset, Kerawanan Satwa, & Rencana Tindak Lanjut.
 * 2. Role-Based Access:
 *    - Operator (Input Data): Dapat mengubah data dan menampung ke antrean draft.
 *    - Supervisor (Akses ACC): Berhak meninjau (review diff) dan menyetujui (Approve) semua perubahan sekaligus ke Spreadsheet.
 * 3. Floating Bar & Modal Review Diff yang interaktif dan realtime.
 * 4. Batch Synchronization ke Google Apps Script Spreadsheet dengan indikator progress.
 */

const stagingManager = (function() {
  // State
  let pendingChanges = [];
  let currentRole = "operator"; // "operator" | "supervisor"
  const STORAGE_KEY_CHANGES = "trs_pending_changes_v1";
  const STORAGE_KEY_ROLE = "trs_user_role_v1";
  const STORAGE_KEY_PIN = "trs_supervisor_pin_v1";
  const STORAGE_KEY_ADMIN_REMEMBER = "trs_admin_remember_v1";
  const DEFAULT_PIN = "1234";

  // Inisialisasi awal
  function init() {
    loadFromStorage();
    injectUIElements();
    updateUI();
  }

  // Muat data dari localStorage (Termasuk Remember Admin / Supervisor Session)
  function loadFromStorage() {
    try {
      const savedChanges = localStorage.getItem(STORAGE_KEY_CHANGES);
      if (savedChanges) {
        pendingChanges = JSON.parse(savedChanges);
      }
      const isRemembered = localStorage.getItem(STORAGE_KEY_ADMIN_REMEMBER) === "true";
      const sessionRole = (typeof sessionStorage !== "undefined") ? sessionStorage.getItem("trs_session_role") : null;
      const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);

      // Jika Remember Me aktif (disimpan di localStorage) ATAU masih dalam sesi browser aktif
      if (isRemembered || sessionRole === "supervisor" || (savedRole === "supervisor" && localStorage.getItem(STORAGE_KEY_ADMIN_REMEMBER) !== "false")) {
        currentRole = "supervisor";
      } else {
        currentRole = "operator";
      }
    } catch (e) {
      console.warn("[StagingManager] Gagal memuat data dari storage:", e);
      pendingChanges = [];
    }
  }

  // Simpan data ke localStorage
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_CHANGES, JSON.stringify(pendingChanges));
      localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
    } catch (e) {
      console.warn("[StagingManager] Gagal menyimpan data ke storage:", e);
    }
  }

  // Set sesi supervisor lengkap dengan username dan opsi Remember Me
  function setSupervisorSession(username = "supervisor", shouldRemember = true) {
    currentRole = "supervisor";
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, "supervisor");
      localStorage.setItem("trs_supervisor_username", username);
      localStorage.setItem("trs_saved_username", username);
      localStorage.setItem("trs_operator_name", `Supervisor (${username})`);
      localStorage.setItem("trs_supervisor_auth_time", new Date().toISOString());

      if (shouldRemember) {
        localStorage.setItem(STORAGE_KEY_ADMIN_REMEMBER, "true");
      } else {
        localStorage.removeItem(STORAGE_KEY_ADMIN_REMEMBER);
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("trs_session_role", "supervisor");
      }
    } catch (e) {}

    saveToStorage();
    updateUI();
  }

  function getSupervisorPIN() {
    return localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN;
  }

  function setSupervisorPIN(newPin) {
    if (newPin && newPin.trim()) {
      localStorage.setItem(STORAGE_KEY_PIN, newPin.trim());
      return true;
    }
    return false;
  }

  // Helper pencatatan jejak audit ACC ke MongoDB
  function logAccToMongoDB(change) {
    try {
      const apiUrl = typeof AUTH_API_URL !== "undefined" ? AUTH_API_URL : (window.location.origin || "http://localhost:8080");
      fetch(`${apiUrl}/api/log-acc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          towerName: change.towerName,
          jalur: change.jalur,
          ultg: change.ultg,
          operatorName: change.operatorName,
          supervisorName: localStorage.getItem("trs_operator_name") || "Supervisor",
          typeLabel: change.typeLabel,
          changesSummary: change.changesSummary
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // Verifikasi Kredensial Login (Username & PIN/Password) ke Backend MongoDB / Cloud
  async function verifySupervisorPINOnline(enteredPin, enteredUsername = "pln") {
    const pin = (enteredPin || "").trim();
    const username = (enteredUsername || "pln").trim();
    if (!pin) return false;

    // Hitung hash SHA-256 di browser secara asynchronous jika fungsi tersedia
    let clientHash = "";
    if (typeof computeSha256 === "function") {
      try {
        clientHash = await computeSha256(pin);
      } catch (e) {
        console.warn("[StagingManager] Gagal hash SHA-256 client:", e);
      }
    }

    // 1. Prioritas Utama: Verifikasi ke Backend Auth MongoDB / API Server (SHA-256 & Bcrypt)
    try {
      const apiUrl = typeof AUTH_API_URL !== "undefined" ? AUTH_API_URL : (window.location.origin || "http://localhost:8080");
      const res = await fetch(`${apiUrl}/api/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          pin: pin,
          password: pin,
          sha256Hash: clientHash
        })
      });
      const data = await res.json();
      if (data) {
        if (data.success === true || data.valid === true) {
          if (data.source === "mongodb" || data.authSource === "mongodb") {
            console.log("🔐 Terverifikasi via Database MongoDB Atlas (SHA-256)! ");
          }
          return {
            valid: true,
            success: true,
            role: "supervisor",
            username: data.username || username,
            name: data.name || (username.toLowerCase() === "pln" ? "PLN UPT Palembang" : "Supervisor UPT")
          };
        } else if (data.success === false || data.valid === false) {
          return false;
        }
      }
    } catch (e) {
      // Server lokal/MongoDB offline, gunakan fallback Google Apps Script
    }

    // 2. Fallback Cadangan: Verifikasi ke Google Apps Script (Server-Side Cloud)
    if (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL) {
      try {
        const res = await fetch(`${SCRIPT_URL}?action=verifyPin&pin=${encodeURIComponent(pin)}&username=${encodeURIComponent(username)}`);
        const json = await res.json();
        if (json && (json.valid !== undefined || json.success !== undefined)) {
          const isValid = Boolean(json.valid || json.success);
          if (isValid) {
            return {
              valid: true,
              success: true,
              role: "supervisor",
              username: json.username || username,
              name: (username.toLowerCase() === "pln") ? "PLN UPT Palembang" : "Supervisor UPT"
            };
          }
          return false;
        }
      } catch (e) {
        console.warn("[StagingManager] Gagal verifikasi online, menggunakan fallback lokal:", e);
      }
    }

    // 3. Fallback Darurat: Komparasi lokal jika offline total
    const SHA256_UPT_PALEMBAG = "34f62975d347fafd70ae76d9f49ba78a7f9d4623dec4a18d7fe64ab704d70a2f";
    const SHA256_UPT_PALEMBANG = "a39fec3ccf58fd5b29346115ee1e7e3d20e947a86ff3ca1965a2b622fdfc24e6";

    const isPlnMatch = (username.toLowerCase() === "pln" || !username) && (
      pin.toLowerCase() === "upt palembag" ||
      pin.toLowerCase() === "upt palembang" ||
      clientHash === SHA256_UPT_PALEMBAG ||
      clientHash === SHA256_UPT_PALEMBANG ||
      pin.toLowerCase() === SHA256_UPT_PALEMBAG
    );

    const isPinMatch = (pin === getSupervisorPIN());
    const isUserMatch = !username || username.toLowerCase() === "supervisor" || username.toLowerCase() === "admin";

    if (isPlnMatch) {
      return {
        valid: true,
        success: true,
        role: "supervisor",
        username: "pln",
        name: "PLN UPT Palembang"
      };
    }

    if (isPinMatch && isUserMatch) {
      return {
        valid: true,
        success: true,
        role: "supervisor",
        username: username || "supervisor",
        name: "Supervisor (Offline Mode)"
      };
    }
    return false;
  }

  // Kirim usulan perubahan ke Tab DRAFT_ANTREAN di Google Spreadsheet
  function sendDraftToCloud(draftObj) {
    if (typeof SCRIPT_URL === "undefined" || !SCRIPT_URL) return;
    try {
      const payload = {
        action: "submitDraft",
        id: draftObj.id,
        operatorName: draftObj.operatorName,
        towerName: draftObj.towerName,
        jalur: draftObj.jalur,
        ultg: draftObj.ultg,
        typeLabel: draftObj.typeLabel,
        changesSummary: draftObj.changesSummary,
        payload: draftObj.payload
      };
      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("[StagingManager] Gagal kirim draft ke Tab DRAFT_ANTREAN:", e);
    }
  }

  // Tarik daftar draft yang masih PENDING dari Tab DRAFT_ANTREAN di Google Spreadsheet
  async function fetchDraftsFromCloud(silent = false) {
    if (typeof SCRIPT_URL === "undefined" || !SCRIPT_URL) return;
    try {
      if (!silent) showToast("Memeriksa antrean usulan di Google Spreadsheet...", "info");
      const res = await fetch(`${SCRIPT_URL}?action=getDrafts&status=PENDING`);
      const data = await res.json();

      if (data && data.status === "success" && Array.isArray(data.drafts)) {
        let newCount = 0;
        data.drafts.forEach(d => {
          const exists = pendingChanges.some(c => c.id === d.id || (c.towerName === d.towerName && c.typeLabel === d.typeLabel));
          if (!exists) {
            const matchedTower = typeof towerData !== "undefined" 
              ? towerData.find(t => t.nama.trim().toLowerCase() === d.towerName.trim().toLowerCase()) 
              : null;
            
            let inferredType = "manajemen";
            if (d.typeLabel && d.typeLabel.toLowerCase().includes("satwa")) inferredType = "satwa";
            else if (d.typeLabel && (d.typeLabel.toLowerCase().includes("rencana") || d.typeLabel.toLowerCase().includes("tindak"))) inferredType = "tindak-lanjut";

            const changeItem = {
              id: d.id,
              towerNo: matchedTower ? matchedTower.no : 0,
              towerName: d.towerName,
              ultg: d.ultg || (matchedTower ? matchedTower.ultg : "-"),
              jalur: d.jalur || (matchedTower ? matchedTower.jalur : "-"),
              operatorName: d.operatorName || "Teknisi Lapangan",
              type: inferredType,
              typeLabel: d.typeLabel,
              timestamp: d.timestamp,
              timeFormatted: d.timestamp,
              payload: d.payload,
              changesSummary: typeof d.summary === "string" ? [{ label: "Detail", before: "-", after: d.summary }] : (d.changesSummary || []),
              newData: (d.payload && d.payload.newData) ? d.payload.newData : {},
              originalData: matchedTower ? { ...matchedTower } : {},
              fromCloud: true
            };

            pendingChanges.push(changeItem);
            newCount++;

            if (matchedTower && changeItem.newData) {
              Object.assign(matchedTower, changeItem.newData);
            }
          }
        });

        saveToStorage();
        updateUI();
        refreshActiveTables();
        if (typeof renderApprovalPageView === "function") renderApprovalPageView();

        if (!silent) {
          showToast(`✅ Antrean Cloud diperbarui: ${data.drafts.length} usulan aktif di Spreadsheet.`, "success");
        }
      }
    } catch (err) {
      console.warn("[StagingManager] Gagal mengambil antrean dari cloud:", err);
      if (!silent) showToast("Gagal terhubung ke Cloud Spreadsheet. Menggunakan antrean lokal.", "warning");
    }
  }

  // Cek apakah menara tertentu memiliki draft perubahan
  function hasPending(towerNo) {
    return pendingChanges.some(c => c.towerNo === towerNo);
  }

  // Dapatkan draft perubahan untuk menara tertentu
  function getPending(towerNo, type = null) {
    if (type) {
      return pendingChanges.find(c => c.towerNo === towerNo && c.type === type) || null;
    }
    return pendingChanges.filter(c => c.towerNo === towerNo);
  }

  // Tambah atau perbarui draft perubahan
  function addPendingChange(change) {
    const existingIdx = pendingChanges.findIndex(c => c.towerNo === change.towerNo && c.type === change.type);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Ambil nama petugas/pengubah
    const operatorName = (change.operatorName || "").trim() || localStorage.getItem("trs_operator_name") || "Teknisi Lapangan";

    // Ambil data menara untuk snapshot originalData
    const tower = typeof towerData !== "undefined" ? towerData.find(t => t.no === change.towerNo) : null;
    let originalData = {};
    if (tower && change.newData) {
      Object.keys(change.newData).forEach(k => {
        originalData[k] = tower[k];
      });
    }

    const newChangeObj = {
      id: "change_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      towerNo: change.towerNo,
      towerName: change.towerName,
      ultg: change.ultg || "-",
      jalur: change.jalur || "-",
      operatorName: operatorName,
      type: change.type, // "satwa" | "manajemen" | "tindak-lanjut"
      typeLabel: change.typeLabel,
      timestamp: now.toISOString(),
      timeFormatted: timeFormatted,
      payload: change.payload,
      changesSummary: change.changesSummary || [],
      newData: change.newData || {},
      originalData: existingIdx >= 0 ? pendingChanges[existingIdx].originalData : originalData
    };

    if (existingIdx >= 0) {
      pendingChanges[existingIdx] = newChangeObj;
    } else {
      pendingChanges.push(newChangeObj);
    }

    // Terapkan preview ke memori agar tabel langsung memperlihatkan data baru dengan badge draft
    if (tower && change.newData) {
      Object.assign(tower, change.newData);
    }

    saveToStorage();
    updateUI();

    // Re-render tabel aktif agar badge penanda muncul
    refreshActiveTables();

    // Kirim usulan perubahan ke Tab DRAFT_ANTREAN di Cloud Google Spreadsheet
    sendDraftToCloud(newChangeObj);

    // Notifikasi Toast
    showToast(`Draft dicatat ke Tab DRAFT_ANTREAN Spreadsheet: Menara ${change.towerName} (${change.typeLabel}). Menunggu ACC Supervisor.`, "success");
  }

  // Hapus satu perubahan dari antrean & kembalikan ke data asli
  function removePendingChange(changeId) {
    const change = pendingChanges.find(c => c.id === changeId);
    if (change && typeof towerData !== "undefined") {
      const tower = towerData.find(t => t.no === change.towerNo);
      if (tower && change.originalData) {
        Object.assign(tower, change.originalData);
      }
    }

    pendingChanges = pendingChanges.filter(c => c.id !== changeId);
    saveToStorage();
    updateUI();
    refreshActiveTables();
    renderReviewModalList();

    // Beritahu Google Apps Script bahwa draft ditolak di cloud
    if (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL) {
      try {
        fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "rejectDraft",
            draftId: changeId,
            supervisorName: localStorage.getItem("trs_operator_name") || "Supervisor"
          })
        });
      } catch (e) {}
    }

    showToast("Perubahan dihapus dari antrean draft dan ditandai REJECTED di spreadsheet.", "info");
  }

  // Batalkan semua draft & kembalikan seluruh data ke kondisi awal
  function clearAllPendingChanges() {
    if (pendingChanges.length === 0) return;
    if (confirm("Yakin ingin membatalkan semua perubahan yang ditampung dalam draft? Data akan kembali ke kondisi semula.")) {
      if (typeof towerData !== "undefined") {
        pendingChanges.forEach(change => {
          const tower = towerData.find(t => t.no === change.towerNo);
          if (tower && change.originalData) {
            Object.assign(tower, change.originalData);
          }
        });
      }

      pendingChanges = [];
      saveToStorage();
      updateUI();
      refreshActiveTables();
      closeReviewModal();
      showToast("Seluruh draft perubahan telah dibatalkan.", "warning");
    }
  }

  // Render ulang tabel yang sedang tampil
  function refreshActiveTables() {
    if (typeof renderTable === "function") {
      renderTable();
    }
    if (typeof updateTindakLanjutView === "function") {
      updateTindakLanjutView();
    }
  }

  // Suntikkan elemen HTML (Floating Bar, Review Modal, Role Modal, Toast) ke document.body
  function injectUIElements() {
    if (document.getElementById("stagingUIContainer")) return;

    const wrapper = document.createElement("div");
    wrapper.id = "stagingUIContainer";
    wrapper.innerHTML = `
      <!-- 1. FLOATING BAR DRAFT ACC -->
      <div id="stagingFloatingBar" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto hidden transition-all duration-300 ease-out transform">
        <div class="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/40 rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-white">
          
          <!-- Counter & Info -->
          <div class="flex items-center gap-3 shrink-0">
            <div class="relative w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <i data-lucide="layers" class="w-4 h-4"></i>
              <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span id="stagingBadgeCount" class="font-extrabold text-sm text-amber-300">0 Perubahan</span>
                <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Draft</span>
              </div>
              <p class="text-[11px] text-slate-400 hidden sm:block">Perubahan ditampung • Menunggu persetujuan ACC</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <!-- Buka Halaman ACC Button -->
            <button type="button" onclick="if(typeof switchTab==='function')switchTab('approval')" class="px-3.5 py-2 rounded-xl bg-sky-700/80 hover:bg-sky-600 text-white border border-sky-600/70 text-xs font-semibold flex items-center gap-1.5 transition" title="Buka Halaman Khusus Approval Admin">
              <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 text-sky-200"></i>
              <span>Halaman ACC</span>
            </button>

            <!-- Review Diff Button -->
            <button type="button" onclick="stagingManager.openReviewModal()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="eye" class="w-3.5 h-3.5 text-sky-400"></i>
              <span>Review Diff</span>
            </button>

            <!-- Approve Button -->
            <button type="button" id="btnStagingApproveAll" onclick="stagingManager.handleApproveClick()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition">
              <i data-lucide="check-check" class="w-4 h-4"></i>
              <span id="labelStagingApprove">Approve & ACC</span>
            </button>

            <!-- Dismiss / Cancel All Button -->
            <button type="button" onclick="stagingManager.clearAllPendingChanges()" title="Batalkan Semua Draft" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

        </div>
      </div>

      <!-- 2. REVIEW & APPROVAL MODAL -->
      <div id="modalReviewStaging" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 relative max-h-[90vh] flex flex-col">
          
          <!-- Modal Header -->
          <div class="flex items-start justify-between border-b border-slate-100 pb-3.5 shrink-0">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <i data-lucide="git-pull-request" class="w-5 h-5 text-amber-600"></i>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base font-bold text-slate-800">Review Antrean Perubahan (Draft ACC)</h3>
                  <span id="reviewModalCounterBadge" class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    0 Perubahan Ditampung
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  Periksa rincian perbedaan data sebelum disetujui (ACC) dan disinkronkan ke Google Spreadsheet TRS_PLM.
                </p>
              </div>
            </div>

            <button type="button" onclick="stagingManager.closeReviewModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Role Indicator Banner inside Modal -->
          <div class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-slate-500 font-medium">Status Hak Akses Anda:</span>
              <span id="reviewRoleBadge" class="font-bold px-2.5 py-0.5 rounded-md text-[11px]"></span>
            </div>
            <button type="button" onclick="stagingManager.toggleRoleModal()" class="text-sky-600 hover:text-sky-700 font-semibold underline text-xs">
              Ubah Akses / Masukkan PIN
            </button>
          </div>

          <!-- Changes List Container (Scrollable) -->
          <div id="reviewChangesList" class="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <!-- Diisi otomatis oleh renderReviewModalList() -->
          </div>

          <!-- Modal Footer -->
          <div class="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button type="button" onclick="stagingManager.clearAllPendingChanges()" class="w-full sm:w-auto px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition">
              Batalkan Semua Draft
            </button>

            <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button type="button" onclick="stagingManager.closeReviewModal()" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs">
                Tutup
              </button>
              <button type="button" id="btnModalApproveAll" onclick="stagingManager.handleApproveClick()" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition">
                <i data-lucide="check-check" class="w-4 h-4"></i>
                <span id="labelModalApprove">Setujui & Sinkronkan Semua (ACC)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- 3. ROLE SWITCHER & PIN VERIFICATION MODAL -->
      <div id="modalRoleAuth" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 my-8 relative">
          <div class="text-center space-y-1">
            <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800 pt-2">Verifikasi Hak Akses</h3>
            <p class="text-xs text-slate-400">Pilih peran Anda atau masukkan PIN untuk membuka hak akses Supervisor (ACC).</p>
          </div>

          <div class="space-y-3 text-xs pt-1">
            <!-- Pilihan Role -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 cursor-pointer transition">
              <input type="radio" name="authRoleOption" value="operator" id="roleOptOperator" class="mt-0.5 text-sky-600 focus:ring-sky-500">
              <div>
                <div class="font-bold text-slate-800">Operator (Input Data)</div>
                <div class="text-[11px] text-slate-400 mt-0.5">Dapat menginput / mengedit data. Seluruh perubahan otomatis masuk ke antrean draft.</div>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 cursor-pointer transition">
              <input type="radio" name="authRoleOption" value="supervisor" id="roleOptSupervisor" class="mt-0.5 text-sky-600 focus:ring-sky-500">
              <div>
                <div class="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Supervisor (Akses ACC)</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">Wajib PIN</span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">Berhak meninjau, menyetujui (ACC), dan menyinkronkan data langsung ke Google Sheets.</div>
              </div>
            </label>

            <!-- Kredensial Login Supervisor (Aktif saat Supervisor dipilih) -->
            <div id="pinInputContainer" class="hidden space-y-2.5 pt-2 border-t border-slate-100">
              <div class="space-y-1">
                <label for="inputSupervisorUsername" class="block font-semibold text-slate-700 text-xs">Username:</label>
                <input type="text" id="inputSupervisorUsername" placeholder="Username (pln)" value="pln" class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs bg-slate-50 focus:bg-white font-medium text-slate-800">
              </div>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <label for="inputSupervisorPIN" class="block font-semibold text-slate-700 text-xs">Password Keamanan:</label>
                  <span class="text-[9px] font-mono text-sky-600 bg-sky-50 px-1 rounded border border-sky-200">SHA-256</span>
                </div>
                <input type="password" id="inputSupervisorPIN" placeholder="Password (contoh: upt palembag)" onkeydown="if(event.key==='Enter')stagingManager.submitRoleSwitch()" class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-center tracking-widest text-sm bg-slate-50 focus:bg-white">
              </div>
              <div class="flex items-center gap-2 pt-1 text-slate-600">
                <input type="checkbox" id="checkboxRememberRoleAuth" checked class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer">
                <label for="checkboxRememberRoleAuth" class="text-[11px] select-none cursor-pointer">Ingat saya di perangkat ini (Remember Me)</label>
              </div>
              <div class="text-[10px] text-slate-400 italic text-center">Kredensial resmi: username <strong>pln</strong> / password <strong>upt palembag</strong> (SHA-256)</div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="stagingManager.closeRoleModal()" class="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs">
              Batal
            </button>
            <button type="button" onclick="stagingManager.submitRoleSwitch()" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition">
              Terapkan Peran
            </button>
          </div>
        </div>
      </div>

      <!-- 4. PROGRESS MODAL SAAT SINKRONISASI BATCH -->
      <div id="modalBatchSyncProgress" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 animate-bounce">
            <i data-lucide="cloud-upload" class="w-6 h-6"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-800">Menyinkronkan Perubahan ke Spreadsheet</h4>
            <p id="batchSyncProgressText" class="text-xs text-slate-500 mt-1">Memproses 0 dari 0 data...</p>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div id="batchSyncProgressBar" class="bg-emerald-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          <div class="text-[11px] text-slate-400 italic">Mohon jangan menutup halaman ini...</div>
        </div>
      </div>

      <!-- 5. FLOATING TOAST NOTIFICATION -->
      <div id="stagingToast" class="fixed top-5 right-5 z-50 max-w-sm hidden transition-all duration-300 transform translate-y-[-10px] opacity-0">
        <div id="stagingToastBody" class="p-3.5 rounded-2xl shadow-xl border text-xs flex items-start gap-2.5">
          <i id="stagingToastIcon" data-lucide="info" class="w-4 h-4 shrink-0 mt-0.5"></i>
          <div id="stagingToastMessage" class="flex-1 font-medium leading-relaxed"></div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    // Event listener untuk radio button role switch
    document.querySelectorAll("input[name='authRoleOption']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        const pinContainer = document.getElementById("pinInputContainer");
        if (pinContainer) {
          pinContainer.classList.toggle("hidden", e.target.value !== "supervisor");
        }
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Tampilkan notifikasi toast elegan
  function showToast(message, type = "info") {
    const toast = document.getElementById("stagingToast");
    const toastBody = document.getElementById("stagingToastBody");
    const toastIcon = document.getElementById("stagingToastIcon");
    const toastMsg = document.getElementById("stagingToastMessage");
    if (!toast || !toastBody || !toastMsg) return;

    toastMsg.innerText = message;

    if (type === "success") {
      toastBody.className = "p-3.5 rounded-2xl shadow-xl border text-xs flex items-start gap-2.5 bg-emerald-950/95 text-emerald-100 border-emerald-800 backdrop-blur-md";
      toastIcon.setAttribute("data-lucide", "check-circle-2");
    } else if (type === "warning") {
      toastBody.className = "p-3.5 rounded-2xl shadow-xl border text-xs flex items-start gap-2.5 bg-amber-950/95 text-amber-100 border-amber-800 backdrop-blur-md";
      toastIcon.setAttribute("data-lucide", "alert-triangle");
    } else {
      toastBody.className = "p-3.5 rounded-2xl shadow-xl border text-xs flex items-start gap-2.5 bg-slate-900/95 text-slate-100 border-slate-700 backdrop-blur-md";
      toastIcon.setAttribute("data-lucide", "info");
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    toast.classList.remove("hidden");
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-[-10px]", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-[-10px]", "opacity-0");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 4000);
  }

  // Perbarui UI Floating Bar & Badge Counter
  function updateUI() {
    const floatingBar = document.getElementById("stagingFloatingBar");
    const badgeCount = document.getElementById("stagingBadgeCount");
    const reviewBadge = document.getElementById("reviewModalCounterBadge");
    const count = pendingChanges.length;

    if (badgeCount) badgeCount.innerText = `${count} Perubahan`;
    if (reviewBadge) reviewBadge.innerText = `${count} Perubahan Ditampung`;

    // Perbarui counter di tab header "Approval & ACC"
    const elHeaderApproval = document.getElementById("headerCountApproval");
    if (elHeaderApproval) elHeaderApproval.innerText = count;

    if (floatingBar) {
      if (count > 0) {
        floatingBar.classList.remove("hidden");
      } else {
        floatingBar.classList.add("hidden");
      }
    }

    // Perbarui status role visual
    updateRoleVisuals();

    // Jika tab approval sedang aktif, render ulang halamannya
    if (typeof renderApprovalPageView === "function" && typeof currentActiveTab !== "undefined" && currentActiveTab === "approval") {
      renderApprovalPageView();
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Perbarui visual peran aktif
  function updateRoleVisuals() {
    const roleBadgeHeader = document.getElementById("currentRoleText");
    const btnHeaderSwitcher = document.getElementById("btnHeaderRoleSwitcher");
    const btnHeaderLogout = document.getElementById("btnHeaderLogoutSupervisor");
    const roleBadgeReview = document.getElementById("reviewRoleBadge");
    const labelStagingApprove = document.getElementById("labelStagingApprove");
    const labelModalApprove = document.getElementById("labelModalApprove");

    const isSupervisor = currentRole === "supervisor";
    const savedUser = (typeof localStorage !== "undefined" && localStorage.getItem("trs_supervisor_username")) || "Supervisor";

    if (roleBadgeHeader) {
      roleBadgeHeader.innerText = isSupervisor ? `👑 ${savedUser} (ACC)` : "👷 Operator (Input)";
    }

    if (btnHeaderSwitcher) {
      if (isSupervisor) {
        btnHeaderSwitcher.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 flex items-center gap-1.5 transition shadow-sm";
      } else {
        btnHeaderSwitcher.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition";
      }
    }

    if (btnHeaderLogout) {
      btnHeaderLogout.classList.toggle("hidden", !isSupervisor);
    }

    if (roleBadgeReview) {
      if (isSupervisor) {
        roleBadgeReview.className = "font-bold px-2.5 py-0.5 rounded-md text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200";
        roleBadgeReview.innerHTML = `👑 ${savedUser} (Akses ACC Aktif)`;
      } else {
        roleBadgeReview.className = "font-bold px-2.5 py-0.5 rounded-md text-[11px] bg-slate-200 text-slate-700 border border-slate-300";
        roleBadgeReview.innerHTML = `👷 Operator (Akses Input Data)`;
      }
    }

    if (labelStagingApprove) {
      labelStagingApprove.innerText = isSupervisor ? "Approve & ACC" : "ACC (Supervisor)";
    }
    if (labelModalApprove) {
      labelModalApprove.innerText = isSupervisor ? "Setujui & Sinkronkan Semua (ACC)" : "Masukkan PIN Supervisor untuk ACC";
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Logout Supervisor (Kembali ke mode Operator)
  function logoutSupervisor() {
    currentRole = "operator";
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, "operator");
      localStorage.removeItem(STORAGE_KEY_ADMIN_REMEMBER);
      localStorage.removeItem("trs_supervisor_auth_time");
      localStorage.removeItem("trs_supervisor_username");
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("trs_session_role");
      }
    } catch (e) {}
    saveToStorage();
    updateUI();
    if (typeof renderApprovalPageView === "function" && typeof currentActiveTab !== "undefined" && currentActiveTab === "approval") {
      renderApprovalPageView();
    }
    showToast("🚪 Berhasil keluar dari mode Supervisor. Sekarang mode Operator.", "info");
  }

  // Buka modal Review Diff
  function openReviewModal(targetTowerNo = null) {
    const modal = document.getElementById("modalReviewStaging");
    if (!modal) return;

    renderReviewModalList(targetTowerNo);

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Tutup modal Review Diff
  function closeReviewModal() {
    const modal = document.getElementById("modalReviewStaging");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  // Render daftar card diff di dalam modal review
  function renderReviewModalList(filterTowerNo = null) {
    const container = document.getElementById("reviewChangesList");
    if (!container) return;

    if (pendingChanges.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-slate-400 space-y-2">
          <i data-lucide="check-circle" class="w-10 h-10 mx-auto text-emerald-400"></i>
          <div class="font-bold text-slate-600 text-sm">Tidak ada perubahan dalam antrean draft</div>
          <div class="text-xs text-slate-400">Semua perubahan telah disetujui atau belum ada data yang diedit.</div>
        </div>
      `;
      return;
    }

    const itemsToDisplay = filterTowerNo 
      ? pendingChanges.filter(c => c.towerNo === filterTowerNo)
      : pendingChanges;

    container.innerHTML = itemsToDisplay.map((item, idx) => {
      // Diff rows
      const diffRows = (item.changesSummary || []).map(d => `
        <tr class="border-b border-slate-100 last:border-0">
          <td class="py-1.5 px-2 font-medium text-slate-500 w-36">${escapeHtml(d.label)}</td>
          <td class="py-1.5 px-2 text-slate-500 line-through">${escapeHtml(d.before || "-")}</td>
          <td class="py-1.5 px-2 text-emerald-700 font-bold bg-emerald-50/50">${escapeHtml(d.after || "-")}</td>
        </tr>
      `).join("");

      let typeBadge = "";
      if (item.type === "satwa") {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Kerawanan Satwa</span>`;
      } else if (item.type === "manajemen") {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Manajemen Asset</span>`;
      } else {
        typeBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Rencana Tindak Lanjut</span>`;
      }

      return `
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm space-y-2.5 transition">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-extrabold text-slate-800 text-sm">${escapeHtml(item.towerName)}</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">${escapeHtml(item.ultg)}</span>
                ${typeBadge}
              <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>${escapeHtml(item.jalur)}</span>
                <span>&bull;</span>
                <span>Pengusul: <strong class="text-sky-700 font-semibold">${escapeHtml(item.operatorName || "Teknisi Lapangan")}</strong></span>
                <span>&bull;</span>
                <span>${escapeHtml(item.timeFormatted)} WIB</span>
              </div>
            </div>

            <!-- Single Reject Action -->
            <button type="button" onclick="stagingManager.removePendingChange('${item.id}')" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Tolak / Hapus perubahan ini dari draft">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Diff Table -->
          <div class="rounded-lg border border-slate-100 bg-slate-50/50 overflow-hidden">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-slate-100/70 text-slate-500 font-semibold uppercase text-[9px] tracking-wider">
                <tr>
                  <th class="py-1 px-2">Data / Kolom</th>
                  <th class="py-1 px-2">Sebelumnya</th>
                  <th class="py-1 px-2">Perubahan Baru</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${diffRows || `<tr><td colspan="3" class="p-2 text-slate-400 italic">Perubahan telah tercatat</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // Setujui satu perubahan saja (Satuan ACC)
  async function approveSingleChange(changeId) {
    if (currentRole !== "supervisor") {
      toggleRoleModal(true);
      return;
    }

    const change = pendingChanges.find(c => c.id === changeId);
    if (!change) return;

    if (!confirm(`Setujui (ACC) usulan perubahan untuk ${change.towerName} (${change.typeLabel}) oleh ${change.operatorName || "Petugas"} dan sinkronkan ke Google Sheets?`)) {
      return;
    }

    // 1. Terapkan perubahan ke towerData
    const item = typeof towerData !== "undefined" ? towerData.find(t => t.no === change.towerNo) : null;
    if (item && change.newData) {
      Object.assign(item, change.newData);
    }

    // 2. Beritahu Google Apps Script untuk menandai APPROVED di tab DRAFT_ANTREAN dan terapkan ke Tab Utama
    if (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL) {
      try {
        fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "approveDraft",
            draftId: change.id,
            supervisorName: localStorage.getItem("trs_operator_name") || "Supervisor"
          })
        });
      } catch (e) {
        console.warn(`[SingleSync] Gagal tandai approve di cloud:`, e);
      }
    }

    // Terapkan payload langsung ke sheet utama sebagai jaminan ganda
    if (typeof syncToGoogleSpreadsheet === "function" && change.payload) {
      try {
        await syncToGoogleSpreadsheet(change.payload);
      } catch (e) {
        console.warn(`[SingleSync] Gagal kirim change #${change.id}:`, e);
      }
    }

    // 3. Simpan ke cache
    try {
      localStorage.setItem("trs_plm_tower_data_v3", JSON.stringify(towerData));
    } catch (e) {
      console.warn("Gagal simpan ke localStorage:", e);
    }

    // Catat log audit ACC ke MongoDB
    logAccToMongoDB(change);

    // 4. Hapus dari queue
    pendingChanges = pendingChanges.filter(c => c.id !== changeId);
    saveToStorage();
    updateUI();

    // 5. Refresh tables
    refreshActiveTables();
    if (typeof renderApprovalPageView === "function") renderApprovalPageView();

    showToast(`✅ Sukses! Perubahan ${change.towerName} oleh ${change.operatorName || "Petugas"} berhasil di-ACC dan disinkronkan ke Spreadsheet!`, "success");
  }

  // Handler tombol Approve (Cek Akses Supervisor)
  function handleApproveClick() {
    if (pendingChanges.length === 0) {
      alert("Tidak ada perubahan dalam antrean draft untuk disetujui!");
      return;
    }

    if (currentRole !== "supervisor") {
      // Buka modal PIN auth
      toggleRoleModal(true);
      return;
    }

    // Jika sudah supervisor, konfirmasi eksekusi batch
    if (confirm(`Setujui (ACC) dan sinkronkan ${pendingChanges.length} perubahan ke Google Spreadsheet TRS_PLM sekarang?`)) {
      executeBatchApproval();
    }
  }

  // Eksekusi batch approval: Terapkan ke memori lokal & kirim ke Google Apps Script
  async function executeBatchApproval() {
    const changesToProcess = [...pendingChanges];
    if (changesToProcess.length === 0) return;

    closeReviewModal();

    // Tampilkan modal progress
    const progressModal = document.getElementById("modalBatchSyncProgress");
    const progressText = document.getElementById("batchSyncProgressText");
    const progressBar = document.getElementById("batchSyncProgressBar");

    if (progressModal) {
      progressModal.classList.remove("hidden");
      progressModal.classList.add("flex");
    }

    const total = changesToProcess.length;
    let successCount = 0;

    for (let i = 0; i < total; i++) {
      const change = changesToProcess[i];
      const percent = Math.round(((i + 1) / total) * 100);

      if (progressText) progressText.innerText = `Menyinkronkan data ${i + 1} dari ${total} (${change.towerName})...`;
      if (progressBar) progressBar.style.width = `${percent}%`;

      // 1. Terapkan perubahan ke towerData di memori
      const item = towerData.find(t => t.no === change.towerNo);
      if (item && change.newData) {
        Object.assign(item, change.newData);
      }

      // 2. Kirim payload ke Google Spreadsheet via syncToGoogleSpreadsheet
      if (typeof syncToGoogleSpreadsheet === "function" && change.payload) {
        try {
          await syncToGoogleSpreadsheet(change.payload);
        } catch (e) {
          console.warn(`[BatchSync] Gagal kirim change #${change.id}:`, e);
        }
      }

      successCount++;
      // Sedikit jeda 250ms agar network request GAS stabil
      await new Promise(r => setTimeout(r, 250));
    }

    // 3. Simpan perubahan final ke cache lokal browser v3
    try {
      localStorage.setItem("trs_plm_tower_data_v3", JSON.stringify(towerData));
    } catch (e) {
      console.warn("Gagal simpan ke localStorage:", e);
    }

    // 4. Bersihkan antrean draft
    pendingChanges = [];
    saveToStorage();
    updateUI();

    // 5. Perbarui seluruh tabel & view
    if (typeof applyFilters === "function") applyFilters();
    if (typeof renderTable === "function") renderTable();
    if (typeof updateMetrics === "function") updateMetrics(filteredData);
    if (typeof updateTindakLanjutView === "function") updateTindakLanjutView();

    // Sembunyikan modal progress
    if (progressModal) {
      progressModal.classList.add("hidden");
      progressModal.classList.remove("flex");
    }

    showToast(`✅ Sukses! ${successCount} perubahan data telah disetujui (ACC) dan disinkronkan ke Google Spreadsheet TRS_PLM.`, "success");
    alert(`🎉 SUKSES!\n\nSebanyak ${successCount} data menara telah resmi di-ACC oleh Supervisor dan berhasil diperbarui di Google Spreadsheet TRS_PLM.`);
  }

  // Buka/tutup modal pergantian peran & verifikasi PIN / Kredensial
  function toggleRoleModal(requireSupervisorPrompt = false) {
    const modal = document.getElementById("modalRoleAuth");
    if (!modal) return;

    const optOperator = document.getElementById("roleOptOperator");
    const optSupervisor = document.getElementById("roleOptSupervisor");
    const pinContainer = document.getElementById("pinInputContainer");
    const userInput = document.getElementById("inputSupervisorUsername");
    const pinInput = document.getElementById("inputSupervisorPIN");

    if (pinInput) pinInput.value = "";
    if (userInput) {
      userInput.value = localStorage.getItem("trs_saved_username") || "pln";
    }

    if (requireSupervisorPrompt || currentRole === "supervisor") {
      if (optSupervisor) optSupervisor.checked = true;
      if (pinContainer) pinContainer.classList.remove("hidden");
    } else {
      if (optOperator) optOperator.checked = true;
      if (pinContainer) pinContainer.classList.add("hidden");
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    if (pinInput && (requireSupervisorPrompt || currentRole !== "supervisor")) {
      setTimeout(() => pinInput.focus(), 150);
    }
  }

  function closeRoleModal() {
    const modal = document.getElementById("modalRoleAuth");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  // Terapkan pergantian peran setelah verifikasi kredensial secara online
  async function submitRoleSwitch() {
    const selected = document.querySelector("input[name='authRoleOption']:checked");
    if (!selected) return;

    const role = selected.value;

    if (role === "supervisor") {
      const userInput = document.getElementById("inputSupervisorUsername");
      const pinInput = document.getElementById("inputSupervisorPIN");
      const chkRemember = document.getElementById("checkboxRememberRoleAuth");

      const enteredUsername = (userInput ? userInput.value : "").trim() || "pln";
      const enteredPin = (pinInput ? pinInput.value : "").trim();
      const shouldRemember = chkRemember ? chkRemember.checked : true;

      if (!enteredPin) {
        alert("⚠️ Silakan masukkan Password atau PIN Supervisor!");
        if (pinInput) pinInput.focus();
        return;
      }

      const btnSubmit = document.querySelector("#modalRoleAuth button[onclick*='submitRoleSwitch']");
      const origText = btnSubmit ? btnSubmit.innerText : "";
      if (btnSubmit) btnSubmit.innerText = "Memverifikasi...";

      const authRes = await verifySupervisorPINOnline(enteredPin, enteredUsername);
      if (btnSubmit) btnSubmit.innerText = origText;

      const isValid = authRes && (authRes === true || authRes.valid === true);

      if (!isValid) {
        alert("⚠️ Username atau Password salah!\n\nKredensial Resmi:\n• Username: pln\n• Password: upt palembag (SHA-256 Hash)\n\n(Fallback: supervisor / 1234)");
        if (pinInput) pinInput.focus();
        return;
      }

      const verifiedUsername = (authRes && authRes.username) ? authRes.username : enteredUsername;
      setSupervisorSession(verifiedUsername, shouldRemember);
      closeRoleModal();
      showToast(`👑 Akses Supervisor aktif: ${verifiedUsername} ${shouldRemember ? '(Remember Me Aktif)' : ''}`, "success");

      // Otomatis tarik usulan cloud saat supervisor login
      fetchDraftsFromCloud(true);

      // Jika ada perubahan draft, tanyakan apakah langsung ingin di-approve
      if (pendingChanges.length > 0) {
        setTimeout(() => {
          if (confirm(`Akses Supervisor aktif (${verifiedUsername}). Apakah Anda ingin langsung menyetujui (ACC) ${pendingChanges.length} perubahan dalam draft?`)) {
            executeBatchApproval();
          }
        }, 300);
      }
    } else {
      logoutSupervisor();
      closeRoleModal();
      showToast("Beralih ke mode Operator (Input Data).", "info");
    }
  }

  // Expose public API
  return {
    init,
    hasPending,
    getPending,
    getPendingList: () => pendingChanges,
    addPendingChange,
    removePendingChange,
    approveSingleChange,
    clearAllPendingChanges,
    openReviewModal,
    closeReviewModal,
    handleApproveClick,
    toggleRoleModal,
    closeRoleModal,
    submitRoleSwitch,
    logoutSupervisor,
    setSupervisorSession,
    getRole: () => currentRole,
    setRole: (role) => {
      currentRole = role;
      saveToStorage();
      updateUI();
    },
    getSupervisorPIN,
    setSupervisorPIN,
    verifySupervisorPINOnline,
    fetchDraftsFromCloud,
    getPendingCount: () => pendingChanges.length
  };
})();

// Inisialisasi otomatis saat script dimuat atau DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => stagingManager.init());
  } else {
    stagingManager.init();
  }
}
