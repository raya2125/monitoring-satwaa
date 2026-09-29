/**
 * LOGIKA FILTER DINAMIS & CASCADING ULTG-SUTT PER TAB
 * Mendukung filter spesifik untuk:
 * - Tab 1: Ringkasan & Analitik
 * - Tab 2: Manajemen Asset Tower (Kolom E s.d. Z)
 * - Tab 3: Kerawanan Satwa (Kolom AL & AM)
 * - Tab 4: Rencana Tindak Lanjut (Kolom AR s.d. BA)
 */

// Mengambil daftar jalur SUTT sesuai ULTG
function getJalursForUltg(selectedUltg) {
  const jalurs = new Set();
  if (!selectedUltg) {
    // Semua ULTG: tampilkan seluruh jalur
    Object.values(ultgJalurMapping).forEach(list => list.forEach(j => jalurs.add(j)));
    towerData.forEach(t => { if (t.jalur) jalurs.add(t.jalur); });
  } else {
    // ULTG spesifik: ambil jalur milik ULTG tersebut
    (ultgJalurMapping[selectedUltg] || []).forEach(j => jalurs.add(j));
    towerData.forEach(t => {
      if (t.ultg === selectedUltg && t.jalur) jalurs.add(t.jalur);
    });
  }
  return Array.from(jalurs).sort();
}

// State combobox SUTT per tab
const suttActiveIndexMap = {
  analitik: -1,
  manajemen: -1,
  satwa: -1
};

// Helper untuk highlight teks yang cocok
function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, `<span class="bg-amber-100 text-amber-900 font-bold px-0.5 rounded">$1</span>`);
}

