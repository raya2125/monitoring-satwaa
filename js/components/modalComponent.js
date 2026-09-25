/**
 * KOMPONEN: MODAL EDIT & TAMBAH DATA TOWER
 */

function renderModalComponent() {
  const container = document.getElementById("modalSection");
  if (!container) return;

  container.innerHTML = `
    <div id="editModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 relative">
        <div class="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-800">Edit Data Proteksi Tower Transmisi</h3>
            <p class="text-xs text-slate-400 mt-0.5">Perubahan akan langsung disinkronkan ke sumber data spreadsheet secara realtime.</p>
          </div>
          <button onclick="closeEditModal()" class="text-slate-400 hover:text-slate-600 p-1">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form id="editTowerForm" onsubmit="submitTowerUpdate(event)" class="space-y-4 text-xs">
          <input type="hidden" id="editRowNumber">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">Nama / ID Tower *</label>
              <input type="text" id="editTowerName" required class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500">
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">Unit Layanan (ULTG) *</label>
              <select id="editUltg" onchange="onEditUltgChange()" required class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-700 bg-white">
                <option value="ULTG BETUNG">ULTG BETUNG</option>
                <option value="ULTG KERAMASAN">ULTG KERAMASAN</option>
                <option value="ULTG BOOM BARU">ULTG BOOM BARU</option>
                <option value="ULTG BORANG">ULTG BORANG</option>
                <option value="ULTG BANGKA">ULTG BANGKA</option>
                <option value="ULTG BELITUNG">ULTG BELITUNG</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-700 font-semibold mb-1">Jalur Transmisi (SUTT/SUTET) *</label>
            <select id="editJalur" required class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-700 bg-white">
            </select>
          </div>

          <!-- INPUT SATWA KOLOM AL & KOLOM AM -->
          <div class="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>DATA SATWA SPREADSHEET (KOLOM AL & AM)</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">Kolom AL & AM</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label class="block text-slate-600 font-semibold mb-1">Binatang 1 <span class="text-sky-600 font-bold">(Kolom AL)</span></label>
                <select id="editBinatang1" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800 bg-white font-medium text-xs">
                  <option value="">(Kosong / Tidak Ada)</option>
                  <option value="KERA">KERA</option>
                  <option value="BURUNG">BURUNG</option>
                  <option value="ULAR">ULAR</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-600 font-semibold mb-1">Binatang 2 <span class="text-sky-600 font-bold">(Kolom AM)</span></label>
                <select id="editBinatang2" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800 bg-white font-medium text-xs">
                  <option value="">(Kosong / Tidak Ada)</option>
                  <option value="BURUNG">BURUNG</option>
                  <option value="KERA">KERA</option>
                  <option value="ULAR">ULAR</option>
                </select>
              </div>
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button type="button" onclick="closeEditModal()" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">Batal</button>
            <button type="submit" id="btnSubmitEdit" class="px-5 py-2 rounded-lg bg-[#0284c7] hover:bg-sky-600 text-white font-semibold flex items-center gap-2 shadow-sm transition">
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
