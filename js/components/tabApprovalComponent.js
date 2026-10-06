/**
 * KOMPONEN TAB 5: HALAMAN KHUSUS APPROVAL & ACC ADMIN / SUPERVISOR
 * PLN UPT Palembang
 * 
 * Halaman khusus untuk meninjau usulan perubahan data dari teknisi/operator:
 * - Menampilkan nama petugas yang melakukan perubahan
 * - Menampilkan diff sebelum vs sesudah
 * - Aksi ACC (Setujui) satuan atau massal (Batch)
 * - Aksi Tolak (Batalkan) satuan atau massal
 */

let approvalFilterType = "all"; // "all" | "satwa" | "manajemen" | "tindak-lanjut"
let approvalSearchQuery = "";

function renderApprovalPageView() {
  const container = document.getElementById("viewApproval");
  if (!container) return;

  const isSupervisor = typeof stagingManager !== "undefined" && stagingManager.getRole() === "supervisor";
  const pendingList = typeof stagingManager !== "undefined" ? stagingManager.getPendingList() : [];
  const savedUsername = (typeof localStorage !== "undefined" && (localStorage.getItem("trs_supervisor_username") || localStorage.getItem("trs_saved_username"))) || "pln";

  // Jika bukan supervisor, tampilkan halaman Login Portal Khusus Approval
  if (!isSupervisor) {
    container.innerHTML = `
      <div class="max-w-md mx-auto my-8 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl text-center space-y-6">
        <!-- Badge & Header Brand -->
        <div class="text-center space-y-2">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-500/25">
            <i data-lucide="shield-check" class="w-8 h-8"></i>
          </div>
          <h2 class="text-xl font-bold text-slate-800 tracking-tight">Portal Login Supervisor & ACC</h2>
          <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Masuk dengan akun verifikator untuk membuka hak akses persetujuan (ACC) usulan perubahan data menara.
          </p>
        </div>

        <!-- Form Login -->
        <form onsubmit="event.preventDefault(); submitPageSupervisorAuth();" class="space-y-4 text-left">
          <!-- Username Field -->
          <div class="space-y-1.5">
            <label for="inputPageSupervisorUsername" class="block text-xs font-semibold text-slate-700">
              Username:
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="user" class="w-4 h-4"></i>
              </div>
              <input 
                type="text" 
                id="inputPageSupervisorUsername" 
                placeholder="Username (contoh: pln)" 
                value="${savedUsername}" 
                autocomplete="username"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-slate-50/50 hover:bg-white focus:bg-white font-medium text-slate-800"
                required
              >
            </div>
          </div>

          <!-- Password / PIN Field -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="inputPageSupervisorPIN" class="block text-xs font-semibold text-slate-700">
                Password:
              </label>
              <span class="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">upt palembag</span>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="lock" class="w-4 h-4"></i>
              </div>
              <input 
                type="password" 
                id="inputPageSupervisorPIN" 
                placeholder="Password (contoh: upt palembag)" 
                autocomplete="current-password"
                class="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-slate-50/50 hover:bg-white focus:bg-white font-mono tracking-wider text-slate-800"
                required
              >
              <button 
                type="button" 
                id="btnTogglePasswordVis"
                onclick="toggleApprovalPasswordVisibility()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                tabindex="-1"
                title="Tampilkan / Sembunyikan Password"
              >
                <i id="iconTogglePassword" data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                id="checkboxRememberAdmin" 
                checked 
                class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
              >
              <span class="text-xs text-slate-700 font-medium">Ingat Saya (Remember Me)</span>
            </label>
            <span class="text-[10px] text-slate-400">Tetap login saat browser ditutup</span>
          </div>

          <!-- Quick Credential Pill for Convenience -->
          <div class="p-2.5 rounded-xl bg-sky-50/80 border border-sky-100 flex items-center justify-between text-[11px] text-sky-800">
            <div class="flex items-center gap-1.5">
              <i data-lucide="key-round" class="w-3.5 h-3.5 text-sky-600 shrink-0"></i>
              <span>Kredensial Login: <strong>pln</strong> / Password: <strong>upt palembag</strong></span>
            </div>
            <button 
              type="button" 
              onclick="fillDefaultSupervisorCredentials()" 
              class="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline ml-2 shrink-0 cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="btnSubmitSupervisorLogin"
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition transform active:scale-[0.99] cursor-pointer"
          >
            <i data-lucide="log-in" class="w-4 h-4"></i>
            <span>Masuk ke Dashboard Approval</span>
          </button>
        </form>

        <!-- Security Footer -->
        <div class="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <i data-lucide="database" class="w-3.5 h-3.5 text-emerald-600"></i>
          <span>Autentikasi terhubung ke <strong>Database Cloud MongoDB Atlas</strong></span>
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
    return;
  }

  // JIKA SUDAH SUPERVISOR: Tampilkan Dashboard Approval Lengkap
  const countTotal = pendingList.length;
  const countSatwa = pendingList.filter(c => c.type === "satwa").length;
  const countManajemen = pendingList.filter(c => c.type === "manajemen").length;
  const countTindak = pendingList.filter(c => c.type === "tindak-lanjut").length;

  // Filter data sesuai kriteria
  let filteredPending = pendingList;
  if (approvalFilterType !== "all") {
    filteredPending = filteredPending.filter(c => c.type === approvalFilterType);
  }
  if (approvalSearchQuery) {
    const q = approvalSearchQuery.toLowerCase();
    filteredPending = filteredPending.filter(c => 
      (c.towerName && c.towerName.toLowerCase().includes(q)) ||
      (c.operatorName && c.operatorName.toLowerCase().includes(q)) ||
      (c.jalur && c.jalur.toLowerCase().includes(q)) ||
      (c.ultg && c.ultg.toLowerCase().includes(q))
    );
  }

  container.innerHTML = `
    <div class="space-y-5">
      
      <!-- 1. HEADER HERO PANEL -->
      <div class="bg-gradient-to-r from-slate-900 via-[#0e274d] to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <i data-lucide="check-check" class="w-7 h-7"></i>
            </div>
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Pusat Persetujuan & Verifikasi Data (Halaman ACC)
                </h1>
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                  <span>👑 ${savedUsername} (ACC Aktif)</span>
                </span>
                <span class="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-sky-500/20 text-sky-200 border border-sky-500/30 flex items-center gap-1" title="PIN diverifikasi via MongoDB Backend">
                  <i data-lucide="database" class="w-3 h-3 text-sky-400"></i>
                  <span>MongoDB Auth</span>
                </span>
                <button type="button" onclick="stagingManager.logoutSupervisor()" class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition" title="Logout & Kunci kembali akses approval">
                  <i data-lucide="log-out" class="w-3 h-3"></i>
                  <span>Logout</span>
                </button>
              </div>
              <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Tinjau usulan perubahan data menara yang diajukan oleh teknisi/operator sebelum disetujui (ACC) dan disinkronkan ke Google Spreadsheet TRS_PLM.
              </p>
            </div>
          </div>

          <!-- SUMMARY COUNTERS PILLS -->
          <div class="flex items-center gap-2.5 flex-wrap shrink-0">
            <div class="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center min-w-[90px]">
              <div class="text-lg font-extrabold text-amber-400">${countTotal}</div>
              <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Usulan</div>
            </div>
            <div class="px-3 py-2.5 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-center min-w-[85px]">
              <div class="text-lg font-extrabold text-purple-300">${countSatwa}</div>
              <div class="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Satwa</div>
            </div>
            <div class="px-3 py-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-center min-w-[85px]">
              <div class="text-lg font-extrabold text-emerald-300">${countManajemen}</div>
              <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Aset E-Z</div>
            </div>
            <div class="px-3 py-2.5 rounded-2xl bg-sky-950/60 border border-sky-800/60 text-center min-w-[85px]">
              <div class="text-lg font-extrabold text-sky-300">${countTindak}</div>
              <div class="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Rencana</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. FILTER & ACTION TOOLBAR -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        
        <!-- Filter Tabs & Search -->
        <div class="flex flex-wrap items-center gap-2.5 flex-1">
          <!-- Type Filter Buttons -->
          <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button onclick="setApprovalFilterType('all')" class="px-3 py-1.5 rounded-lg transition ${approvalFilterType === 'all' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}">
              Semua (${countTotal})
            </button>
            <button onclick="setApprovalFilterType('satwa')" class="px-3 py-1.5 rounded-lg transition ${approvalFilterType === 'satwa' ? 'bg-white text-purple-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}">
              Satwa (${countSatwa})
            </button>
            <button onclick="setApprovalFilterType('manajemen')" class="px-3 py-1.5 rounded-lg transition ${approvalFilterType === 'manajemen' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}">
              Aset E–Z (${countManajemen})
            </button>
            <button onclick="setApprovalFilterType('tindak-lanjut')" class="px-3 py-1.5 rounded-lg transition ${approvalFilterType === 'tindak-lanjut' ? 'bg-white text-sky-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}">
              Rencana (${countTindak})
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative flex-1 min-w-[220px]">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
            <input type="text" id="approvalSearchInput" oninput="onApprovalSearchInput(this.value)" value="${approvalSearchQuery}" placeholder="Cari nama menara / pengubah / jalur..." 
                   class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700 text-xs">
          </div>
        </div>

        <!-- Global Batch Actions -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          <button type="button" onclick="stagingManager.fetchDraftsFromCloud(false)" 
                  class="px-3 py-2 rounded-xl border border-sky-200 text-sky-700 bg-sky-50/60 hover:bg-sky-100 font-semibold transition flex items-center gap-1.5" title="Tarik usulan terbaru dari Tab DRAFT_ANTREAN Spreadsheet">
            <i data-lucide="cloud-download" class="w-3.5 h-3.5 text-sky-600"></i>
            <span>Tarik Antrean Cloud</span>
          </button>

          <button type="button" onclick="stagingManager.clearAllPendingChanges()" ${countTotal === 0 ? 'disabled' : ''} 
                  class="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Tolak Semua</span>
          </button>

          <button type="button" onclick="stagingManager.handleApproveClick()" ${countTotal === 0 ? 'disabled' : ''} 
                  class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-700/20 transition flex items-center gap-2">
            <i data-lucide="check-check" class="w-4 h-4"></i>
            <span>Setujui & Sinkronkan Semua (${countTotal})</span>
          </button>
        </div>

      </div>

      <!-- 3. LIST USULAN PERUBAHAN -->
      <div class="space-y-3.5">
        ${renderPendingCardsHtml(filteredPending)}
      </div>

    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Render HTML daftar kartu usulan perubahan
function renderPendingCardsHtml(list) {
  if (list.length === 0) {
    return `
      <div class="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center mx-auto">
          <i data-lucide="check-circle-2" class="w-8 h-8"></i>
        </div>
        <h3 class="text-base font-bold text-slate-800">Semua Data Sudah Di-ACC!</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          Tidak ada usulan perubahan yang sedang menunggu persetujuan saat ini. Setiap data yang diedit oleh teknisi/operator akan muncul di sini.
        </p>
      </div>
    `;
  }

  return list.map((item, idx) => {
    let typeBadge = "";
    if (item.type === "satwa") {
      typeBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Kerawanan Satwa (Kolom AL & AM)</span>`;
    } else if (item.type === "manajemen") {
      typeBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Manajemen Asset (Kolom E s.d. Z)</span>`;
    } else {
      typeBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Rencana Tindak Lanjut (Kolom AS s.d. BA)</span>`;
    }

    const operatorName = escapeHtml(item.operatorName || "Teknisi Lapangan");

    // Diff Rows
    const diffRows = (item.changesSummary || []).map(d => `
      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
        <td class="py-2 px-3 font-semibold text-slate-700 w-48">${escapeHtml(d.label)}</td>
        <td class="py-2 px-3 text-slate-500 line-through text-xs">${escapeHtml(d.before || "-")}</td>
        <td class="py-2 px-3 text-emerald-700 font-bold bg-emerald-50/40 text-xs flex items-center gap-1.5">
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-emerald-500"></i>
          <span>${escapeHtml(d.after || "-")}</span>
        </td>
      </tr>
    `).join("");

    return `
      <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4">
        
        <!-- CARD HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="font-extrabold text-base text-slate-800">${escapeHtml(item.towerName)}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${escapeHtml(item.ultg)}</span>
              ${typeBadge}
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <i data-lucide="cloud" class="w-3 h-3 text-amber-500"></i>
                <span>Tab DRAFT_ANTREAN</span>
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Jalur: <strong class="text-slate-600">${escapeHtml(item.jalur)}</strong></span>
              <span>&bull;</span>
              <span>Waktu: <strong class="text-slate-600">${escapeHtml(item.timeFormatted)} WIB</strong></span>
            </div>
          </div>

          <!-- NAMA PENGUBAH BADGE (PROMINENT) -->
          <div class="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-900 flex items-center gap-2.5 self-start sm:self-auto shrink-0 shadow-sm">
            <div class="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
              <i data-lucide="user-check" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Pengusul Perubahan</div>
              <div class="text-xs font-extrabold text-slate-800">${operatorName}</div>
            </div>
          </div>
        </div>

        <!-- DIFF TABLE -->
        <div class="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/30 text-xs">
          <table class="w-full text-left">
            <thead class="bg-slate-100/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-2 px-3">Kolom / Data yang Diubah</th>
                <th class="py-2 px-3">Nilai Sebelumnya</th>
                <th class="py-2 px-3">Nilai Baru Usulan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${diffRows || `<tr><td colspan="3" class="p-3 text-slate-400 italic">Perubahan telah tercatat</td></tr>`}
            </tbody>
          </table>
        </div>

        <!-- ACTION BUTTONS PER ITEM -->
        <div class="flex items-center justify-end gap-2.5 pt-1">
          <button type="button" onclick="stagingManager.removePendingChange('${item.id}')" 
                  class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition" title="Tolak usulan perubahan ini">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
            <span>Tolak Usulan</span>
          </button>

          <button type="button" onclick="stagingManager.approveSingleChange('${item.id}')" 
                  class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition" title="Setujui dan sinkronkan menara ini ke spreadsheet">
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>Setujui (ACC)</span>
          </button>
        </div>

      </div>
    `;
  }).join("");
}

// Handler filter tipe tab approval
function setApprovalFilterType(type) {
  approvalFilterType = type;
  renderApprovalPageView();
}

function onApprovalSearchInput(val) {
  approvalSearchQuery = val.trim();
  renderApprovalPageView();
}

// Submit Login Auth dari halaman approval secara online
async function submitPageSupervisorAuth() {
  const userInput = document.getElementById("inputPageSupervisorUsername");
  const pinInput = document.getElementById("inputPageSupervisorPIN");
  const chkRemember = document.getElementById("checkboxRememberAdmin");

  const enteredUsername = (userInput ? userInput.value : "").trim() || "supervisor";
  const enteredPin = (pinInput ? pinInput.value : "").trim();
  const shouldRemember = chkRemember ? chkRemember.checked : true;

  if (!enteredPin) {
    alert("⚠️ Silakan masukkan Password atau PIN!");
    if (pinInput) pinInput.focus();
    return;
  }

  const btn = document.getElementById("btnSubmitSupervisorLogin") || document.querySelector("#viewApproval button[type='submit']");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-block animate-spin mr-1">⌛</span> Memverifikasi Kredensial...`;
  }

  let authRes = null;
  if (typeof stagingManager !== "undefined" && typeof stagingManager.verifySupervisorPINOnline === "function") {
    authRes = await stagingManager.verifySupervisorPINOnline(enteredPin, enteredUsername);
  } else {
    authRes = (enteredPin === "1234") ? { valid: true, username: enteredUsername } : false;
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = origHtml;
  }

  const isValid = authRes && (authRes === true || authRes.valid === true);

  if (!isValid) {
    alert("⚠️ Username atau Password salah!\n\nKredensial Login:\n• Username: pln\n• Password: upt palembag\n\n(Fallback: supervisor / 1234)");
    if (pinInput) pinInput.focus();
    return;
  }

  const verifiedUsername = (authRes && authRes.username) ? authRes.username : enteredUsername;

  if (typeof stagingManager !== "undefined") {
    if (typeof stagingManager.setSupervisorSession === "function") {
      stagingManager.setSupervisorSession(verifiedUsername, shouldRemember);
    } else {
      stagingManager.setRole("supervisor");
      if (shouldRemember) {
        try {
          localStorage.setItem("trs_admin_remember_v1", "true");
          localStorage.setItem("trs_user_role_v1", "supervisor");
          localStorage.setItem("trs_supervisor_username", verifiedUsername);
          localStorage.setItem("trs_supervisor_auth_time", new Date().toISOString());
        } catch (e) {}
      }
    }
    stagingManager.fetchDraftsFromCloud(true);
  }

  renderApprovalPageView();
  if (typeof showToast === "function") {
    showToast(`👑 Login berhasil! Selamat datang, ${verifiedUsername}. ${shouldRemember ? '(Remember Me Aktif)' : ''}`, "success");
  }
}

// Toggle password visibility (show/hide)
function toggleApprovalPasswordVisibility() {
  const pinInput = document.getElementById("inputPageSupervisorPIN");
  const icon = document.getElementById("iconTogglePassword");
  if (!pinInput) return;
  if (pinInput.type === "password") {
    pinInput.type = "text";
    if (icon) icon.setAttribute("data-lucide", "eye-off");
  } else {
    pinInput.type = "password";
    if (icon) icon.setAttribute("data-lucide", "eye");
  }
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Bantuan isi otomatis kredensial default
function fillDefaultSupervisorCredentials() {
  const userInput = document.getElementById("inputPageSupervisorUsername");
  const pinInput = document.getElementById("inputPageSupervisorPIN");
  if (userInput) userInput.value = "pln";
  if (pinInput) pinInput.value = "upt palembag";
  if (pinInput) pinInput.focus();
}