// Render opsi-opsi pada dropdown SUTT
function renderSuttDropdown(tabKey = "analitik", query = "") {
  const optionsList = document.getElementById(`suttOptionsList_${tabKey}`);
  if (!optionsList) return;

  const ultgSelect = document.getElementById(`filterUltg_${tabKey}`);
  const selectedUltg = ultgSelect ? ultgSelect.value : "";
  const currentVal = (document.getElementById(`filterSutt_${tabKey}`) && document.getElementById(`filterSutt_${tabKey}`).value) || "";
  const availableJalurs = getJalursForUltg(selectedUltg);

  const cleanQuery = query.toLowerCase().trim();
  const matchedJalurs = cleanQuery 
    ? availableJalurs.filter(j => {
        const parentUltg = (getUltgByJalur(j) || "").toLowerCase();
        return j.toLowerCase().includes(cleanQuery) || parentUltg.includes(cleanQuery);
      })
    : availableJalurs;

  let html = "";

  // Opsi Reset / Semua Jalur
  const isAllSelected = !currentVal;
  html += `
    <div onclick="selectSuttOption('${tabKey}', '')" 
         class="px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${isAllSelected ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}"
         data-index="0"
         data-value="">
      <div class="flex items-center gap-2">
        <i data-lucide="layers" class="w-3.5 h-3.5 ${isAllSelected ? 'text-sky-600' : 'text-slate-400'}"></i>
        <span>Semua Jalur (${availableJalurs.length})</span>
      </div>
      ${isAllSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-sky-600"></i>' : ''}
    </div>
  `;

  if (matchedJalurs.length === 0) {
    html += `
      <div class="p-3 text-center text-slate-400 text-xs">
        <p>Tidak ada jalur yang cocok dengan "<span class="font-semibold text-slate-600">${query}</span>"</p>
        <button type="button" onclick="clearSuttSearch('${tabKey}', event)" class="mt-1.5 px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-medium transition">
          Reset Pencarian
        </button>
      </div>
    `;
  } else {
    matchedJalurs.forEach((jalur, idx) => {
      const isSelected = jalur === currentVal;
      const parentUltg = getUltgByJalur(jalur) || "";
      const ultgShort = parentUltg.replace("ULTG ", "");
      const highlightedName = highlightMatch(jalur, cleanQuery);

      html += `
        <div onclick="selectSuttOption('${tabKey}', '${jalur.replace(/'/g, "\\'")}')" 
             class="sutt-option-item px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100' : 'text-slate-700 hover:bg-slate-50'}"
             data-index="${idx + 1}"
             data-value="${jalur.replace(/"/g, '&quot;')}">
          <div class="flex items-center gap-2 min-w-0 pr-2">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-600' : 'text-slate-300'}"></i>
            <span class="truncate">${highlightedName}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            ${ultgShort ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">${ultgShort}</span>` : ''}
            ${isSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-sky-600 shrink-0"></i>' : ''}
          </div>
        </div>
      `;
    });
  }

  optionsList.innerHTML = html;
  if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

// Buka dropdown SUTT
function openSuttDropdown(tabKey = "analitik") {
  const menu = document.getElementById(`suttDropdownMenu_${tabKey}`);
  const chevron = document.getElementById(`suttChevron_${tabKey}`);
  const searchInput = document.getElementById(`suttSearchInput_${tabKey}`);
  if (!menu) return;

  menu.classList.remove("hidden");
  if (chevron) chevron.classList.add("rotate-180");
  
  const query = searchInput ? searchInput.value : "";
  const currentVal = (document.getElementById(`filterSutt_${tabKey}`) && document.getElementById(`filterSutt_${tabKey}`).value) || "";
  renderSuttDropdown(tabKey, query === currentVal ? "" : query);
  suttActiveIndexMap[tabKey] = -1;
}

// Tutup dropdown SUTT
function closeSuttDropdown(tabKey = "analitik") {
  const menu = document.getElementById(`suttDropdownMenu_${tabKey}`);
  const chevron = document.getElementById(`suttChevron_${tabKey}`);
  const searchInput = document.getElementById(`suttSearchInput_${tabKey}`);
  const hiddenInput = document.getElementById(`filterSutt_${tabKey}`);

  if (!menu) return;
  menu.classList.add("hidden");
  if (chevron) chevron.classList.remove("rotate-180");

  if (searchInput && hiddenInput) {
    if (hiddenInput.value) {
      searchInput.value = hiddenInput.value;
    } else {
      searchInput.value = "";
    }
  }
}

// Toggle buka/tutup dropdown SUTT
function toggleSuttDropdown(tabKey = "analitik", e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById(`suttDropdownMenu_${tabKey}`);
  const searchInput = document.getElementById(`suttSearchInput_${tabKey}`);

  if (menu && !menu.classList.contains("hidden")) {
    closeSuttDropdown(tabKey);
  } else {
    if (searchInput) searchInput.focus();
    openSuttDropdown(tabKey);
  }
}

// Pilih opsi SUTT dari dropdown
function selectSuttOption(tabKey = "analitik", jalur) {
  const hiddenInput = document.getElementById(`filterSutt_${tabKey}`);
  const searchInput = document.getElementById(`suttSearchInput_${tabKey}`);
  const clearBtn = document.getElementById(`suttClearBtn_${tabKey}`);

  if (hiddenInput) hiddenInput.value = jalur;
  if (searchInput) searchInput.value = jalur;

  if (clearBtn) {
    if (jalur) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }

  closeSuttDropdown(tabKey);
  onSuttChange(tabKey);
}

// Hapus pilihan / reset SUTT
function clearSuttSearch(tabKey = "analitik", e) {
  if (e) e.stopPropagation();
  const hiddenInput = document.getElementById(`filterSutt_${tabKey}`);
  const searchInput = document.getElementById(`suttSearchInput_${tabKey}`);
  const clearBtn = document.getElementById(`suttClearBtn_${tabKey}`);

  if (hiddenInput) hiddenInput.value = "";
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  if (clearBtn) clearBtn.classList.add("hidden");

  renderSuttDropdown(tabKey, "");
  onSuttChange(tabKey);
}

// Handle ketikan user di input SUTT (Ketik langsung untuk mencari jalur)
function handleSuttInput(tabKey = "analitik", query) {
  const menu = document.getElementById(`suttDropdownMenu_${tabKey}`);
  const clearBtn = document.getElementById(`suttClearBtn_${tabKey}`);
  const hiddenInput = document.getElementById(`filterSutt_${tabKey}`);

  if (menu && menu.classList.contains("hidden")) {
    openSuttDropdown(tabKey);
  }

  if (clearBtn) {
    if (query.trim()) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }

  renderSuttDropdown(tabKey, query);

  // Jika input dikosongkan total, langsung reset filter
  if (!query.trim() && hiddenInput && hiddenInput.value) {
    hiddenInput.value = "";
    applyFilters(tabKey);
  }
}

// Keyboard navigation untuk SUTT combobox (ArrowUp, ArrowDown, Enter, Esc)
function handleSuttKeydown(tabKey = "analitik", e) {
  const menu = document.getElementById(`suttDropdownMenu_${tabKey}`);
  const items = document.querySelectorAll(`#suttOptionsList_${tabKey} .sutt-option-item, #suttOptionsList_${tabKey} [data-value='']`);
  
  if (e.key === "Escape") {
    closeSuttDropdown(tabKey);
    return;
  }

  let activeIndex = suttActiveIndexMap[tabKey] !== undefined ? suttActiveIndexMap[tabKey] : -1;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!menu || menu.classList.contains("hidden")) {
      openSuttDropdown(tabKey);
      return;
    }
    if (items.length > 0) {
      activeIndex = (activeIndex + 1) % items.length;
      suttActiveIndexMap[tabKey] = activeIndex;
      highlightActiveSuttItem(tabKey, items, activeIndex);
    }
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!menu || menu.classList.contains("hidden")) {
      openSuttDropdown(tabKey);
      return;
    }
    if (items.length > 0) {
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      suttActiveIndexMap[tabKey] = activeIndex;
      highlightActiveSuttItem(tabKey, items, activeIndex);
    }
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    if (items.length > 0 && activeIndex >= 0 && activeIndex < items.length) {
      const selectedVal = items[activeIndex].getAttribute("data-value");
      selectSuttOption(tabKey, selectedVal);
    } else {
      // Jika user tekan enter tanpa panah, pilih opsi pertama yang cocok
      const firstItem = document.querySelector(`#suttOptionsList_${tabKey} .sutt-option-item`);
      if (firstItem) {
        selectSuttOption(tabKey, firstItem.getAttribute("data-value"));
      } else {
        closeSuttDropdown(tabKey);
      }
    }
  }
}

