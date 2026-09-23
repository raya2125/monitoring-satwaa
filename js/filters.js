/**
 * LOGIKA FILTER DINAMIS & CASCADING ULTG-SUTT
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

// State combobox SUTT
let suttActiveIndex = -1;

// Helper untuk highlight teks yang cocok
function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, `<span class="bg-amber-100 text-amber-900 font-bold px-0.5 rounded">$1</span>`);
}

// Render opsi-opsi pada dropdown SUTT
function renderSuttDropdown(query = "") {
  const optionsList = document.getElementById("suttOptionsList");
  if (!optionsList) return;

  const ultgSelect = document.getElementById("filterUltg");
  const selectedUltg = ultgSelect ? ultgSelect.value : "";
  const currentVal = (document.getElementById("filterSutt") && document.getElementById("filterSutt").value) || "";
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
    <div onclick="selectSuttOption('')" 
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
        <button type="button" onclick="clearSuttSearch(event)" class="mt-1.5 px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-medium transition">
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
        <div onclick="selectSuttOption('${jalur.replace(/'/g, "\\'")}')" 
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
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Buka dropdown SUTT
function openSuttDropdown() {
  const menu = document.getElementById("suttDropdownMenu");
  const chevron = document.getElementById("suttChevron");
  const searchInput = document.getElementById("suttSearchInput");
  if (!menu) return;

  menu.classList.remove("hidden");
  if (chevron) chevron.classList.add("rotate-180");
  
  const query = searchInput ? searchInput.value : "";
  const currentVal = (document.getElementById("filterSutt") && document.getElementById("filterSutt").value) || "";
  renderSuttDropdown(query === currentVal ? "" : query);
  suttActiveIndex = -1;
}

// Tutup dropdown SUTT
function closeSuttDropdown() {
  const menu = document.getElementById("suttDropdownMenu");
  const chevron = document.getElementById("suttChevron");
  const searchInput = document.getElementById("suttSearchInput");
  const hiddenInput = document.getElementById("filterSutt");

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
function toggleSuttDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById("suttDropdownMenu");
  const searchInput = document.getElementById("suttSearchInput");

  if (menu && !menu.classList.contains("hidden")) {
    closeSuttDropdown();
  } else {
    if (searchInput) searchInput.focus();
    openSuttDropdown();
  }
}

// Pilih opsi SUTT dari dropdown
function selectSuttOption(jalur) {
  const hiddenInput = document.getElementById("filterSutt");
  const searchInput = document.getElementById("suttSearchInput");
  const clearBtn = document.getElementById("suttClearBtn");

  if (hiddenInput) hiddenInput.value = jalur;
  if (searchInput) searchInput.value = jalur;

  if (clearBtn) {
    if (jalur) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }

  closeSuttDropdown();
  onSuttChange();
}

// Hapus pilihan / reset SUTT
function clearSuttSearch(e) {
  if (e) e.stopPropagation();
  const hiddenInput = document.getElementById("filterSutt");
  const searchInput = document.getElementById("suttSearchInput");
  const clearBtn = document.getElementById("suttClearBtn");

  if (hiddenInput) hiddenInput.value = "";
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  if (clearBtn) clearBtn.classList.add("hidden");

  renderSuttDropdown("");
  onSuttChange();
}

// Handle ketikan user di input SUTT (Ketik langsung untuk mencari jalur)
function handleSuttInput(query) {
  const menu = document.getElementById("suttDropdownMenu");
  const clearBtn = document.getElementById("suttClearBtn");
  const hiddenInput = document.getElementById("filterSutt");

  if (menu && menu.classList.contains("hidden")) {
    openSuttDropdown();
  }

  if (clearBtn) {
    if (query.trim()) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }

  renderSuttDropdown(query);

  // Jika input dikosongkan total, langsung reset filter
  if (!query.trim() && hiddenInput && hiddenInput.value) {
    hiddenInput.value = "";
    applyFilters();
  }
}

// Keyboard navigation untuk SUTT combobox (ArrowUp, ArrowDown, Enter, Esc)
function handleSuttKeydown(e) {
  const menu = document.getElementById("suttDropdownMenu");
  const items = document.querySelectorAll("#suttOptionsList .sutt-option-item, #suttOptionsList [data-value='']");
  
  if (e.key === "Escape") {
    closeSuttDropdown();
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!menu || menu.classList.contains("hidden")) {
      openSuttDropdown();
      return;
    }
    if (items.length > 0) {
      suttActiveIndex = (suttActiveIndex + 1) % items.length;
      highlightActiveSuttItem(items);
    }
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!menu || menu.classList.contains("hidden")) {
      openSuttDropdown();
      return;
    }
    if (items.length > 0) {
      suttActiveIndex = (suttActiveIndex - 1 + items.length) % items.length;
      highlightActiveSuttItem(items);
    }
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    if (items.length > 0 && suttActiveIndex >= 0 && suttActiveIndex < items.length) {
      const selectedVal = items[suttActiveIndex].getAttribute("data-value");
      selectSuttOption(selectedVal);
    } else {
      // Jika user tekan enter tanpa panah, pilih opsi pertama yang cocok
      const firstItem = document.querySelector("#suttOptionsList .sutt-option-item");
      if (firstItem) {
        selectSuttOption(firstItem.getAttribute("data-value"));
      } else {
        closeSuttDropdown();
      }
    }
  }
}

function highlightActiveSuttItem(items) {
  items.forEach((item, idx) => {
    if (idx === suttActiveIndex) {
      item.classList.add("bg-sky-100", "text-sky-900");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("bg-sky-100", "text-sky-900");
    }
  });
}

// Update opsi dropdown SUTT agar mengikuti ULTG (cascading filter)
function updateSuttOptions(preserveValue = true) {
  const ultgSelect = document.getElementById("filterUltg");
  const hiddenInput = document.getElementById("filterSutt");
  const searchInput = document.getElementById("suttSearchInput");
  const clearBtn = document.getElementById("suttClearBtn");
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
  renderSuttDropdown("");
}

// Event handler saat user memilih ULTG
function onUltgChange() {
  updateSuttOptions(false);
  applyFilters();
}

// Event handler saat user memilih SUTT
function onSuttChange() {
  const ultgSelect = document.getElementById("filterUltg");
  const hiddenInput = document.getElementById("filterSutt");
  const selectedSutt = hiddenInput ? hiddenInput.value : "";

  // Jika user memilih SUTT tertentu saat ULTG masih kosong, sinkronkan ULTG otomatis
  if (selectedSutt && ultgSelect && !ultgSelect.value) {
    const parentUltg = getUltgByJalur(selectedSutt);
    if (parentUltg) {
      ultgSelect.value = parentUltg;
      updateSuttOptions(true);
    }
  }
  applyFilters();
}

// Event handler untuk tombol pill kategori Kolom AP
function setCategoryFilter(kat) {
  const filterKat = document.getElementById("filterKategori");
  if (filterKat) filterKat.value = kat;
  applyFilters();
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

// Fungsi utama: menyaring data menara berdasarkan semua input filter
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const filterUltg = document.getElementById("filterUltg");
  const filterSutt = document.getElementById("filterSutt");
  const filterKategori = document.getElementById("filterKategori");
  const filterProteksi = document.getElementById("filterProteksi");

  const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
  const ultg = filterUltg ? filterUltg.value : "";
  const sutt = filterSutt ? filterSutt.value : "";
  const kategori = filterKategori ? filterKategori.value : "";
  const proteksi = filterProteksi ? filterProteksi.value : "";

  filteredData = towerData.filter(item => {
    const matchesQuery = !query || 
      (item.nama && item.nama.toLowerCase().includes(query)) || 
      (item.jalur && item.jalur.toLowerCase().includes(query)) || 
      (item.kategori && item.kategori.toLowerCase().includes(query)) || 
      (item.perangkat && item.perangkat.toLowerCase().includes(query)) ||
      (item.rekomendasi && item.rekomendasi.toLowerCase().includes(query));

    const matchesUltg = !ultg || item.ultg === ultg;
    const matchesSutt = !sutt || item.jalur === sutt;
    const matchesKategori = !kategori || item.kategori === kategori;
    const matchesProteksi = !proteksi || item.proteksi === proteksi;

    return matchesQuery && matchesUltg && matchesSutt && matchesKategori && matchesProteksi;
  });

  // Update styling tombol pill
  updateFilterButtonStyles(kategori);

  // Hitung ulang metrik dan render tabel
  updateMetrics(filteredData);
  if (typeof updateAnalitikView === "function") updateAnalitikView(filteredData);
  if (typeof updateTindakLanjutView === "function") updateTindakLanjutView(filteredData);

  // Update counter pada tab header
  const elHeaderTower = document.getElementById("headerCountTower");
  if (elHeaderTower) elHeaderTower.innerText = towerData.length.toLocaleString("id-ID");
  const elHeaderTindak = document.getElementById("headerCountTindakLanjut");
  if (elHeaderTindak) {
    const tapakTotal = towerData.filter(t => t.tapak && t.tapak.includes("Perlu")).length;
    elHeaderTindak.innerText = tapakTotal;
  }

  currentPage = 1;
  renderTable();
}

// Reset semua filter kembali ke awal
function resetAllFilters() {
  if (document.getElementById("searchInput")) document.getElementById("searchInput").value = "";
  if (document.getElementById("filterUltg")) document.getElementById("filterUltg").value = "";
  if (document.getElementById("filterKategori")) document.getElementById("filterKategori").value = "";
  if (document.getElementById("filterProteksi")) document.getElementById("filterProteksi").value = "";
  
  const hiddenInput = document.getElementById("filterSutt");
  const searchInput = document.getElementById("suttSearchInput");
  const clearBtn = document.getElementById("suttClearBtn");
  if (hiddenInput) hiddenInput.value = "";
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");

  updateSuttOptions(false);
  applyFilters();
}

// Tutup dropdown SUTT saat pengguna mengklik di luar area combobox
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("click", function(event) {
    const container = document.getElementById("suttComboboxContainer");
    if (container && !container.contains(event.target)) {
      closeSuttDropdown();
    }
  });
}
