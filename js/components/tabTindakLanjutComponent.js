/**
 * KOMPONEN TAB 4: RENCANA TINDAK LANJUT (KOLOM AR s.d. BA)
 * Mirrored dari Kolom AP (Menara Rawan Satwa Belum Terpasang Anti-Binatang)
 * PLN UPT Palembang
 */

// State internal khusus Tab Tindak Lanjut
let tindakLanjutScopeOnlyAP = true; // Default: mirror khusus Kolom AP
let tindakLanjutSearch = "";
let tindakLanjutUltgFilter = "";
let tindakLanjutSatwaFilter = "";
let tindakLanjutStatusFilter = ""; // "semua", "sudah", "belum"
let activeRencanaFilter = ""; // Filter dari klik card rekap rencana (Kolom AS - BA)
let tindakLanjutPage = 1;
let tindakLanjutPageSize = 15;
let activeTindakLanjutTowerNo = null;

function renderTindakLanjutComponent() {
  const container = document.getElementById("viewTindakLanjut");
  if (!container) return;

  container.innerHTML = `
    <!-- MAIN CONTAINER -->
    <div class="space-y-5">
      
      <!-- 1. HEADER PANEL -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
              <i data-lucide="wrench" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Rencana Tindak Lanjut (Kolom AR s.d. BA)
                </h1>
                <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Mirror Kolom AP
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Kelola rencana pengadaan dan pemasangan perangkat proteksi anti-binatang (Kolom AS–BA) khusus untuk menara yang berstatus rawan dan belum terlindungi.
              </p>
            </div>
          </div>

          <!-- SUMMARY COUNTER PILLS -->
          <div class="flex items-center gap-2 flex-wrap shrink-0">
            <div class="px-3 py-2 rounded-xl bg-sky-50 border border-sky-100 text-center">
              <div id="statTotalAP" class="text-base font-extrabold text-sky-700">108</div>
              <div class="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Tower Kolom AP</div>
            </div>
            <div class="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div id="statSudahRencana" class="text-base font-extrabold text-emerald-700">0</div>
              <div class="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Sudah Diisi</div>
            </div>
            <div class="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <div id="statBelumRencana" class="text-base font-extrabold text-amber-700">0</div>
              <div class="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Belum Diisi</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. REKAP KEBUTUHAN PERANGKAT (KOLOM AS - BA) -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between text-xs font-bold text-slate-700">
          <span class="flex items-center gap-2 uppercase tracking-wide">
            <i data-lucide="layers" class="w-4 h-4 text-sky-600"></i>
            Rekap Kebutuhan Perangkat & Tindak Lanjut (Kolom AS s.d. BA)
          </span>
          <span class="text-slate-400 font-normal text-[11px]">Dihitung dari data realtime</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">

          <!-- AS: BOLUVES -->
          <div data-rencana-card="boluves" onclick="filterByRencana('boluves','BOLUVES')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan BOLUVES">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">BOLUVES (AS)</div>
              <div class="text-[10px] text-slate-400">Bola Luncur</div>
            </div>
            <span id="rekapCountBoluves" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AT: JARING -->
          <div data-rencana-card="jaring" onclick="filterByRencana('jaring','JARING')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan JARING">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">JARING (AT)</div>
              <div class="text-[10px] text-slate-400">Pengaman</div>
            </div>
            <span id="rekapCountJaring" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AU: PEMVES -->
          <div data-rencana-card="pemves" onclick="filterByRencana('pemves','PEMVES')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan PEMVES">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">PEMVES (AU)</div>
              <div class="text-[10px] text-slate-400">Perisai Isolator</div>
            </div>
            <span id="rekapCountPemves" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AV: PELAKOR -->
          <div data-rencana-card="pelakor" onclick="filterByRencana('pelakor','PELAKOR')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan PELAKOR">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">PELAKOR (AV)</div>
              <div class="text-[10px] text-slate-400">Penghalang Panjat</div>
            </div>
            <span id="rekapCountPelakor" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AW: TOP SKOR -->
          <div data-rencana-card="topSkor" onclick="filterByRencana('topSkor','TOP SKOR')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan TOP SKOR">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">TOP SKOR (AW)</div>
              <div class="text-[10px] text-slate-400">Top Protector</div>
            </div>
            <span id="rekapCountTopSkor" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AX: IRON MAN -->
          <div data-rencana-card="ironMan" onclick="filterByRencana('ironMan','IRON MAN')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan IRON MAN">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">IRON MAN (AX)</div>
              <div class="text-[10px] text-slate-400">Pelat Traverse</div>
            </div>
            <span id="rekapCountIronMan" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AY: KAWAT SILET -->
          <div data-rencana-card="kawatSilet" onclick="filterByRencana('kawatSilet','KAWAT SILET')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan KAWAT SILET">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">KAWAT SILET (AY)</div>
              <div class="text-[10px] text-slate-400">Kawat Duri</div>
            </div>
            <span id="rekapCountKawatSilet" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- AZ: ASB -->
          <div data-rencana-card="asb" onclick="filterByRencana('asb','ASB')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan ASB">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">ASB (AZ)</div>
              <div class="text-[10px] text-slate-400">Anti Satwa Burung</div>
            </div>
            <span id="rekapCountAsb" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>

          <!-- BA: TOGAR ABES -->
          <div data-rencana-card="togarAbes" onclick="filterByRencana('togarAbes','TOGAR ABES')"
               class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition select-none" title="Klik untuk filter rencana dengan TOGAR ABES">
            <div>
              <div class="font-bold text-slate-700 text-[11px]">TOGAR ABES (BA)</div>
              <div class="text-[10px] text-slate-400">Top Guard</div>
            </div>
            <span id="rekapCountTogarAbes" class="text-sm font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-lg">0</span>
          </div>
        </div>
      </div>

      <!-- 3. TABEL RENCANA TINDAK LANJUT (KOLOM AS - BA) -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wide">Tabel Pengisian Kolom AS s.d. BA</span>
            <span id="tindakLanjutTableBadgeCount" class="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-600">0 Data</span>
          </div>
          <div class="text-xs text-slate-400">
            Klik tombol <span class="text-sky-600 font-semibold">Isi / Edit Rencana</span> untuk mencentang perangkat
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider uppercase">
                <th class="py-3 px-3.5 w-12 text-center">NO</th>
                <th class="py-3 px-3.5 min-w-[200px]">TOWER & JALUR SUTT</th>
                <th class="py-3 px-3.5 min-w-[130px]">ULTG</th>
                <th class="py-3 px-3.5 min-w-[140px]">RAWAN (KOLOM AP)</th>
                <th class="py-3 px-3.5 min-w-[280px]">RENCANA PERANGKAT (KOLOM AS - BA)</th>
                <th class="py-3 px-3.5 text-center w-36">AKSI</th>
              </tr>
            </thead>
            <tbody id="tindakLanjutTableBody" class="divide-y divide-slate-100 text-slate-700 font-normal">
              <!-- Diisi otomatis oleh updateTindakLanjutView() -->
            </tbody>
          </table>
        </div>

        <!-- PAGINATION CONTROLS -->
        <div class="p-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Menampilkan</span>
            <select onchange="changeTindakLanjutPageSize(this.value)" class="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700">
              <option value="15" ${tindakLanjutPageSize === 15 ? 'selected' : ''}>15</option>
              <option value="25" ${tindakLanjutPageSize === 25 ? 'selected' : ''}>25</option>
              <option value="50" ${tindakLanjutPageSize === 50 ? 'selected' : ''}>50</option>
              <option value="100" ${tindakLanjutPageSize === 100 ? 'selected' : ''}>100</option>
            </select>
            <span>baris per halaman</span>
          </div>

          <div id="tindakLanjutPaginationControls" class="flex items-center gap-1">
            <!-- Diisi paginasi -->
          </div>
        </div>
      </div>

    </div>

    <!-- 5. DEDICATED MODAL: EDIT RENCANA TINDAK LANJUT (KOLOM AS s.d. BA) -->
    <div id="modalTindakLanjutAR_BA" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 relative">
        
        <!-- MODAL HEADER -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
              <i data-lucide="sliders" class="w-5 h-5 text-sky-600"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">Pengisian Rencana Tindak Lanjut</h3>
              <p class="text-xs text-slate-400 mt-0.5">Centang perangkat yang direncanakan untuk mengisi Kolom AS s.d. BA di Spreadsheet.</p>
            </div>
          </div>
          <button onclick="closeModalTindakLanjut()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- TOWER INFO CARD -->
        <div id="modalTindakLanjutTowerInfo" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
          <!-- Diisi otomatis -->
        </div>

        <!-- FORM CHECKLIST (KOLOM AS s.d. BA) -->
        <form id="formTindakLanjutAR_BA" onsubmit="submitTindakLanjutUpdate(event)" class="space-y-4">
          <input type="hidden" id="editTindakLanjutTowerNo">


          <div class="space-y-2 pt-1">
            <div class="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <i data-lucide="shield" class="w-4 h-4 text-sky-600"></i>
                Rencana Perangkat Anti-Binatang (Kolom AS s.d. BA)
              </span>
              <span class="text-[10px] text-sky-600 font-semibold px-2 py-0.5 rounded bg-sky-50 border border-sky-200">
                Pilih perangkat yang direncanakan
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              
              <!-- AS: BOLUVES -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckBoluves" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">BOLUVES <span class="text-[10px] text-slate-400 font-normal">(Kolom AS)</span></div>
                  <div class="text-[10px] text-slate-500">Bola Luncur Anti Tupai/Vespa</div>
                </div>
              </label>

              <!-- AT: JARING -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckJaring" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">JARING <span class="text-[10px] text-slate-400 font-normal">(Kolom AT)</span></div>
                  <div class="text-[10px] text-slate-500">Jaring Pengaman Anti Satwa</div>
                </div>
              </label>

              <!-- AU: PEMVES -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckPemves" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">PEMVES <span class="text-[10px] text-slate-400 font-normal">(Kolom AU)</span></div>
                  <div class="text-[10px] text-slate-500">Perisai Isolator Anti Vespa</div>
                </div>
              </label>

              <!-- AV: PELAKOR -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckPelakor" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">PELAKOR <span class="text-[10px] text-slate-400 font-normal">(Kolom AV)</span></div>
                  <div class="text-[10px] text-slate-500">Penghalang Panjat Kera/Ular</div>
                </div>
              </label>

              <!-- AW: TOP SKOR -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckTopSkor" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">TOP SKOR <span class="text-[10px] text-slate-400 font-normal">(Kolom AW)</span></div>
                  <div class="text-[10px] text-slate-500">Top Protector Isolator</div>
                </div>
              </label>

              <!-- AX: IRON MAN -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckIronMan" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">IRON MAN <span class="text-[10px] text-slate-400 font-normal">(Kolom AX)</span></div>
                  <div class="text-[10px] text-slate-500">Pelat Pelindung Baja Traverse</div>
                </div>
              </label>

              <!-- AY: KAWAT SILET -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckKawatSilet" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">KAWAT SILET <span class="text-[10px] text-slate-400 font-normal">(Kolom AY)</span></div>
                  <div class="text-[10px] text-slate-500">Kawat Duri Anti Panjat</div>
                </div>
              </label>

              <!-- AZ: ASB -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckAsb" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">ASB <span class="text-[10px] text-slate-400 font-normal">(Kolom AZ)</span></div>
                  <div class="text-[10px] text-slate-500">Anti Satwa Burung</div>
                </div>
              </label>

              <!-- BA: TOGAR ABES -->
              <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 transition cursor-pointer">
                <input type="checkbox" id="modalCheckTogarAbes" class="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500">
                <div>
                  <div class="font-bold text-slate-800 text-[11px]">TOGAR ABES <span class="text-[10px] text-slate-400 font-normal">(Kolom BA)</span></div>
                  <div class="text-[10px] text-slate-500">Top Guard Anti Binatang</div>
                </div>
              </label>

            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button type="button" onclick="closeModalTindakLanjut()" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs">
              Batal
            </button>
            <button type="submit" id="btnSubmitTindakLanjut" class="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Simpan ke Spreadsheet (Kolom AR-BA)</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

/**
 * Filter data untuk tampilan Tab Tindak Lanjut
 */
function getFilteredTindakLanjutData() {
  let list = towerData || [];

  // 1. Scope: Khusus menara di Kolom AP (Rawan Satwa Belum Terpasang)
  if (tindakLanjutScopeOnlyAP) {
    list = list.filter(t => t.kolomAP && t.kolomAP.trim() !== "");
  }

  // 2. Search
  if (tindakLanjutSearch) {
    const q = tindakLanjutSearch.toLowerCase();
    list = list.filter(t => 
      (t.nama && t.nama.toLowerCase().includes(q)) ||
      (t.jalur && t.jalur.toLowerCase().includes(q)) ||
      (t.ultg && t.ultg.toLowerCase().includes(q))
    );
  }

  // 3. Filter ULTG
  if (tindakLanjutUltgFilter) {
    list = list.filter(t => t.ultg === tindakLanjutUltgFilter);
  }

  // 4. Filter Satwa Kolom AP
  if (tindakLanjutSatwaFilter) {
    const filterNorm = tindakLanjutSatwaFilter.toUpperCase().replace(/\s*,\s*/g, ", ").trim();
    list = list.filter(t => {
      const apVal = (t.kolomAP || "").toUpperCase().replace(/\s*,\s*/g, ", ").trim();
      const katVal = (t.kategori && t.kategori !== "(Blanks) / Tidak Ada" ? t.kategori : "").toUpperCase().replace(/\s*,\s*/g, ", ").trim();
      const val = apVal || katVal;
      return val === filterNorm;
    });
  }

  // 5. Filter Status Rencana
  if (tindakLanjutStatusFilter === "sudah") {
    list = list.filter(t => hasAnyTindakLanjut(t));
  } else if (tindakLanjutStatusFilter === "belum") {
    list = list.filter(t => !hasAnyTindakLanjut(t));
  }

  // 6. Filter Rencana Perangkat dari klik Card Rekap (Kolom AS - BA)
  if (activeRencanaFilter) {
    list = list.filter(t => Boolean(t[activeRencanaFilter]));
  }

  return list;
}

// Cek apakah menara sudah memiliki minimal 1 centang di kolom AS s.d. BA
function hasAnyTindakLanjut(t) {
  return Boolean(
    t.boluves ||
    t.jaring ||
    t.pemves ||
    t.pelakor ||
    t.topSkor ||
    t.ironMan ||
    t.kawatSilet ||
    t.asb ||
    t.togarAbes
  );
}

/**
 * Update data tampilan Tab 4: Rencana Tindak Lanjut
 */
function updateTindakLanjutView() {
  const container = document.getElementById("viewTindakLanjut");
  if (!container) return;

  // 1. Hitung Ringkasan Metrik
  const allAPList = towerData.filter(t => t.kolomAP && t.kolomAP.trim() !== "");
  const totalAP = allAPList.length;
  const sudahCount = allAPList.filter(t => hasAnyTindakLanjut(t)).length;
  const belumCount = Math.max(0, totalAP - sudahCount);

  const elStatTotalAP = document.getElementById("statTotalAP");
  if (elStatTotalAP) elStatTotalAP.innerText = totalAP;
  const elStatSudah = document.getElementById("statSudahRencana");
  if (elStatSudah) elStatSudah.innerText = sudahCount;
  const elStatBelum = document.getElementById("statBelumRencana");
  if (elStatBelum) elStatBelum.innerText = belumCount;

  // 2. Hitung Rekap Kebutuhan Perangkat AS - BA
  const targetDataSet = tindakLanjutScopeOnlyAP ? allAPList : towerData;

  const countBoluves = targetDataSet.filter(t => t.boluves).length;
  const countJaring = targetDataSet.filter(t => t.jaring).length;
  const countPemves = targetDataSet.filter(t => t.pemves).length;
  const countPelakor = targetDataSet.filter(t => t.pelakor).length;
  const countTopSkor = targetDataSet.filter(t => t.topSkor).length;
  const countIronMan = targetDataSet.filter(t => t.ironMan).length;
  const countKawatSilet = targetDataSet.filter(t => t.kawatSilet).length;
  const countAsb = targetDataSet.filter(t => t.asb).length;
  const countTogarAbes = targetDataSet.filter(t => t.togarAbes).length;

  if (document.getElementById("rekapCountBoluves")) document.getElementById("rekapCountBoluves").innerText = countBoluves;
  if (document.getElementById("rekapCountJaring")) document.getElementById("rekapCountJaring").innerText = countJaring;
  if (document.getElementById("rekapCountPemves")) document.getElementById("rekapCountPemves").innerText = countPemves;
  if (document.getElementById("rekapCountPelakor")) document.getElementById("rekapCountPelakor").innerText = countPelakor;
  if (document.getElementById("rekapCountTopSkor")) document.getElementById("rekapCountTopSkor").innerText = countTopSkor;
  if (document.getElementById("rekapCountIronMan")) document.getElementById("rekapCountIronMan").innerText = countIronMan;
  if (document.getElementById("rekapCountKawatSilet")) document.getElementById("rekapCountKawatSilet").innerText = countKawatSilet;
  if (document.getElementById("rekapCountAsb")) document.getElementById("rekapCountAsb").innerText = countAsb;
  if (document.getElementById("rekapCountTogarAbes")) document.getElementById("rekapCountTogarAbes").innerText = countTogarAbes;

  // 3. Render Baris Tabel
  const currentList = getFilteredTindakLanjutData();
  const elTableBadge = document.getElementById("tindakLanjutTableBadgeCount");
  if (elTableBadge) elTableBadge.innerText = `${currentList.length} Menara`;

  const tbody = document.getElementById("tindakLanjutTableBody");
  if (!tbody) return;

  if (currentList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          <div>Tidak ada menara yang sesuai dengan kriteria filter tindak lanjut ini.</div>
        </td>
      </tr>
    `;
    renderTindakLanjutPagination(0);
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const startIdx = (tindakLanjutPage - 1) * tindakLanjutPageSize;
  const paginated = currentList.slice(startIdx, startIdx + tindakLanjutPageSize);

  tbody.innerHTML = paginated.map((item, idx) => {
    const globalIdx = startIdx + idx + 1;

    // Satwa Badge (Kolom AP)
    const satwaText = item.kolomAP || (item.kategori && item.kategori !== "(Blanks) / Tidak Ada" ? item.kategori : "-");
    let satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">-</span>`;
    const satwaUpper = satwaText.toUpperCase();
    if (satwaUpper.includes("KERA") && satwaUpper.includes("BURUNG")) {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">🐒🦅 ${satwaText}</span>`;
    } else if (satwaUpper.includes("ULAR") && satwaUpper.includes("BURUNG")) {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-50 text-pink-800 border border-pink-200">🐍🦅 ${satwaText}</span>`;
    } else if (satwaUpper.includes("KERA") && satwaUpper.includes("ULAR")) {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">🐒🐍 ${satwaText}</span>`;
    } else if (satwaUpper.includes("KERA")) {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">🐒 ${satwaText}</span>`;
    } else if (satwaUpper.includes("ULAR")) {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">🐍 ${satwaText}</span>`;
    } else if (satwaUpper.includes("BURUNG")) {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">🦅 ${satwaText}</span>`;
    } else if (satwaText !== "-") {
      satwaBadge = `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">${satwaText}</span>`;
    }

    // Perangkat Badges (Kolom AS - BA)
    const activeDevices = [];
    if (item.boluves) activeDevices.push("BOLUVES");
    if (item.jaring) activeDevices.push("JARING");
    if (item.pemves) activeDevices.push("PEMVES");
    if (item.pelakor) activeDevices.push("PELAKOR");
    if (item.topSkor) activeDevices.push("TOP SKOR");
    if (item.ironMan) activeDevices.push("IRON MAN");
    if (item.kawatSilet) activeDevices.push("KAWAT SILET");
    if (item.asb) activeDevices.push("ASB");
    if (item.togarAbes) activeDevices.push("TOGAR ABES");

    let devicesHtml = "";
    if (activeDevices.length === 0) {
      devicesHtml = `<span class="text-slate-400 italic text-[11px]">- Belum ada perangkat direncanakan -</span>`;
    } else {
      devicesHtml = `<div class="flex items-center gap-1.5 flex-wrap">` + 
        activeDevices.map(d => `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">${d}</span>`).join("") +
        `</div>`;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-3 px-3.5 text-center text-slate-400 font-medium">${globalIdx}</td>
        <td class="py-3 px-3.5">
          <div class="font-bold text-slate-800">${item.nama}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${item.jalur}</div>
        </td>
        <td class="py-3 px-3.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${item.ultg}</span>
        </td>
        <td class="py-3 px-3.5">${satwaBadge}</td>
        <td class="py-3 px-3.5">${devicesHtml}</td>
        <td class="py-3 px-3.5 text-center">
          <button onclick="openModalTindakLanjut(${item.no})" class="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 flex items-center justify-center gap-1.5 mx-auto transition">
            <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
            <span>Isi / Edit</span>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  renderTindakLanjutPagination(currentList.length);
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Paginasi Tab Tindak Lanjut
 */
function renderTindakLanjutPagination(totalItems) {
  const container = document.getElementById("tindakLanjutPaginationControls");
  if (!container) return;
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / tindakLanjutPageSize) || 1;

  // Prev
  const prevBtn = document.createElement("button");
  prevBtn.className = `px-2 py-1 rounded border text-xs ${tindakLanjutPage === 1 ? "opacity-40 cursor-not-allowed border-slate-200 text-slate-400" : "hover:bg-slate-100 border-slate-200 text-slate-700"}`;
  prevBtn.innerHTML = `&laquo; Prev`;
  prevBtn.disabled = tindakLanjutPage === 1;
  prevBtn.onclick = () => { if (tindakLanjutPage > 1) { tindakLanjutPage--; updateTindakLanjutView(); } };
  container.appendChild(prevBtn);

  // Pages
  let startP = Math.max(1, tindakLanjutPage - 2);
  let endP = Math.min(totalPages, startP + 4);
  if (endP - startP < 4) startP = Math.max(1, endP - 4);

  for (let p = startP; p <= endP; p++) {
    const pBtn = document.createElement("button");
    pBtn.className = `px-2.5 py-1 rounded border text-xs font-semibold ${p === tindakLanjutPage ? "bg-sky-600 text-white border-sky-600 shadow-sm" : "border-slate-200 hover:bg-slate-100 text-slate-600"}`;
    pBtn.innerText = p;
    pBtn.onclick = () => { tindakLanjutPage = p; updateTindakLanjutView(); };
    container.appendChild(pBtn);
  }

  // Next
  const nextBtn = document.createElement("button");
  nextBtn.className = `px-2 py-1 rounded border text-xs ${tindakLanjutPage === totalPages ? "opacity-40 cursor-not-allowed border-slate-200 text-slate-400" : "hover:bg-slate-100 border-slate-200 text-slate-700"}`;
  nextBtn.innerHTML = `Next &raquo;`;
  nextBtn.disabled = tindakLanjutPage === totalPages;
  nextBtn.onclick = () => { if (tindakLanjutPage < totalPages) { tindakLanjutPage++; updateTindakLanjutView(); } };
  container.appendChild(nextBtn);
}

// Handlers Pencarian & Filter
function onTindakLanjutSearchChange(val) {
  tindakLanjutSearch = val.trim();
  tindakLanjutPage = 1;
  updateTindakLanjutView();
}

function onTindakLanjutUltgChange(val) {
  tindakLanjutUltgFilter = val;
  tindakLanjutPage = 1;
  updateTindakLanjutView();
}

function onTindakLanjutSatwaChange(val) {
  tindakLanjutSatwaFilter = val;
  tindakLanjutPage = 1;
  updateTindakLanjutView();
}

function onTindakLanjutStatusChange(val) {
  tindakLanjutStatusFilter = val;
  tindakLanjutPage = 1;
  updateTindakLanjutView();
}

function toggleTindakLanjutScope(onlyAP) {
  tindakLanjutScopeOnlyAP = onlyAP;
  tindakLanjutPage = 1;

  const btnAP = document.getElementById("btnScopeOnlyAP");
  const btnAll = document.getElementById("btnScopeAllTowers");
  if (btnAP && btnAll) {
    if (onlyAP) {
      btnAP.className = "px-2.5 py-1.5 text-xs font-bold rounded-lg border transition bg-sky-600 text-white border-sky-600 shadow-sm";
      btnAll.className = "px-2.5 py-1.5 text-xs font-medium rounded-lg border transition bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
    } else {
      btnAP.className = "px-2.5 py-1.5 text-xs font-medium rounded-lg border transition bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
      btnAll.className = "px-2.5 py-1.5 text-xs font-bold rounded-lg border transition bg-sky-600 text-white border-sky-600 shadow-sm";
    }
  }

  updateTindakLanjutView();
}

// Filter aktif berdasarkan klik card rencana perangkat (Kolom AS - BA)
function filterByRencana(rencanaKey, rencanaName) {
  // Toggle: klik lagi untuk reset
  if (activeRencanaFilter === rencanaKey) {
    activeRencanaFilter = "";
  } else {
    activeRencanaFilter = rencanaKey;
  }

  // Update visual aktif card rencana
  document.querySelectorAll("[data-rencana-card]").forEach(function(el) {
    const isActive = el.getAttribute("data-rencana-card") === rencanaKey && activeRencanaFilter !== "";
    if (isActive) {
      el.classList.add("ring-2", "ring-sky-500", "bg-sky-50", "border-sky-300");
      el.classList.remove("bg-slate-50", "border-slate-200");
    } else {
      el.classList.remove("ring-2", "ring-sky-500", "bg-sky-50", "border-sky-300");
      el.classList.add("bg-slate-50", "border-slate-200");
    }
  });

  tindakLanjutPage = 1;
  updateTindakLanjutView();
}
if (typeof window !== "undefined") {
  window.filterByRencana = filterByRencana;
}

function resetTindakLanjutFilters() {
  tindakLanjutSearch = "";
  tindakLanjutUltgFilter = "";
  tindakLanjutSatwaFilter = "";
  tindakLanjutStatusFilter = "";
  activeRencanaFilter = "";
  tindakLanjutPage = 1;

  document.querySelectorAll("[data-rencana-card]").forEach(function(el) {
    el.classList.remove("ring-2", "ring-sky-500", "bg-sky-50", "border-sky-300");
    el.classList.add("bg-slate-50", "border-slate-200");
  });

  const elSearch = document.getElementById("tindakLanjutSearchInput");
  const elUltg = document.getElementById("tindakLanjutFilterUltg");
  const elSatwa = document.getElementById("tindakLanjutFilterSatwa");
  const elStatus = document.getElementById("tindakLanjutFilterStatus");

  if (elSearch) elSearch.value = "";
  if (elUltg) elUltg.value = "";
  if (elSatwa) elSatwa.value = "";
  if (elStatus) elStatus.value = "";

  toggleTindakLanjutScope(true);
}

function changeTindakLanjutPageSize(size) {
  tindakLanjutPageSize = parseInt(size, 10) || 15;
  tindakLanjutPage = 1;
  updateTindakLanjutView();
}

/**
 * Quick toggle Pembersihan Tapak (Kolom AR) langsung dari tabel
 */
async function quickToggleTapak(no) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;

  item.tapakBool = !item.tapakBool;
  item.tapak = item.tapakBool ? "Perlu Pembersihan Tapak" : "Tidak Diperlukan";

  // Perbarui rekomendasi jika kosong
  if (item.tapakBool && (!item.rekomendasi || item.rekomendasi === "-")) {
    item.rekomendasi = "Pembersihan Tapak Tower";
  }

  saveTowerDataLocally();
  updateTindakLanjutView();

  // Sinkronkan ke Google Spreadsheet
  syncTindakLanjutToSpreadsheet(item);
}

/**
 * Buka Modal Edit Rencana Tindak Lanjut (Kolom AR s.d. BA)
 */
function openModalTindakLanjut(no) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;

  activeTindakLanjutTowerNo = no;

  // Info Menara
  const elInfo = document.getElementById("modalTindakLanjutTowerInfo");
  if (elInfo) {
    const satwa = item.kolomAP || item.kategori || "-";
    elInfo.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-extrabold text-slate-800 text-sm">${item.nama}</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">${item.ultg}</span>
      </div>
      <div class="text-slate-500">${item.jalur}</div>
      <div class="pt-1 flex items-center gap-2">
        <span class="text-slate-400 font-medium">Satwa Rawan (Kolom AP):</span>
        <span class="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${satwa}</span>
      </div>
    `;
  }

  document.getElementById("editTindakLanjutTowerNo").value = no;

  // Set Centang Form sesuai data menara
  document.getElementById("modalCheckBoluves").checked = Boolean(item.boluves);
  document.getElementById("modalCheckJaring").checked = Boolean(item.jaring);
  document.getElementById("modalCheckPemves").checked = Boolean(item.pemves);
  document.getElementById("modalCheckPelakor").checked = Boolean(item.pelakor);
  document.getElementById("modalCheckTopSkor").checked = Boolean(item.topSkor);
  document.getElementById("modalCheckIronMan").checked = Boolean(item.ironMan);
  document.getElementById("modalCheckKawatSilet").checked = Boolean(item.kawatSilet);
  document.getElementById("modalCheckAsb").checked = Boolean(item.asb);
  document.getElementById("modalCheckTogarAbes").checked = Boolean(item.togarAbes);

  const modal = document.getElementById("modalTindakLanjutAR_BA");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeModalTindakLanjut() {
  const modal = document.getElementById("modalTindakLanjutAR_BA");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  activeTindakLanjutTowerNo = null;
}

/**
 * Submit form modal Tindak Lanjut
 */
async function submitTindakLanjutUpdate(event) {
  event.preventDefault();
  const no = parseInt(document.getElementById("editTindakLanjutTowerNo").value, 10);
  const item = towerData.find(t => t.no === no);
  if (!item) return;

  // Baca nilai form (Kolom AS sampai BA)
  item.boluves = document.getElementById("modalCheckBoluves").checked;
  item.jaring = document.getElementById("modalCheckJaring").checked;
  item.pemves = document.getElementById("modalCheckPemves").checked;
  item.pelakor = document.getElementById("modalCheckPelakor").checked;
  item.topSkor = document.getElementById("modalCheckTopSkor").checked;
  item.ironMan = document.getElementById("modalCheckIronMan").checked;
  item.kawatSilet = document.getElementById("modalCheckKawatSilet").checked;
  item.asb = document.getElementById("modalCheckAsb").checked;
  item.togarAbes = document.getElementById("modalCheckTogarAbes").checked;

  // Ringkas nama perangkat aktif untuk Rekomendasi
  const activeDevs = [];
  if (item.boluves) activeDevs.push("BOLUVES");
  if (item.jaring) activeDevs.push("JARING");
  if (item.pemves) activeDevs.push("PEMVES");
  if (item.pelakor) activeDevs.push("PELAKOR");
  if (item.topSkor) activeDevs.push("TOP SKOR");
  if (item.ironMan) activeDevs.push("IRON MAN");
  if (item.kawatSilet) activeDevs.push("KAWAT SILET");
  if (item.asb) activeDevs.push("ASB");
  if (item.togarAbes) activeDevs.push("TOGAR ABES");

  if (activeDevs.length > 0) {
    item.rekomendasi = activeDevs.join(", ");
  } else {
    item.rekomendasi = "-";
  }

  saveTowerDataLocally();
  closeModalTindakLanjut();
  updateTindakLanjutView();

  // Sinkronkan ke Google Apps Script
  syncTindakLanjutToSpreadsheet(item);
}

/**
 * Simpan data ke cache lokal browser v3
 */
function saveTowerDataLocally() {
  try {
    localStorage.setItem("trs_plm_tower_data_v3", JSON.stringify(towerData));
  } catch (e) {
    console.warn("Gagal simpan ke localStorage:", e);
  }
}

/**
 * Sinkronisasi Kolom AR s.d. BA ke Google Apps Script Spreadsheet
 */
async function syncTindakLanjutToSpreadsheet(item) {
  try {
    const payload = {
      action: "updateTindakLanjut",
      nama: item.nama,
      ultg: item.ultg,
      jalur: item.jalur,
      boluves: item.boluves,
      jaring: item.jaring,
      pemves: item.pemves,
      pelakor: item.pelakor,
      topSkor: item.topSkor,
      ironMan: item.ironMan,
      kawatSilet: item.kawatSilet,
      asb: item.asb,
      togarAbes: item.togarAbes,
      rekomendasi: item.rekomendasi
    };

    await syncToGoogleSpreadsheet(payload);
  } catch (err) {
    console.error("Gagal sinkronisasi Kolom AR-BA ke Google Sheets:", err);
  }
}