function highlightActiveSuttItem(tabKey, items, activeIdx) {
  items.forEach((item, idx) => {
    if (idx === activeIdx) {
      item.classList.add("bg-sky-100", "text-sky-900");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("bg-sky-100", "text-sky-900");
    }
  });
}

// Update opsi dropdown SUTT agar mengikuti ULTG (cascading filter)
function updateSuttOptions(tabKey = "analitik", preserveValue = true) {
  const ultgSelect = document.getElementById(`filterUltg_${tabKey}`);
  const hiddenInput = document.getElementById(`filterSutt_${tabKey}`);
  const searchInput = document.getElementById(`suttSearchInput_${tabKey}`);
  const clearBtn = document.getElementById(`suttClearBtn_${tabKey}`);
  if (!hiddenInput) return;

  const selectedUltg = ultgSelect ? ultgSelect.value : "";
  const currentSutt = hiddenInput.value;
  const availableJalurs = getJalursForUltg(selectedUltg);

  let placeholder = selectedUltg 
    ? `SUTT: Jalur (${selectedUltg.replace('ULTG ', '')}) (${availableJalurs.length})` 
    : `SUTT: Semua Jalur (${availableJalurs.length})`;

  if (searchInput) {
    searchInput.placeholder = placeholder;
  }

  // Jika sebelumnya sudah pilih jalur dan jalur tersebut masih ada di ULTG baru, pertahankan
  if (preserveValue && currentSutt && availableJalurs.includes(currentSutt)) {
    hiddenInput.value = currentSutt;
    if (searchInput) searchInput.value = currentSutt;
    if (clearBtn) clearBtn.classList.remove("hidden");
  } else {
    hiddenInput.value = "";
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
  }

  // Render ulang dropdown list
  renderSuttDropdown(tabKey, "");
}

