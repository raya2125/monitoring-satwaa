/**
 * KOMPONEN: REKAPITULASI ASET & PERANGKAT TERPASANG (KOLOM E s.d. Z)
 * Sesuai desain Rencana Tindak Lanjut: Header Ringkasan & Card Grid Rekap Perangkat
 */

function renderKpiComponent() {
  const container = document.getElementById("kpiSection");
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-4">
      
      <!-- 1. HEADER PANEL RINGKASAN METRIK STATUS PROTEKSI -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Manajemen Asset Tower & Status Proteksi (Kolom E s.d. Z)
                </h1>
                <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Inventaris Proteksi
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Kelola data inventaris aset transmisi dan pencatatan pemasangan perangkat anti-binatang eksisting beserta tanggal instalasi.
              </p>
            </div>
          </div>

          <!-- SUMMARY COUNTER PILLS -->
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <div class="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div id="kpiTotalTower" class="text-base font-extrabold text-slate-800">3.201</div>
              <div class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Menara</div>
            </div>
            <div class="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div id="kpiTotalTerpasang" class="text-base font-extrabold text-emerald-700">563</div>
              <div class="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Sudah Terpasang</div>
            </div>
            <div class="px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <div id="kpiTotalBelum" class="text-base font-extrabold text-rose-700">2.638</div>
              <div class="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Belum Terpasang</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. REKAP PERANGKAT TERPASANG (KOLOM E s.d. Z) -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700">
          <span class="flex items-center gap-2 uppercase tracking-wide">
            <i data-lucide="layers" class="w-4 h-4 text-emerald-600"></i>
            Rekapitulasi Perangkat Terpasang (Kolom E s.d. Z)
          </span>
          <span class="text-slate-400 font-normal text-[11px]">Dihitung dari data realtime</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          <!-- E/G: TOP SKOR -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">TOP SKOR (E/G)</div>
              <div class="text-[10px] text-slate-400">Top Protector</div>
            </div>
            <span id="rekapEzTopSkor" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- I/K: IRON MAN -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">IRON MAN (I/K)</div>
              <div class="text-[10px] text-slate-400">Pelat Traverse</div>
            </div>
            <span id="rekapEzIronMan" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- M: BOLUVES -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">BOLUVES (M)</div>
              <div class="text-[10px] text-slate-400">Bola Luncur</div>
            </div>
            <span id="rekapEzBoluves" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- O: JARING -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">JARING (O)</div>
              <div class="text-[10px] text-slate-400">Pengaman</div>
            </div>
            <span id="rekapEzJaring" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- Q: PELAKOR -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">PELAKOR (Q)</div>
              <div class="text-[10px] text-slate-400">Penghalang Panjat</div>
            </div>
            <span id="rekapEzPelakor" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- S: KAWAT SILET -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">KAWAT SILET (S)</div>
              <div class="text-[10px] text-slate-400">Kawat Duri</div>
            </div>
            <span id="rekapEzKawatSilet" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- U: ASB -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">ASB (U)</div>
              <div class="text-[10px] text-slate-400">Anti Satwa Burung</div>
            </div>
            <span id="rekapEzAsb" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- W: PEMVES -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">PEMVES (W)</div>
              <div class="text-[10px] text-slate-400">Perisai Isolator</div>
            </div>
            <span id="rekapEzPemves" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- Y: TOGAR ABES -->
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">TOGAR ABES (Y)</div>
              <div class="text-[10px] text-slate-400">Top Guard</div>
            </div>
            <span id="rekapEzTogarAbes" class="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">0</span>
          </div>
        </div>
      </div>

    </div>
  `;
}
