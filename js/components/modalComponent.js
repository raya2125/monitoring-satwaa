/**
 * KOMPONEN: MODAL KERAWANAN SATWA (KOLOM AL & AM) & MODAL MANAJEMEN ASET (KOLOM E s.d. Z)
 * PLN UPT Palembang
 * 
 * Pemisahan Fungsional:
 * 1. Tab Kerawanan Satwa -> Modal Satwa (Kolom AL & Kolom AM)
 * 2. Tab Manajemen Asset -> Modal Proteksi (Kolom E s.d. Kolom Z)
 */

function renderModalComponent() {
  const container = document.getElementById("modalSection");
  if (!container) return;

  container.innerHTML = `
    <!-- ========================================================================= -->
    <!-- 1. MODAL KHUSUS TAB KERAWANAN SATWA (KOLOM AL & KOLOM AM) -->
    <!-- ========================================================================= -->
    <div id="modalSatwaALAM" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 relative">
        
        <!-- Header Modal Satwa -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-600/30">
              <i data-lucide="shield-alert" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-slate-800">Kerawanan Satwa (Kolom AL & AM)</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">KOLOM AL & AM</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                <span id="satwaModalTowerName" class="font-bold text-slate-700">-</span>
                &bull; <span id="satwaModalJalur" class="text-slate-500">-</span>
                &bull; <span id="satwaModalUltg" class="font-semibold text-slate-600">-</span>
              </p>
            </div>
          </div>
          <button type="button" onclick="closeModalSatwaALAM()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form id="formSatwaALAM" onsubmit="submitSatwaALAMUpdate(event)" class="space-y-4 text-xs">
          <input type="hidden" id="satwaTowerNo">
          <input type="hidden" id="satwaTowerNamaHidden">

          <!-- KARTU INPUT KOLOM AL & KOLOM AM -->
          <div class="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-3">
            <div class="text-[11px] font-bold text-sky-900 flex items-center justify-between">
              <span>IDENTIFIKASI SATWA DI TOWER (SPREADSHEET TRS_PLM)</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-sky-600 text-white font-semibold">Kolom AL & AM</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label class="block text-slate-700 font-semibold mb-1">
                  Binatang 1 <span class="text-sky-600 font-bold">(Kolom AL)</span>
                </label>
                <select id="satwaBinatang1" onchange="updateSatwaLivePreview()" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800 bg-white font-medium text-xs">
                  <option value="">(Kosong / Tidak Ada)</option>
                  <option value="KERA">🐒 KERA</option>
                  <option value="BURUNG">🦅 BURUNG</option>
                  <option value="ULAR">🐍 ULAR</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-700 font-semibold mb-1">
                  Binatang 2 <span class="text-sky-600 font-bold">(Kolom AM)</span>
                </label>
                <select id="satwaBinatang2" onchange="updateSatwaLivePreview()" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800 bg-white font-medium text-xs">
                  <option value="">(Kosong / Tidak Ada)</option>
                  <option value="BURUNG">🦅 BURUNG</option>
                  <option value="KERA">🐒 KERA</option>
                  <option value="ULAR">🐍 ULAR</option>
                </select>
              </div>
            </div>

            <!-- Pratinjau Kategori Satwa Gabungan (Kolom AP) -->
            <div class="pt-2 border-t border-sky-100 flex items-center justify-between text-[11px]">
              <span class="text-slate-600">Hasil Kategori Gabungan:</span>
              <span id="satwaPreviewKategori" class="font-bold text-sky-800 bg-white px-2.5 py-0.5 rounded border border-sky-200">
                (Blanks) / Tidak Ada
              </span>
            </div>
          </div>

          <!-- EVALUASI KESESUAIAN & CATATAN -->
          <div class="grid grid-cols-1 gap-3">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">Evaluasi Kesesuaian Satwa</label>
              <select id="satwaAktivitas" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800 bg-white font-medium">
                <option value="Sesuai">Sesuai (Terpasang / Bebas Potensi Gangguan)</option>
                <option value="Tidak Sesuai">Tidak Sesuai (Rawan Gangguan Satwa & Belum Terpasang Proteksi)</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-700 font-semibold mb-1">Catatan Lapangan / Keterangan Kerawanan</label>
              <input type="text" id="satwaCatatan" placeholder="Contoh: Terlihat kera sering melintas di sekitar traves" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800 bg-white">
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button type="button" onclick="closeModalSatwaALAM()" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Batal</button>
            <button type="submit" id="btnSubmitSatwaALAM" class="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2 shadow-sm transition">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Simpan ke Spreadsheet (Kolom AL & AM)</span>
            </button>
          </div>
        </form>
      </div>
    </div>


    <!-- ========================================================================= -->
    <!-- 2. MODAL KHUSUS TAB MANAJEMEN ASET (KOLOM E s.d. KOLOM Z) -->
    <!-- ========================================================================= -->
    <div id="modalKolomEZ" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-6 relative max-h-[92vh] flex flex-col">
        
        <!-- Header Modal Manajemen Asset Kolom E-Z -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold text-slate-800">Manajemen Asset: Pemasangan Anti-Binatang</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">KOLOM E s.d. Z</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">22 Kolom Spreadsheet</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                <span id="ezModalTowerName" class="font-bold text-slate-700">-</span>
                &bull; <span id="ezModalJalur" class="text-slate-500">-</span>
                &bull; <span id="ezModalUltg" class="font-semibold text-slate-600">-</span>
              </p>
            </div>
          </div>
          <button type="button" onclick="closeModalKolomEZ()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Toolbar: Status & Aksi Cepat -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-slate-500 font-medium">Status Proteksi:</span>
            <span id="ezCounterBadge" class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              0 Perangkat Terpasang
            </span>
            <span id="ezProteksiBadge" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              BELUM TERPASANG
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" onclick="setAllEZToday()" class="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold transition flex items-center gap-1" title="Set tanggal hari ini untuk semua perangkat yang tercentang">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>Set Tanggal Hari Ini</span>
            </button>
            <button type="button" onclick="resetAllEZ()" class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold transition flex items-center gap-1" title="Kosongkan semua tanda terpasang">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Reset Semua</span>
            </button>
          </div>
        </div>

        <!-- FORM CONTENT - SCROLLABLE (9 PERANGKAT KOLOM E s.d. Z) -->
        <form id="formKolomEZ" onsubmit="submitKolomEZUpdate(event)" class="overflow-y-auto pr-1 space-y-3.5 flex-1 text-xs">
          <input type="hidden" id="ezTowerNo">
          <input type="hidden" id="ezTowerNamaHidden">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">

            <!-- 1. TOP SKOR (KOLOM E, F, G, H) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2.5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">TOP SKOR</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Topi Pelindung Insulator)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom E - H</span>
              </div>

              <!-- Line 1: Kolom E & F -->
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" id="ezTopSkorL1" onchange="onEZCheckboxChange('ezTopSkorL1', 'ezTopSkorL1Date')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                    <span>Line 1 Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom E)</span></span>
                  </label>
                  <button type="button" onclick="setEZToday('ezTopSkorL1Date', 'ezTopSkorL1')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
                </div>
                <input type="text" id="ezTopSkorL1Date" placeholder="Tanggal (contoh: 05/19/2025)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
              </div>

              <!-- Line 2: Kolom G & H -->
              <div class="space-y-1 pt-1 border-t border-slate-100">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" id="ezTopSkorL2" onchange="onEZCheckboxChange('ezTopSkorL2', 'ezTopSkorL2Date')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                    <span>Line 2 Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom G)</span></span>
                  </label>
                  <button type="button" onclick="setEZToday('ezTopSkorL2Date', 'ezTopSkorL2')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
                </div>
                <input type="text" id="ezTopSkorL2Date" placeholder="Tanggal (contoh: 05/19/2025)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
              </div>
            </div>

            <!-- 2. IRONMAN (KOLOM I, J, K, L) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2.5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">IRONMAN</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Pelindung Rangka Baja)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom I - L</span>
              </div>

              <!-- Line 1: Kolom I & J -->
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" id="ezIronmanL1" onchange="onEZCheckboxChange('ezIronmanL1', 'ezIronmanL1Date')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                    <span>Line 1 Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom I)</span></span>
                  </label>
                  <button type="button" onclick="setEZToday('ezIronmanL1Date', 'ezIronmanL1')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
                </div>
                <input type="text" id="ezIronmanL1Date" placeholder="Tanggal pasang Line 1" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
              </div>

              <!-- Line 2: Kolom K & L -->
              <div class="space-y-1 pt-1 border-t border-slate-100">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" id="ezIronmanL2" onchange="onEZCheckboxChange('ezIronmanL2', 'ezIronmanL2Date')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                    <span>Line 2 Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom K)</span></span>
                  </label>
                  <button type="button" onclick="setEZToday('ezIronmanL2Date', 'ezIronmanL2')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
                </div>
                <input type="text" id="ezIronmanL2Date" placeholder="Tanggal pasang Line 2" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
              </div>
            </div>

            <!-- 3. BOLUVES (KOLOM M & N) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">BOLUVES</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Bolu Aves)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom M & N</span>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input type="checkbox" id="ezBoluves" onchange="onEZCheckboxChange('ezBoluves', 'ezBoluvesDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                  <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom M)</span></span>
                </label>
                <button type="button" onclick="setEZToday('ezBoluvesDate', 'ezBoluves')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
              </div>
              <input type="text" id="ezBoluvesDate" placeholder="Tanggal Pasang Boluves (Kolom N)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
            </div>

            <!-- 4. JARING (KOLOM O & P) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">JARING</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Jaring Kaki Tower)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom O & P</span>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input type="checkbox" id="ezJaring" onchange="onEZCheckboxChange('ezJaring', 'ezJaringDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                  <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom O)</span></span>
                </label>
                <button type="button" onclick="setEZToday('ezJaringDate', 'ezJaring')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
              </div>
              <input type="text" id="ezJaringDate" placeholder="Tanggal Pasang Jaring (Kolom P)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
            </div>

            <!-- 5. PELAKOR (KOLOM Q & R) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">PELAKOR</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Pelindung Arching Horn)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom Q & R</span>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input type="checkbox" id="ezPelakor" onchange="onEZCheckboxChange('ezPelakor', 'ezPelakorDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                  <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom Q)</span></span>
                </label>
                <button type="button" onclick="setEZToday('ezPelakorDate', 'ezPelakor')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
              </div>
              <input type="text" id="ezPelakorDate" placeholder="Tanggal Pasang Pelakor (Kolom R)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
            </div>

            <!-- 6. KAWAT SILET (KOLOM S & T) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">KAWAT SILET</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Member Bawah Tower)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom S & T</span>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input type="checkbox" id="ezKawatSilet" onchange="onEZCheckboxChange('ezKawatSilet', 'ezKawatSiletDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                  <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom S)</span></span>
                </label>
                <button type="button" onclick="setEZToday('ezKawatSiletDate', 'ezKawatSilet')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
              </div>
              <input type="text" id="ezKawatSiletDate" placeholder="Tanggal Pasang Kawat Silet (Kolom T)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
            </div>

            <!-- 7. ASB (KOLOM U & V) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">ASB</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Anti Sarang Burung)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom U & V</span>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input type="checkbox" id="ezAsb" onchange="onEZCheckboxChange('ezAsb', 'ezAsbDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                  <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom U)</span></span>
                </label>
                <button type="button" onclick="setEZToday('ezAsbDate', 'ezAsb')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
              </div>
              <input type="text" id="ezAsbDate" placeholder="Tanggal Pasang ASB (Kolom V)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
            </div>

            <!-- 8. PEMVES (KOLOM W & X) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">PEMVES</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Pembungkus Traves 20 kV)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom W & X</span>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input type="checkbox" id="ezPemves" onchange="onEZCheckboxChange('ezPemves', 'ezPemvesDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                  <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom W)</span></span>
                </label>
                <button type="button" onclick="setEZToday('ezPemvesDate', 'ezPemves')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
              </div>
              <input type="text" id="ezPemvesDate" placeholder="Tanggal Pasang Pemves (Kolom X)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
            </div>

            <!-- 9. TOGAR ABES (KOLOM Y & Z) -->
            <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-sm space-y-2 md:col-span-2">
              <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="font-bold text-slate-800 text-[13px]">TOGAR ABES</span>
                  <span class="text-[10px] text-slate-400 font-normal">(Penghalang Kawat Traves Tengah Tower)</span>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Kolom Y & Z</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center justify-between pt-1">
                  <label class="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input type="checkbox" id="ezTogarAbes" onchange="onEZCheckboxChange('ezTogarAbes', 'ezTogarAbesDate')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                    <span>Terpasang <span class="text-[10px] text-slate-400 font-normal">(Kolom Y)</span></span>
                  </label>
                  <button type="button" onclick="setEZToday('ezTogarAbesDate', 'ezTogarAbes')" class="text-[10px] text-sky-600 hover:underline">Hari Ini</button>
                </div>
                <input type="text" id="ezTogarAbesDate" placeholder="Tanggal Pasang Togar Abes (Kolom Z)" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500">
              </div>
            </div>

          </div>

          <!-- RINGKASAN OUTPUT OTOMATIS KE SPREADSHEET -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div class="font-bold text-slate-700 flex items-center justify-between">
              <span>Hasil Sinkronisasi Kolom Spreadsheet:</span>
              <span class="text-[11px] text-slate-400 font-normal">Otomatis sinkron ke Kolom 5-26 & Kolom 36</span>
            </div>
            <div class="text-[11px] text-slate-600 flex flex-wrap items-center gap-2">
              <span>Perangkat Terpasang (Kolom AJ):</span>
              <span id="ezPreviewKolomAJ" class="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">-</span>
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
            <button type="button" onclick="closeModalKolomEZ()" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Batal</button>
            <button type="submit" id="btnSubmitKolomEZ" class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm transition">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Simpan ke Spreadsheet (Kolom E–Z)</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}