// Event handler saat user memilih ULTG
function onUltgChange(tabKey = "analitik") {
  updateSuttOptions(tabKey, false);
  applyFilters(tabKey);
}

// Event handler saat user memilih SUTT
function onSuttChange(tabKey = "analitik") {
  const ultgSelect = document.getElementById(`filterUltg_${tabKey}`);
  const hiddenInput = document.getElementById(`filterSutt_${tabKey}`);
  const selectedSutt = hiddenInput ? hiddenInput.value : "";

  // Jika user memilih SUTT tertentu saat ULTG masih kosong, sinkronkan ULTG otomatis
  if (selectedSutt && ultgSelect && !ultgSelect.value) {
    const parentUltg = getUltgByJalur(selectedSutt);
    if (parentUltg) {
      ultgSelect.value = parentUltg;
      updateSuttOptions(tabKey, true);
    }
  }
  applyFilters(tabKey);
}

// Event handler untuk tombol pill kategori Kolom AL
function setCategoryFilter(kat) {
  const filterKat = document.getElementById("filterKategori_satwa");
  if (filterKat) filterKat.value = kat;
  applyFilters("satwa");
}

// Update styling visual tombol pill filter aktif
function updateFilterButtonStyles(selectedKat) {
  const buttonMap = [
    { id: "btnFilterAll", value: "" },
    { id: "btnFilterBurung", value: "BURUNG" },
    { id: "btnFilterKera", value: "KERA" },
    { id: "btnFilterKeraBurung", value: "KERA, BURUNG" },
    { id: "btnFilterUlar", value: "ULAR" },
    { id: "btnFilterBlanks", value: "(Blanks) / Tidak Ada" }
  ];

  buttonMap.forEach(b => {
    const btnEl = document.getElementById(b.id);
    if (!btnEl) return;
    if (b.value === selectedKat) {
      btnEl.className = "px-3 py-1 rounded-full text-xs font-semibold bg-sky-600 text-white shadow-sm transition";
    } else {
      btnEl.className = "px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition";
    }
  });
}

// Filter aktif berdasarkan klik card perangkat EZ
let activeDeviceEZFilter = "";

// Filter tabel berdasarkan perangkat EZ yang diklik dari card rekap
function filterByDeviceEZ(deviceKey, deviceName) {
  // Toggle: klik lagi untuk reset
  if (activeDeviceEZFilter === deviceKey) {
    activeDeviceEZFilter = "";
  } else {
    activeDeviceEZFilter = deviceKey;
  }

  // Update visual aktif card
  document.querySelectorAll("[data-device-card]").forEach(function(el) {
    const isActive = el.getAttribute("data-device-card") === deviceKey && activeDeviceEZFilter !== "";
    if (isActive) {
      el.classList.add("ring-2", "ring-emerald-400", "bg-emerald-50", "border-emerald-300");
      el.classList.remove("bg-slate-50", "border-slate-200");
    } else {
      el.classList.remove("ring-2", "ring-emerald-400", "bg-emerald-50", "border-emerald-300");
      el.classList.add("bg-slate-50", "border-slate-200");
    }
  });

  applyFilters("manajemen");
}

/**
 * FUNGSI UTAMA: MENYARING DATA MENARA BERDASARKAN TAB AKTIF
 * @param {string} targetTab - 'analitik' | 'manajemen' | 'satwa' | 'tindak-lanjut'
 */
