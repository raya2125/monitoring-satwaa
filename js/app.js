/**
 * ENTRY POINT & INISIALISASI UTAMA APLIKASI
 * Pengelolaan Navigasi 4 Tab (Ringkasan, Manajemen, Satwa, Tindak Lanjut)
 * dengan Filter Bar Dinamis Spesifik per Tab
 */

let currentActiveTab = "analitik";

// Fungsi beralih antar 4 tab navigasi
function switchTab(tabId) {
  currentActiveTab = tabId;

  const tabButtons = [
    { id: "analitik", btnId: "navTabAnalitik" },
    { id: "manajemen", btnId: "navTabManajemen" },
    { id: "satwa", btnId: "navTabSatwa" },
    { id: "tindak-lanjut", btnId: "navTabTindakLanjut" },
    { id: "approval", btnId: "navTabApproval" }
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

  // 2. Tampilkan filter bar spesifik sesuai tab yang sedang aktif
  const fbAnalitik = document.getElementById("filterBarAnalitik");
  const fbManajemen = document.getElementById("filterBarManajemen");
  const fbSatwa = document.getElementById("filterBarSatwa");
  const fbTindakLanjut = document.getElementById("filterBarTindakLanjut");

  if (fbAnalitik) fbAnalitik.classList.toggle("hidden", tabId !== "analitik");
  if (fbManajemen) fbManajemen.classList.toggle("hidden", tabId !== "manajemen");
  if (fbSatwa) fbSatwa.classList.toggle("hidden", tabId !== "satwa");
  if (fbTindakLanjut) fbTindakLanjut.classList.toggle("hidden", tabId !== "tindak-lanjut");

  // 3. Tampilkan dan sembunyikan kontainer tampilan utama sesuai tab
  const elAnalitik = document.getElementById("viewAnalitik");
  const elKpi = document.getElementById("kpiSection");
  const elClass = document.getElementById("classificationSection");
  const elCatBtn = document.getElementById("categoryButtonsSection");
  const elTable = document.getElementById("tableSection");
  const elTindak = document.getElementById("viewTindakLanjut");
  const elApproval = document.getElementById("viewApproval");

  if (elAnalitik) elAnalitik.classList.toggle("hidden", tabId !== "analitik");
  if (elKpi) elKpi.classList.toggle("hidden", tabId !== "manajemen");
  if (elClass) elClass.classList.toggle("hidden", tabId !== "satwa");
  if (elCatBtn) elCatBtn.classList.toggle("hidden", tabId !== "satwa");
  if (elTable) elTable.classList.toggle("hidden", tabId !== "manajemen" && tabId !== "satwa");
  if (elTindak) elTindak.classList.toggle("hidden", tabId !== "tindak-lanjut");
  if (elApproval) elApproval.classList.toggle("hidden", tabId !== "approval");

  if (tabId === "approval") {
    if (typeof renderApprovalPageView === "function") {
      renderApprovalPageView();
    }
    // Otomatis tarik usulan cloud dari Tab DRAFT_ANTREAN Spreadsheet
    if (typeof stagingManager !== "undefined" && typeof stagingManager.fetchDraftsFromCloud === "function") {
      stagingManager.fetchDraftsFromCloud(true);
    }
  }

  // 4. Update data dan filter pada tampilan yang aktif
  if (typeof applyFilters === "function") {
    applyFilters(tabId);
  }

  // 5. Render ulang icon Lucide
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

  // 3. Setup opsi awal dropdown SUTT (mengikuti filter ULTG masing-masing tab)
  if (typeof updateSuttOptions === "function") {
    updateSuttOptions("analitik", false);
    updateSuttOptions("manajemen", false);
    updateSuttOptions("satwa", false);
  }

  // 4. Set tab awal aktif ke Ringkasan & Analitik
  switchTab("analitik");

  // 5. Sinkronisasi data live dari Google Spreadsheet secara otomatis di background
  if (typeof loadSpreadsheetData === "function") {
    loadSpreadsheetData(false).then(() => {
      // Perbarui tampilan tab yang sedang aktif dengan data live
      if (typeof applyFilters === "function") {
        applyFilters(currentActiveTab);
      }

      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }

      // Ambil antrean usulan yang masih PENDING dari Tab DRAFT_ANTREAN di Spreadsheet
      if (typeof stagingManager !== "undefined" && typeof stagingManager.fetchDraftsFromCloud === "function") {
        stagingManager.fetchDraftsFromCloud(true);
      }
    });
  }
});
