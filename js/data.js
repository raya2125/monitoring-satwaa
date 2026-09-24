/**
 * PENGELOLAAN DATA MENARA TRANSMISI (TRS_PLM) - REAL-TIME GOOGLE SPREADSHEET
 * UPT PALEMBANG
 */

// State data global
let towerData = [];
let filteredData = [];
let isSyncing = false;

// Inisialisasi awal dataset dari dataset realSpreadsheetTowers atau cache lokal v2
function initDataset() {
  let loaded = false;
  try {
    // Bersihkan cache lama jika ada
    localStorage.removeItem("trs_plm_tower_data");

    const cached = localStorage.getItem("trs_plm_tower_data_v2");
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Array.isArray(parsedCache) && parsedCache.length > 0) {
        towerData = parsedCache;
        console.log(`[Data] Berhasil memuat ${towerData.length} data menara dari cache lokal.`);
        loaded = true;
      }
    }
  } catch (err) {
    console.warn("[Data] Gagal membaca cache:", err);
  }

  if (!loaded) {
    // Gunakan data riil dari Google Spreadsheet yang sudah di-bundle
    if (typeof realSpreadsheetTowers !== "undefined" && Array.isArray(realSpreadsheetTowers) && realSpreadsheetTowers.length > 0) {
      towerData = [...realSpreadsheetTowers];
      console.log(`[Data] Memuat ${towerData.length} data menara dari realSpreadsheetTowers.`);
    } else {
      towerData = [];
    }
  }

  // Normalisasi aktivitas menjadi Sesuai atau Tidak Sesuai
  towerData.forEach(t => {
    if (t.aktivitas === "Sesuai" || t.aktivitas === "Tidak Sesuai") return;
    if (t.aktivitas && (t.aktivitas.toLowerCase().includes("tidak") || t.aktivitas.toLowerCase().includes("ga") || t.aktivitas === "Sering Terlihat Satwa" || t.aktivitas === "Riwayat Gangguan/Trip")) {
      t.aktivitas = (t.kategori && t.kategori !== "(Blanks) / Tidak Ada" && t.proteksi === "BELUM TERPASANG") ? "Tidak Sesuai" : "Sesuai";
    } else if (t.kategori && t.kategori !== "(Blanks) / Tidak Ada" && t.proteksi === "BELUM TERPASANG") {
      t.aktivitas = "Tidak Sesuai";
    } else {
      t.aktivitas = "Sesuai";
    }
    t.rencanaTindakLanjut = t.rekomendasi || "-";
  });

  filteredData = [...towerData];
}

/**
 * Parser CSV standar RFC 4180 untuk menangani koma dalam kutip, baris baru, dan tanda kutip ganda
 */
function parseCSV(text) {
  const result = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      row.push("");
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") {
        i++;
      }
      result.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") result.push(row);
  return result;
}

/**
 * Konversi baris CSV Google Spreadsheet (Sheet TRS_PLM) ke struktur objek data aplikasi
 */
function parseSpreadsheetCSVToTowers(csvText) {
  const rows = parseCSV(csvText);
  if (!rows || rows.length < 4) {
    throw new Error("Format CSV Google Spreadsheet tidak valid atau kosong.");
  }

  const towers = [];
  let no = 1;

  // Baris 0, 1, 2 adalah baris Header rekap & judul kolom di spreadsheet
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 10) continue;

    const nama = (r[3] || "").trim();
    if (!nama) continue;

    const ultg = (r[1] || "").trim();
    const jalur = (r[2] || "").trim();

    // Kolom 37 (Binatang 1) & 38 (Binatang 2) atau Kolom 39 (Kerawanan)
    const b1 = (r[37] || "").trim();
    const b2 = (r[38] || "").trim();
    let kategori = "(Blanks) / Tidak Ada";
    if (b1 && b2) {
      kategori = `${b1}, ${b2}`;
    } else if (b1) {
      kategori = b1;
    } else if (b2) {
      kategori = b2;
    } else if (r[39] && r[39].trim() && !r[39].includes("NON RAWAN")) {
      kategori = r[39].trim();
    }

    // Proteksi & Perangkat (Kolom 35: ANTI BINATANG TERPASANG)
    const antiBinatang = (r[35] || "").trim();
    let proteksi = "BELUM TERPASANG";
    let perangkat = "-";
    if (
      antiBinatang &&
      antiBinatang !== "TIDAK TERPASANG" &&
      antiBinatang !== "0" &&
      antiBinatang !== "FALSE" &&
      antiBinatang !== "-"
    ) {
      proteksi = "TERPASANG";
      perangkat = antiBinatang;
    }

    // Rencana Tindak Lanjut (Kolom 42: Kolom AQ)
    const rekomendasi = (r[42] || "-").trim() || "-";

    // Tapak (Kolom 43: PEMBERSIHAN TAPAK TOWER)
    const tapakRaw = (r[43] || "").trim();
    const tapak =
      tapakRaw === "TRUE" ||
      tapakRaw === "1" ||
      tapakRaw.toLowerCase().includes("perlu")
        ? "Perlu Pembersihan Tapak"
        : "Tidak Diperlukan";

    // Catatan (Kolom 54: KET KERAWANAN BINATANG NS atau Kolom 40)
    const catatan = (r[54] || r[40] || "-").trim() || "-";

    // Aktivitas Satwa (Sesuai / Tidak Sesuai)
    let aktivitas = "Sesuai";
    if (kategori !== "(Blanks) / Tidak Ada" && proteksi === "BELUM TERPASANG") {
      aktivitas = "Tidak Sesuai";
    }

    towers.push({
      no: no++,
      nama,
      jalur,
      ultg,
      kategori,
      proteksi,
      perangkat,
      aktivitas,
      catatan,
      tapak,
      rekomendasi
    });
  }

  return towers;
}

