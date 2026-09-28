/**
 * KOMPONEN: STRUKTUR DATA TABLE & PAGINASI
 * Header tabel dirender secara dinamis oleh table.js sesuai tab aktif (Manajemen Asset vs Kerawanan Satwa)
 */

function renderTableStructureComponent() {
  const container = document.getElementById("tableSection");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden space-y-0">
      
      <!-- TOP TABLE HEADER & CONTROLS -->
      <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 id="tableMainTitle" class="text-sm font-bold text-slate-800">Daftar Menara Transmisi & Status Proteksi</h3>
            <span id="tableFocusBadge" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Fokus: Pemasangan Proteksi (Kolom E s.d. Z)
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Menampilkan <span id="tableRangeText" class="font-semibold text-slate-600">1 - 25</span> dari <span id="tableFilteredTotal" class="font-semibold text-slate-600">3201</span> tower [Total data: <span id="tableTotalData" class="font-semibold text-slate-600">3201</span>]
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Per halaman:</span>
            <select id="rowsPerPage" onchange="changePageSize(this.value)" class="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium">
              <option value="10">10</option>
              <option value="25" selected>25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <button onclick="openAddNewModal()" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-sm transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Tambah Baru</span>
          </button>
        </div>
      </div>

      <!-- TABLE WRAPPER -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead id="towerTableHead">
            <!-- Diisi secara dinamis oleh table.js sesuai tab aktif -->
          </thead>
          <tbody id="towerTableBody" class="divide-y divide-slate-100 font-normal">
            <!-- Diisi secara dinamis oleh table.js -->
          </tbody>
        </table>
      </div>

      <!-- FOOTER PAGINATION -->
      <div class="p-3.5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div class="text-[11px] text-slate-400" id="paginationSummary">
          Menampilkan baris data
        </div>

        <div class="flex items-center gap-1.5" id="paginationControls"></div>
      </div>
    </div>
  `;
}