function applyFilters(targetTab) {
  const activeTab = targetTab || (typeof currentActiveTab !== "undefined" ? currentActiveTab : "analitik");

  if (activeTab === "tindak-lanjut") {
    if (typeof updateTindakLanjutView === "function") {
      updateTindakLanjutView();
    }
    return;
  }

  // 1. Ekstrak kriteria filter sesuai tab aktif
  let query = "";
  let ultg = "";
  let sutt = "";
  let proteksi = "";
  let perangkat = "";
  let kategori = "";
  let aktivitas = "";

  if (activeTab === "analitik") {
    const elSearch = document.getElementById("searchInput_analitik");
    const elUltg = document.getElementById("filterUltg_analitik");
    const elSutt = document.getElementById("filterSutt_analitik");

    query = (elSearch ? elSearch.value : "").toLowerCase().trim();
    ultg = elUltg ? elUltg.value : "";
    sutt = elSutt ? elSutt.value : "";
  } else if (activeTab === "manajemen") {
    const elSearch = document.getElementById("searchInput_manajemen");
    const elUltg = document.getElementById("filterUltg_manajemen");
    const elSutt = document.getElementById("filterSutt_manajemen");
    const elProt = document.getElementById("filterProteksi_manajemen");
    const elDev = document.getElementById("filterPerangkat_manajemen");

    query = (elSearch ? elSearch.value : "").toLowerCase().trim();
    ultg = elUltg ? elUltg.value : "";
    sutt = elSutt ? elSutt.value : "";
    proteksi = elProt ? elProt.value : "";
    perangkat = elDev ? elDev.value : "";
  } else if (activeTab === "satwa") {
    const elSearch = document.getElementById("searchInput_satwa");
    const elUltg = document.getElementById("filterUltg_satwa");
    const elSutt = document.getElementById("filterSutt_satwa");
    const elKat = document.getElementById("filterKategori_satwa");
    const elAkt = document.getElementById("filterAktivitas_satwa");

    query = (elSearch ? elSearch.value : "").toLowerCase().trim();
    ultg = elUltg ? elUltg.value : "";
    sutt = elSutt ? elSutt.value : "";
    kategori = elKat ? elKat.value : "";
    aktivitas = elAkt ? elAkt.value : "";
  }

  // 2. Filter dataset menara (towerData)
  filteredData = towerData.filter(item => {
    // A. Query Text Match
    const isGaSesuaiQuery = query === "ga sesuai" || query === "tidak sesuai";
    const matchesQuery = !query || 
      (isGaSesuaiQuery && item.aktivitas === "Tidak Sesuai") ||
      (query === "sesuai" && item.aktivitas === "Sesuai") ||
      (item.nama && item.nama.toLowerCase().includes(query)) || 
      (item.jalur && item.jalur.toLowerCase().includes(query)) || 
      (item.kategori && item.kategori.toLowerCase().includes(query)) || 
      (item.perangkat && item.perangkat.toLowerCase().includes(query)) ||
      (item.aktivitas && item.aktivitas.toLowerCase().includes(query)) ||
      (item.rekomendasi && item.rekomendasi.toLowerCase().includes(query));

    // B. ULTG & SUTT Cascading
    const matchesUltg = !ultg || item.ultg === ultg;
    const matchesSutt = !sutt || item.jalur === sutt;

    // C. Tab Manajemen: Filter Proteksi & Perangkat Kolom E-Z
    const matchesProteksi = !proteksi || item.proteksi === proteksi;
    const matchesPerangkat = !perangkat || (item.perangkat && item.perangkat.toUpperCase().includes(perangkat.toUpperCase()));

    // C2. Filter dari klik card rekap EZ
    const matchesDeviceEZ = !activeDeviceEZFilter || Boolean(item[activeDeviceEZFilter]);

    // D. Tab Satwa: Filter Kategori Kolom AL & Evaluasi Kolom AM
    const matchesKategori = !kategori || item.kategori === kategori;
    const matchesAktivitas = !aktivitas || item.aktivitas === aktivitas;

    return matchesQuery && matchesUltg && matchesSutt && matchesProteksi && matchesPerangkat && matchesDeviceEZ && matchesKategori && matchesAktivitas;
  });

  // 3. Update view dan metrik sesuai tab
  if (activeTab === "analitik" && typeof updateAnalitikView === "function") {
    updateAnalitikView(filteredData);
  } else if (activeTab === "satwa") {
    updateMetrics(filteredData);
    updateFilterButtonStyles(kategori);
    currentPage = 1;
    if (typeof renderTable === "function") renderTable();
  } else if (activeTab === "manajemen") {
    updateMetrics(filteredData);
    currentPage = 1;
    if (typeof renderTable === "function") renderTable();
  }

  // 4. Update counter pada tab header
  const elHeaderTower = document.getElementById("headerCountTower");
  if (elHeaderTower) elHeaderTower.innerText = towerData.length.toLocaleString("id-ID");
  const elHeaderTindak = document.getElementById("headerCountTindakLanjut");
  if (elHeaderTindak) {
    const apTotal = towerData.filter(t => t.kolomAP && t.kolomAP.trim() !== "").length;
    elHeaderTindak.innerText = apTotal;
  }
}

