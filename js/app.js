/**
 * ENTRY POINT & INISIALISASI UTAMA APLIKASI
 * Pengelolaan Navigasi 4 Tab (Ringkasan, Manajemen, Satwa, Tindak Lanjut)
 */

let currentActiveTab = "analitik";

// Fungsi beralih antar 4 tab navigasi
function switchTab(tabId) {
  currentActiveTab = tabId;

  const tabButtons = [
    { id: "analitik", btnId: "navTabAnalitik" },
    { id: "manajemen", btnId: "navTabManajemen" },
    { id: "satwa", btnId: "navTabSatwa" },
    { id: "tindak-lanjut", btnId: "navTabTindakLanjut" }
  ];

  // 1. Update styling tombol navigasi
  tabButtons.forEach(t => {
    const btnEl = document.getElementById(t.btnId);
    if (!btnEl) return;
    const icon = btnEl.querySelector("i");

    if (t.id === tabId) {
      btnEl.className = "py-3 px-1 text-sky-400 font-semibold flex items-center gap-2 border-b-2 border-sky-400 transition";
      if (icon) icon.className = "w-4 h-4 text-sky-400";
    } else {
      btnEl.className = "py-3 px-1 text-slate-400 hover:text-slate-200 flex items-center gap-2 font-medium border-b-2 border-transparent transition";
      if (icon) icon.className = "w-4 h-4 text-slate-400";
    }
  });

  // 2. Tampilkan dan sembunyikan kontainer tampilan sesuai tab
  const elAnalitik = document.getElementById("viewAnalitik");
  const elKpi = document.getElementById("kpiSection");
  const elClass = document.getElementById("classificationSection");
  const elCatBtn = document.getElementById("categoryButtonsSection");
  const elTable = document.getElementById("tableSection");
  const elTindak = document.getElementById("viewTindakLanjut");

  if (elAnalitik) elAnalitik.classList.toggle("hidden", tabId !== "analitik");
  if (elKpi) elKpi.classList.toggle("hidden", tabId !== "manajemen");
  if (elClass) elClass.classList.toggle("hidden", tabId !== "satwa");
  if (elCatBtn) elCatBtn.classList.toggle("hidden", tabId !== "satwa");
  if (elTable) elTable.classList.toggle("hidden", tabId !== "manajemen" && tabId !== "satwa");
  if (elTindak) elTindak.classList.toggle("hidden", tabId !== "tindak-lanjut");

  // 3. Update data pada tampilan yang aktif
  if (tabId === "analitik" && typeof updateAnalitikView === "function") {
    updateAnalitikView(filteredData);
  } else if (tabId === "tindak-lanjut" && typeof updateTindakLanjutView === "function") {
    updateTindakLanjutView(filteredData);
  } else if (tabId === "manajemen" || tabId === "satwa") {
    updateMetrics(filteredData);
    renderTable();
  }

  // 4. Render ulang icon Lucide
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Render seluruh komponen UI
  if (typeof renderHeaderComponent === "function") renderHeaderComponent();
  if (typeof renderFilterComponent === "function") renderFilterComponent();
  if (typeof renderAnalitikComponent === "function") renderAnalitikComponent(); // Tab 1
  if (typeof renderKpiComponent === "function") renderKpiComponent(); // Tab 2 & 4
  if (typeof renderClassificationComponent === "function") renderClassificationComponent(); // Tab 3
  if (typeof renderCategoryButtonsComponent === "function") renderCategoryButtonsComponent(); // Tab 3
  if (typeof renderTableStructureComponent === "function") renderTableStructureComponent(); // Tab 2 & 3
  if (typeof renderTindakLanjutComponent === "function") renderTindakLanjutComponent(); // Tab 4
  if (typeof renderModalComponent === "function") renderModalComponent();

  // 2. Inisialisasi dataset lengkap
  if (typeof initDataset === "function") initDataset();

  // 3. Setup opsi awal dropdown SUTT (mengikuti filter ULTG)
  if (typeof updateSuttOptions === "function") updateSuttOptions(false);

  // 4. Hitung metrik awal dan render isi tabel
  if (typeof applyFilters === "function") applyFilters();

  // 5. Set tab awal aktif ke Ringkasan & Analitik (sesuai Screenshot 1)
  switchTab("analitik");

  // 6. Sinkronisasi data live dari Google Spreadsheet secara otomatis di background
  if (typeof loadSpreadsheetData === "function") {
    loadSpreadsheetData(false).then(() => {
      // Perbarui tampilan tab yang sedang aktif dengan data live
      if (currentActiveTab === "analitik" && typeof updateAnalitikView === "function") {
        updateAnalitikView(filteredData);
      } else if (currentActiveTab === "tindak-lanjut" && typeof updateTindakLanjutView === "function") {
        updateTindakLanjutView(filteredData);
      } else {
        if (typeof updateMetrics === "function") updateMetrics(filteredData);
        if (typeof renderTable === "function") renderTable();
      }

      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    });
  }
});
