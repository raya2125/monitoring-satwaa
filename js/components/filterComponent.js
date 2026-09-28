/**
 * KOMPONEN: FILTER BAR DINAMIS SPESIFIK PER TAB
 * Menampilkan bilah filter yang relevan dengan masing-masing tab aktif:
 * 1. Ringkasan & Analitik
 * 2. Manajemen Asset Tower (Fokus Kolom E s.d. Z)
 * 3. Kerawanan Satwa (Fokus Kolom AL & AM)
 * 4. Rencana Tindak Lanjut (Fokus Kolom AR s.d. BA - dipindah ke posisi atas)
 */

function getSuttComboboxHtml(tabKey) {
  return `
    <div class="relative w-60 md:w-64" id="suttComboboxContainer_${tabKey}">
      <input type="hidden" id="filterSutt_${tabKey}" value="">
      
      <div class="relative flex items-center">
        <input 
          type="text" 
          id="suttSearchInput_${tabKey}" 
          placeholder="SUTT: Semua Jalur (39)" 
          autocomplete="off"
          spellcheck="false"
          onfocus="openSuttDropdown('${tabKey}')" 
          oninput="handleSuttInput('${tabKey}', this.value)" 
          onkeydown="handleSuttKeydown('${tabKey}', event)"
          class="w-full pl-3 pr-14 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700 font-medium transition cursor-text placeholder:text-slate-500"
        >
        <div class="absolute right-2 flex items-center gap-1 text-slate-400">
          <button type="button" id="suttClearBtn_${tabKey}" onclick="clearSuttSearch('${tabKey}', event)" class="hidden hover:text-rose-500 p-0.5 rounded transition" title="Hapus Pilihan Jalur">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" id="suttToggleBtn_${tabKey}" onclick="toggleSuttDropdown('${tabKey}', event)" class="hover:text-slate-600 p-0.5 rounded transition" title="Buka Daftar Jalur">
            <i data-lucide="chevron-down" id="suttChevron_${tabKey}" class="w-3.5 h-3.5 transition-transform duration-200"></i>
          </button>
        </div>
      </div>

      <!-- Floating Dropdown Menu -->
      <div id="suttDropdownMenu_${tabKey}" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
        <div id="suttOptionsList_${tabKey}" class="p-1 space-y-0.5 text-xs font-medium">
          <!-- Diisi otomatis oleh JavaScript -->
        </div>
      </div>
    </div>
  `;
}