/**
 * Reset filter spesifik per tab
 */
function resetFilters(tabKey = "analitik") {
  if (tabKey === "analitik") {
    const elSearch = document.getElementById("searchInput_analitik");
    const elUltg = document.getElementById("filterUltg_analitik");
    const elSutt = document.getElementById("filterSutt_analitik");
    const elSuttSearch = document.getElementById("suttSearchInput_analitik");
    const elClear = document.getElementById("suttClearBtn_analitik");

    if (elSearch) elSearch.value = "";
    if (elUltg) elUltg.value = "";
    if (elSutt) elSutt.value = "";
    if (elSuttSearch) elSuttSearch.value = "";
    if (elClear) elClear.classList.add("hidden");

    updateSuttOptions("analitik", false);
    applyFilters("analitik");
  } else if (tabKey === "manajemen") {
    const elSearch = document.getElementById("searchInput_manajemen");
    const elUltg = document.getElementById("filterUltg_manajemen");
    const elSutt = document.getElementById("filterSutt_manajemen");
    const elSuttSearch = document.getElementById("suttSearchInput_manajemen");
    const elClear = document.getElementById("suttClearBtn_manajemen");
    const elProt = document.getElementById("filterProteksi_manajemen");
    const elDev = document.getElementById("filterPerangkat_manajemen");

    if (elSearch) elSearch.value = "";
    if (elUltg) elUltg.value = "";
    if (elSutt) elSutt.value = "";
    if (elSuttSearch) elSuttSearch.value = "";
    if (elClear) elClear.classList.add("hidden");
    if (elProt) elProt.value = "";
    if (elDev) elDev.value = "";

    updateSuttOptions("manajemen", false);
    applyFilters("manajemen");
  } else if (tabKey === "satwa") {
    const elSearch = document.getElementById("searchInput_satwa");
    const elUltg = document.getElementById("filterUltg_satwa");
    const elSutt = document.getElementById("filterSutt_satwa");
    const elSuttSearch = document.getElementById("suttSearchInput_satwa");
    const elClear = document.getElementById("suttClearBtn_satwa");
    const elKat = document.getElementById("filterKategori_satwa");
    const elAkt = document.getElementById("filterAktivitas_satwa");

    if (elSearch) elSearch.value = "";
    if (elUltg) elUltg.value = "";
    if (elSutt) elSutt.value = "";
    if (elSuttSearch) elSuttSearch.value = "";
    if (elClear) elClear.classList.add("hidden");
    if (elKat) elKat.value = "";
    if (elAkt) elAkt.value = "";

    updateSuttOptions("satwa", false);
    applyFilters("satwa");
  } else if (tabKey === "tindak-lanjut") {
    if (typeof resetTindakLanjutFilters === "function") {
      resetTindakLanjutFilters();
    }
  }
}

// Reset semua filter di semua tab (Backward Compatibility)
function resetAllFilters() {
  resetFilters("analitik");
  resetFilters("manajemen");
  resetFilters("satwa");
  if (typeof resetTindakLanjutFilters === "function") {
    resetTindakLanjutFilters();
  }
}

// Tutup dropdown SUTT saat pengguna mengklik di luar area combobox
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("click", function(event) {
    ["analitik", "manajemen", "satwa"].forEach(tab => {
      const container = document.getElementById(`suttComboboxContainer_${tab}`);
      if (container && !container.contains(event.target)) {
        closeSuttDropdown(tab);
      }
    });
  });
}
