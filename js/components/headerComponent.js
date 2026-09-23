/**
 * KOMPONEN: TOP HEADER & NAVIGATION TABS
 */

function renderHeaderComponent() {
  const container = document.getElementById("headerSection");
  if (!container) return;

  container.innerHTML = `
    <header class="bg-[#071324] text-white border-b border-slate-800">
      <div class="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30 shadow-inner">
            <i data-lucide="zap" class="w-5 h-5 text-sky-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-bold tracking-tight text-white">Sistem Monitoring Kerawanan Satwa & Proteksi SUTT/SUTET</h1>
              <span class="px-2 py-0.5 text-xs font-semibold rounded bg-[#0e274d] text-sky-300 border border-sky-600/40">UPT PALEMBANG</span>
            </div>
            <p class="text-xs text-slate-400 tracking-wide mt-0.5">Transmisi Saluran Udara Tegangan Tinggi & Ekstra Tinggi • Anti-Animal Deterrent Matrix (Sheet: TRS_PLM)</p>
          </div>
        </div>
        <div class="flex items-center gap-2.5">
          <div id="syncBadge" class="hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 text-xs border border-emerald-800">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Sinkronisasi Realtime Aktif
          </div>
          <button onclick="loadSpreadsheetData(true)" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-700/90 hover:bg-emerald-600 text-white border border-emerald-600/70 flex items-center gap-2 shadow-sm transition" title="Tarik data terbaru dari Google Spreadsheet">
            <i id="syncButtonIcon" data-lucide="refresh-cw" class="w-4 h-4 text-emerald-100"></i>
            <span id="syncButtonText">Sinkronkan</span>
          </button>
          <button onclick="exportCSV()" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition">
            <i data-lucide="download" class="w-4 h-4 text-slate-400"></i>
            Ekspor CSV
          </button>
          <button onclick="openAddNewModal()" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-sm transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Tambah Tower
          </button>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <div class="max-w-[1600px] mx-auto px-6">
        <nav class="flex items-center gap-6 overflow-x-auto text-sm border-t border-slate-800/60 pt-1">
          <button id="navTabAnalitik" onclick="switchTab('analitik')" class="py-3 px-1 text-slate-400 hover:text-slate-200 flex items-center gap-2 font-medium border-b-2 border-transparent transition">
            <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
            Ringkasan & Analitik
          </button>
          <button id="navTabManajemen" onclick="switchTab('manajemen')" class="py-3 px-1 text-slate-400 hover:text-slate-200 flex items-center gap-2 font-medium border-b-2 border-transparent transition">
            <i data-lucide="layers" class="w-4 h-4"></i>
            <span>Manajemen Asset Tower (<span id="headerCountTower">3.201</span>)</span>
          </button>
          <button id="navTabSatwa" onclick="switchTab('satwa')" class="py-3 px-1 text-sky-400 font-semibold flex items-center gap-2 border-b-2 border-sky-400 transition">
            <i data-lucide="shield-alert" class="w-4 h-4 text-sky-400"></i>
            Kerawanan Satwa
          </button>
          <button id="navTabTindakLanjut" onclick="switchTab('tindak-lanjut')" class="py-3 px-1 text-slate-400 hover:text-slate-200 flex items-center gap-2 font-medium border-b-2 border-transparent transition">
            <i data-lucide="wrench" class="w-4 h-4"></i>
            <span>Rencana Tindak Lanjut (<span id="headerCountTindakLanjut">170</span>)</span>
          </button>
        </nav>
      </div>
    </header>
  `;
}
