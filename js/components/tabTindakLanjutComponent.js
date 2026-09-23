/**
 * KOMPONEN TAB 4: RENCANA TINDAK LANJUT (170)
 * Sesuai desain dashboard PLN UPT Palembang
 */

function renderTindakLanjutComponent() {
  const container = document.getElementById("viewTindakLanjut");
  if (!container) return;

  container.innerHTML = `
    <!-- 1. TOP KPI SUMMARY CARDS (REUSED COMPACT) -->
    <div id="tindakLanjutKpiSection"></div>

    <!-- 2. MAIN PANEL RENCANA TINDAK LANJUT -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
      
      <!-- HEADER PANEL -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
            <i data-lucide="wrench" class="w-5 h-5 text-sky-600"></i>
          </div>
          <div>
            <h2 class="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              Rencana Tindak Lanjut Pemeliharaan & Pengadaan Perangkat
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Jadwal pembersihan tapak tower dan rencana pemasangan proteksi anti-binatang sesuai hasil evaluasi
            </p>
          </div>
        </div>

        <span id="badgeButuhBersihTapak" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          170 Tower Butuh Bersih Tapak
        </span>
      </div>

      <!-- DUA KOLOM: PEMBERSIHAN TAPAK & REKOMENDASI PENAMBAHAN PERANGKAT -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- KOLOM KIRI: MENARA PERLU PEMBERSIHAN TAPAK -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span class="tracking-wide uppercase">MENARA PERLU PEMBERSIHAN TAPAK</span>
            <span id="labelTapakCount" class="text-sky-600 font-extrabold">170 TOWER</span>
          </div>

          <div id="tapakListContainer" class="max-h-[560px] overflow-y-auto space-y-2.5 pr-2">
            <!-- Diisi otomatis oleh updateTindakLanjutView() -->
          </div>
        </div>

        <!-- KOLOM KANAN: REKOMENDASI PENAMBAHAN PERANGKAT -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span class="tracking-wide uppercase">REKOMENDASI PENAMBAHAN PERANGKAT</span>
            <span class="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">REALISASI LAPANGAN</span>
          </div>

          <div id="rekomendasiListContainer" class="max-h-[560px] overflow-y-auto space-y-2.5 pr-2">
            <!-- Diisi otomatis oleh updateTindakLanjutView() -->
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Update data tampilan Tab 4: Rencana Tindak Lanjut
 */
function updateTindakLanjutView(data) {
  // 1. Sinkronkan Top KPI jika ada kontainer khusus
  const kpiTarget = document.getElementById("tindakLanjutKpiSection");
  const sourceKpi = document.getElementById("kpiSection");
  if (kpiTarget && sourceKpi) {
    kpiTarget.innerHTML = sourceKpi.innerHTML;
  }

  // 2. Filter Menara Perlu Pembersihan Tapak
  const tapakList = data.filter(t => t.tapak && t.tapak.toLowerCase().includes("perlu"));
  const elBadgeTapak = document.getElementById("badgeButuhBersihTapak");
  if (elBadgeTapak) elBadgeTapak.innerText = `${tapakList.length} Tower Butuh Bersih Tapak`;

  const elLabelTapak = document.getElementById("labelTapakCount");
  if (elLabelTapak) elLabelTapak.innerText = `${tapakList.length} TOWER`;

  const tapakContainer = document.getElementById("tapakListContainer");
  if (tapakContainer) {
    if (tapakList.length === 0) {
      tapakContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">Tidak ada menara yang memerlukan pembersihan tapak pada filter ini.</div>`;
    } else {
      tapakContainer.innerHTML = tapakList.map(item => `
        <div class="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-amber-300 hover:shadow-sm transition flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate">${item.nama}</div>
            <div class="text-[11px] text-slate-400 truncate mt-0.5">${item.jalur}</div>
          </div>
          <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
            Pembersihan
          </span>
        </div>
      `).join("");
    }
  }

  // 3. Filter Rekomendasi Penambahan Perangkat
  const rekomendasiList = data.filter(t => 
    t.rekomendasi && 
    t.rekomendasi !== "-" && 
    !t.rekomendasi.toLowerCase().includes("pembersihan") && 
    !t.rekomendasi.toLowerCase().includes("monitoring")
  );

  const rekomendasiContainer = document.getElementById("rekomendasiListContainer");
  if (rekomendasiContainer) {
    if (rekomendasiList.length === 0) {
      rekomendasiContainer.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">Tidak ada rekomendasi penambahan perangkat pada filter ini.</div>`;
    } else {
      rekomendasiContainer.innerHTML = rekomendasiList.map(item => `
        <div class="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-sky-300 hover:shadow-sm transition flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate">${item.nama}</div>
            <div class="text-[11px] font-bold text-sky-600 truncate mt-0.5">${item.rekomendasi}</div>
          </div>
          <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 shrink-0">
            Rekomendasi
          </span>
        </div>
      `).join("");
    }
  }
}