function renderFilterComponent() {
  const container = document.getElementById("filterSection");
  if (!container) return;

  container.innerHTML = `
    <!-- 1. FILTER BAR TAB 1: RINGKASAN & ANALITIK -->
    <div id="filterBarAnalitik" class="hidden bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 flex-1 flex-wrap">
        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold shrink-0 border border-sky-100">
          <i data-lucide="bar-chart-3" class="w-3.5 h-3.5"></i>
          <span>Filter Analitik</span>
        </div>

        <div class="relative flex-1 min-w-[220px]">
          <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
          <input type="text" id="searchInput_analitik" oninput="applyFilters('analitik')" placeholder="Cari Tower, Jalur, Satwa di Ringkasan..." 
                 class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700">
        </div>

        <div class="w-48">
          <select id="filterUltg_analitik" onchange="onUltgChange('analitik')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium">
            <option value="">ULTG: Semua ULTG (6)</option>
            <option value="ULTG BETUNG">ULTG BETUNG</option>
            <option value="ULTG KERAMASAN">ULTG KERAMASAN</option>
            <option value="ULTG BOOM BARU">ULTG BOOM BARU</option>
            <option value="ULTG BORANG">ULTG BORANG</option>
            <option value="ULTG BANGKA">ULTG BANGKA</option>
            <option value="ULTG BELITUNG">ULTG BELITUNG</option>
          </select>
        </div>

        ${getSuttComboboxHtml('analitik')}
      </div>

      <button type="button" onclick="resetFilters('analitik')" title="Reset Filter Analitik" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition shrink-0" id="btnResetAnalitik">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. FILTER BAR TAB 2: MANAJEMEN ASSET TOWER (KOLOM E s.d. Z) -->
    <div id="filterBarManajemen" class="hidden bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 flex-1 flex-wrap">
        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 border border-emerald-100">
          <i data-lucide="layers" class="w-3.5 h-3.5"></i>
          <span>Filter Asset & Proteksi</span>
        </div>

        <div class="relative flex-1 min-w-[200px]">
          <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
          <input type="text" id="searchInput_manajemen" oninput="applyFilters('manajemen')" placeholder="Cari Tower, Jalur, Proteksi..." 
                 class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700">
        </div>

        <div class="w-44">
          <select id="filterUltg_manajemen" onchange="onUltgChange('manajemen')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium">
            <option value="">ULTG: Semua (6)</option>
            <option value="ULTG BETUNG">ULTG BETUNG</option>
            <option value="ULTG KERAMASAN">ULTG KERAMASAN</option>
            <option value="ULTG BOOM BARU">ULTG BOOM BARU</option>
            <option value="ULTG BORANG">ULTG BORANG</option>
            <option value="ULTG BANGKA">ULTG BANGKA</option>
            <option value="ULTG BELITUNG">ULTG BELITUNG</option>
          </select>
        </div>

        ${getSuttComboboxHtml('manajemen')}

        <!-- Filter Status Proteksi Terpasang / Belum -->
        <div class="w-40">
          <select id="filterProteksi_manajemen" onchange="applyFilters('manajemen')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700">
            <option value="">Proteksi: Semua Status</option>
            <option value="TERPASANG">✓ Terpasang</option>
            <option value="BELUM TERPASANG">✗ Belum Terpasang</option>
          </select>
        </div>

        <!-- Filter Perangkat Proteksi Kolom E s.d. Z -->
        <div class="w-48">
          <select id="filterPerangkat_manajemen" onchange="applyFilters('manajemen')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700">
            <option value="">Perangkat (E-Z): Semua</option>
            <option value="PENGHALANG PANJAT">PENGHALANG PANJAT</option>
            <option value="KAWAT DURI">KAWAT DURI</option>
            <option value="JARING">JARING</option>
            <option value="TOGAR ABES">TOGAR ABES</option>
            <option value="BOLUVES">BOLUVES</option>
            <option value="ASB">ASB</option>
            <option value="IRON MAN">IRON MAN</option>
            <option value="PEMVES">PEMVES</option>
            <option value="TOP SKOR">TOP SKOR</option>
            <option value="PELAKOR">PELAKOR</option>
            <option value="KAWAT SILET">KAWAT SILET</option>
          </select>
        </div>
      </div>

      <button type="button" onclick="resetFilters('manajemen')" title="Reset Filter Manajemen Asset" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition shrink-0" id="btnResetManajemen">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 3. FILTER BAR TAB 3: KERAWANAN SATWA (KOLOM AL & AM) -->
    <div id="filterBarSatwa" class="hidden bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 flex-1 flex-wrap">
        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold shrink-0 border border-purple-100">
          <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i>
          <span>Filter Kerawanan Satwa</span>
        </div>

        <div class="relative flex-1 min-w-[200px]">
          <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
          <input type="text" id="searchInput_satwa" oninput="applyFilters('satwa')" placeholder="Cari Tower, Jalur, Kategori Satwa..." 
                 class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700">
        </div>

        <div class="w-44">
          <select id="filterUltg_satwa" onchange="onUltgChange('satwa')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium">
            <option value="">ULTG: Semua (6)</option>
            <option value="ULTG BETUNG">ULTG BETUNG</option>
            <option value="ULTG KERAMASAN">ULTG KERAMASAN</option>
            <option value="ULTG BOOM BARU">ULTG BOOM BARU</option>
            <option value="ULTG BORANG">ULTG BORANG</option>
            <option value="ULTG BANGKA">ULTG BANGKA</option>
            <option value="ULTG BELITUNG">ULTG BELITUNG</option>
          </select>
        </div>

        ${getSuttComboboxHtml('satwa')}

        <!-- Filter Satwa Kolom AL -->
        <div class="w-56">
          <select id="filterKategori_satwa" onchange="applyFilters('satwa')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700">
            <option value="">Satwa (AL): Semua Kategori</option>
            <option value="BURUNG">🦅 BURUNG</option>
            <option value="KERA">🐒 KERA</option>
            <option value="ULAR">🐍 ULAR</option>
            <option value="KERA, BURUNG">🐒🦅 KERA, BURUNG</option>
            <option value="ULAR, BURUNG">🐍🦅 ULAR, BURUNG</option>
            <option value="KERA, ULAR">🐒🐍 KERA, ULAR</option>
            <option value="(Blanks) / Tidak Ada">⚪ (Blanks) / Aman</option>
          </select>
        </div>

        <!-- Filter Evaluasi Kesesuaian Kolom AM -->
        <div class="w-44">
          <select id="filterAktivitas_satwa" onchange="applyFilters('satwa')" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700">
            <option value="">Evaluasi (AM): Semua</option>
            <option value="Sesuai">✓ Sesuai</option>
            <option value="Tidak Sesuai">✗ Tidak Sesuai</option>
          </select>
        </div>
      </div>

      <button type="button" onclick="resetFilters('satwa')" title="Reset Filter Kerawanan Satwa" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition shrink-0" id="btnResetSatwa">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 4. FILTER BAR TAB 4: RENCANA TINDAK LANJUT (KOLOM AR s.d. BA) -->
    <!-- Dipindahkan dari Section 3 bawah ke posisi filter bar atas -->
    <div id="filterBarTindakLanjut" class="hidden bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 flex-1 flex-wrap">
        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold shrink-0 border border-sky-100">
          <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
          <span>Filter Tindak Lanjut</span>
        </div>

        <!-- PENCARIAN TOWER / JALUR -->
        <div class="relative flex-1 min-w-[200px]">
          <i data-lucide="search" class="w-4 h-4 absolute left-3 top-2.5 text-slate-400"></i>
          <input type="text" id="tindakLanjutSearchInput" oninput="onTindakLanjutSearchChange(this.value)" placeholder="Cari Nama Tower / Jalur..." 
                 class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white">
        </div>

        <!-- FILTER ULTG -->
        <div class="w-40">
          <select id="tindakLanjutFilterUltg" onchange="onTindakLanjutUltgChange(this.value)" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-sky-500">
            <option value="">Semua ULTG (6)</option>
            <option value="ULTG BETUNG">ULTG BETUNG</option>
            <option value="ULTG KERAMASAN">ULTG KERAMASAN</option>
            <option value="ULTG BOOM BARU">ULTG BOOM BARU</option>
            <option value="ULTG BORANG">ULTG BORANG</option>
            <option value="ULTG BANGKA">ULTG BANGKA</option>
            <option value="ULTG BELITUNG">ULTG BELITUNG</option>
          </select>
        </div>

        <!-- FILTER SATWA (KOLOM AP) -->
        <div class="w-36">
          <select id="tindakLanjutFilterSatwa" onchange="onTindakLanjutSatwaChange(this.value)" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-sky-500">
            <option value="">Semua Satwa</option>
            <option value="KERA">🐒 KERA</option>
            <option value="ULAR">🐍 ULAR</option>
            <option value="BURUNG">🦅 BURUNG</option>
          </select>
        </div>

        <!-- FILTER STATUS RENCANA -->
        <div class="w-40">
          <select id="tindakLanjutFilterStatus" onchange="onTindakLanjutStatusChange(this.value)" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-sky-500">
            <option value="">Semua Status</option>
            <option value="belum">Belum Ada Rencana</option>
            <option value="sudah">Sudah Ada Rencana</option>
          </select>
        </div>

        <!-- TOGGLE SCOPE: KHUSUS KOLOM AP vs SEMUA MENARA -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button id="btnScopeOnlyAP" onclick="toggleTindakLanjutScope(true)" class="px-2.5 py-1.5 text-xs font-bold rounded-lg border transition bg-sky-600 text-white border-sky-600 shadow-sm">
            <i data-lucide="filter" class="w-3 h-3 inline mr-1"></i>
            Khusus Kolom AP (108)
          </button>
          <button id="btnScopeAllTowers" onclick="toggleTindakLanjutScope(false)" class="px-2.5 py-1.5 text-xs font-medium rounded-lg border transition bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100">
            Semua Menara (3.201)
          </button>
        </div>
      </div>

      <!-- RESET FILTER TINDAK LANJUT -->
      <button type="button" onclick="resetTindakLanjutFilters()" title="Reset Filter Rencana Tindak Lanjut" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition shrink-0" id="btnResetTindakLanjut">
        <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
      </button>
    </div>
  `;
}