/**
 * Mengambil data live dari Google Spreadsheet CSV Export langsung tanpa server perantara
 */
async function loadSpreadsheetData(forceRefresh = false) {
  if (isSyncing) return;
  isSyncing = true;

  updateSyncUIStatus("loading", "Menghubungkan ke Google Spreadsheet...");

  try {
    const fetchUrl = forceRefresh
      ? `${SPREADSHEET_CSV_URL}&_nocache=${Date.now()}`
      : SPREADSHEET_CSV_URL;

    const response = await fetch(fetchUrl, {
      method: "GET",
      cache: forceRefresh ? "reload" : "default"
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsedTowers = parseSpreadsheetCSVToTowers(csvText);

    if (parsedTowers.length > 0) {
      towerData = parsedTowers;
      filteredData = [...towerData];

      // Simpan ke cache lokal
      try {
        localStorage.setItem("trs_plm_tower_data_v2", JSON.stringify(towerData));
        const now = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        localStorage.setItem("trs_plm_last_sync", now);
        updateSyncUIStatus("success", `Tersinkron ${towerData.length} Data (${now})`);
      } catch (storageErr) {
        console.warn("[Data] Kuota localStorage penuh:", storageErr);
        updateSyncUIStatus("success", `Tersinkron ${towerData.length} Data Live`);
      }

      // Perbarui dropdown jalur & filter tampilan
      if (typeof updateSuttOptions === "function") {
        updateSuttOptions(false);
      }
      if (typeof applyFilters === "function") {
        applyFilters();
      }
    } else {
      throw new Error("Tidak ada data menara yang ditemukan pada spreadsheet.");
    }
  } catch (error) {
    console.error("[Data] Gagal sinkronisasi dengan Google Spreadsheet:", error);
    const lastSync = localStorage.getItem("trs_plm_last_sync");
    const fallbackText = lastSync
      ? `Offline (Cache: ${lastSync})`
      : `Gagal Sinkron (${towerData.length} Menara)`;
    updateSyncUIStatus("error", fallbackText);
  } finally {
    isSyncing = false;
  }
}

/**
 * Helper untuk memperbarui status indikator sinkronisasi di UI
 */
function updateSyncUIStatus(state, message) {
  const badge = document.getElementById("syncBadge");
  const syncBtnText = document.getElementById("syncButtonText");
  const syncBtnIcon = document.getElementById("syncButtonIcon");

  if (badge) {
    badge.classList.remove("hidden");
    badge.classList.add("flex");

    if (state === "loading") {
      badge.className =
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 text-amber-400 text-xs border border-amber-800 transition";
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
        <span>${message}</span>
      `;
    } else if (state === "success") {
      badge.className =
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 text-xs border border-emerald-800 transition";
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>${message}</span>
      `;
    } else if (state === "error") {
      badge.className =
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 text-rose-400 text-xs border border-rose-800 transition";
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-rose-400"></span>
        <span>${message}</span>
      `;
    }
  }

  if (syncBtnIcon) {
    if (state === "loading") {
      syncBtnIcon.classList.add("animate-spin");
    } else {
      syncBtnIcon.classList.remove("animate-spin");
    }
  }
  if (syncBtnText && state === "loading") {
    syncBtnText.textContent = "Menyinkron...";
  } else if (syncBtnText) {
    syncBtnText.textContent = "Sinkronkan";
  }
}
