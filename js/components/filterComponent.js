/**
 * KOMPONEN: SEARCH & CASCADING FILTER BAR (ULTG -> SUTT)
 */

function renderFilterComponent() {
  const container = document.getElementById("filterSection");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[240px]">
        <i data-lucide="search" class="w-4 h-4 absolute left-3 top-3 text-slate-400"></i>
        <input type="text" id="searchInput" oninput="applyFilters()" placeholder="Cari Tower, Jalur, Satwa..." 
               class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700">
      </div>

      <div class="w-52">
        <select id="filterUltg" onchange="onUltgChange()" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium">
          <option value="">ULTG: Semua ULTG (6)</option>
          <option value="ULTG BETUNG">ULTG BETUNG</option>
          <option value="ULTG KERAMASAN">ULTG KERAMASAN</option>
          <option value="ULTG BOOM BARU">ULTG BOOM BARU</option>
          <option value="ULTG BORANG">ULTG BORANG</option>
          <option value="ULTG BANGKA">ULTG BANGKA</option>
          <option value="ULTG BELITUNG">ULTG BELITUNG</option>
        </select>
      </div>

      <!-- SEARCHABLE COMBOBOX SUTT (Bisa Ketik Langsung & Dropdown) -->
      <div class="relative w-64 md:w-72" id="suttComboboxContainer">
        <input type="hidden" id="filterSutt" value="">
        
        <div class="relative flex items-center">
          <input 
            type="text" 
            id="suttSearchInput" 
            placeholder="SUTT: Semua Jalur (39)" 
            autocomplete="off"
            spellcheck="false"
            onfocus="openSuttDropdown()" 
            oninput="handleSuttInput(this.value)" 
            onkeydown="handleSuttKeydown(event)"
            class="w-full pl-3 pr-14 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700 font-medium transition cursor-text placeholder:text-slate-500"
          >
          <div class="absolute right-2 flex items-center gap-1 text-slate-400">
            <button type="button" id="suttClearBtn" onclick="clearSuttSearch(event)" class="hidden hover:text-rose-500 p-0.5 rounded transition" title="Hapus Pilihan Jalur">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" id="suttToggleBtn" onclick="toggleSuttDropdown(event)" class="hover:text-slate-600 p-0.5 rounded transition" title="Buka Daftar Jalur">
              <i data-lucide="chevron-down" id="suttChevron" class="w-3.5 h-3.5 transition-transform duration-200"></i>
            </button>
          </div>
        </div>

        <!-- Floating Dropdown Menu -->
        <div id="suttDropdownMenu" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
          <div id="suttOptionsList" class="p-1 space-y-0.5 text-xs font-medium">
            <!-- Diisi otomatis oleh JavaScript -->
          </div>
        </div>
      </div>

      <div class="w-64">
        <select id="filterKategori" onchange="applyFilters()" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700">
          <option value="">RAWAN SATWA (Kolom AP): Semua</option>
          <option value="BURUNG">BURUNG</option>
          <option value="KERA">KERA</option>
          <option value="ULAR">ULAR</option>
          <option value="KERA, BURUNG">KERA, BURUNG</option>
          <option value="ULAR, BURUNG">ULAR, BURUNG</option>
          <option value="KERA, ULAR">KERA, ULAR</option>
          <option value="(Blanks) / Tidak Ada">(Blanks) / Tidak Ada</option>
        </select>
      </div>

      <div class="w-40">
        <select id="filterProteksi" onchange="applyFilters()" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700">
          <option value="">Proteksi: Semua</option>
          <option value="TERPASANG">Terpasang</option>
          <option value="BELUM TERPASANG">Belum Terpasang</option>
        </select>
      </div>

      <button type="button" onclick="resetAllFilters()" title="Reset Semua Filter" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition" id="btnResetFilters">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
      </button>
    </div>
  `;
}
