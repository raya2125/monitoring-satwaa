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

  // Jika bukan supervisor, tampilkan halaman proteksi akses PIN
  if (!isSupervisor) {
    container.innerHTML = `
      <div class="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl text-center space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
          <i data-lucide="lock" class="w-8 h-8"></i>
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-800">Halaman Khusus Approval & ACC</h2>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Halaman ini khusus diperuntukkan bagi <strong>Supervisor / Verifikator</strong> untuk menyetujui (ACC) usulan perubahan data menara.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
          <label class="block font-semibold text-slate-700">
            Masukkan PIN Supervisor:
          </label>
          <div class="relative">
            <input type="password" id="inputPageSupervisorPIN" placeholder="Default: 1234" maxlength="10" 
                   onkeydown="if(event.key==='Enter') submitPageSupervisorAuth()"
                   class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-center tracking-widest text-base bg-white">
          </div>
          <div class="text-[11px] text-slate-400 italic text-center">
            Petunjuk: PIN default adalah <strong>1234</strong>
          </div>
        </div>

        <button type="button" onclick="submitPageSupervisorAuth()" class="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition">
          <i data-lucide="key" class="w-4 h-4"></i>
          <span>Buka Akses Supervisor (ACC)</span>
        </button>

        <div class="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          Saat ini Anda dalam mode <span class="font-semibold text-slate-600">Operator (Input Data)</span>.
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
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  👑 Akses Supervisor Aktif
                </span>
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
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" onclick="stagingManager.clearAllPendingChanges()" ${countTotal === 0 ? 'disabled' : ''} 
                  class="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Tolak / Batalkan Semua</span>
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

    const operatorName = item.operatorName || "Teknisi Lapangan";

    // Diff Rows
    const diffRows = (item.changesSummary || []).map(d => `
      <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
        <td class="py-2 px-3 font-semibold text-slate-700 w-48">${d.label}</td>
        <td class="py-2 px-3 text-slate-500 line-through text-xs">${d.before || "-"}</td>
        <td class="py-2 px-3 text-emerald-700 font-bold bg-emerald-50/40 text-xs flex items-center gap-1.5">
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-emerald-500"></i>
          <span>${d.after || "-"}</span>
        </td>
      </tr>
    `).join("");

    return `
      <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4">
        
        <!-- CARD HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="font-extrabold text-base text-slate-800">${item.towerName}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${item.ultg}</span>
              ${typeBadge}
            </div>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Jalur: <strong class="text-slate-600">${item.jalur}</strong></span>
              <span>&bull;</span>
              <span>Waktu: <strong class="text-slate-600">${item.timeFormatted} WIB</strong></span>
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

// Submit PIN auth dari halaman approval
function submitPageSupervisorAuth() {
  const pinInput = document.getElementById("inputPageSupervisorPIN");
  const enteredPin = (pinInput ? pinInput.value : "").trim();
  const validPin = typeof stagingManager !== "undefined" ? stagingManager.getSupervisorPIN() : "1234";

  if (enteredPin !== validPin) {
    alert("⚠️ PIN Supervisor salah! Silakan coba lagi (Default PIN: 1234).");
    if (pinInput) pinInput.focus();
    return;
  }

  if (typeof stagingManager !== "undefined") {
    stagingManager.setRole("supervisor");
  }
  renderApprovalPageView();
}
