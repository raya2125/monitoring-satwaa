/**
 * KOMPONEN: QUICK CATEGORY PILL BUTTONS & COUNTER
 */

function renderCategoryButtonsComponent() {
  const container = document.getElementById("categoryButtonsSection");
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-slate-600 mr-1">Filter Cepat Satwa:</span>
        <button onclick="setCategoryFilter('')" id="btnFilterAll" class="px-3 py-1 rounded-full text-xs font-semibold bg-sky-600 text-white shadow-sm transition">
          Semua Menara <span id="btnCountAll" class="ml-1 opacity-80">3.201</span>
        </button>
        <button onclick="setCategoryFilter('BURUNG')" id="btnFilterBurung" class="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
          BURUNG <span id="btnCountBurung" class="ml-1 text-slate-400">38</span>
        </button>
        <button onclick="setCategoryFilter('KERA')" id="btnFilterKera" class="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
          KERA <span id="btnCountKera" class="ml-1 text-slate-400">61</span>
        </button>
        <button onclick="setCategoryFilter('ULAR')" id="btnFilterUlar" class="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
          ULAR <span id="btnCountUlar" class="ml-1 text-slate-400">138</span>
        </button>
        <button onclick="setCategoryFilter('KERA, BURUNG')" id="btnFilterKeraBurung" class="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
          KERA & BURUNG <span id="btnCountKeraBurung" class="ml-1 text-slate-400">35</span>
        </button>
        <button onclick="setCategoryFilter('(Blanks) / Tidak Ada')" id="btnFilterBlanks" class="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
          (Blanks) / Aman <span id="btnCountBlanks" class="ml-1 text-slate-400">2.921</span>
        </button>
      </div>

      <div class="text-xs text-slate-500 font-medium">
        Menampilkan <span id="displayedCount" class="font-bold text-slate-800">3.201</span> menara
      </div>
    </div>
  `;
}
