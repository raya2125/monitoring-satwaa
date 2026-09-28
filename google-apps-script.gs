/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) - BACKEND SISTEM MONITORING SATWA TRS_PLM
 * UPT PALEMBANG
 * Fitur: Baca & Tulis Kolom E s.d. Z (Pemasangan Anti-Binatang & Tanggal),
 * Kolom AJ, Kolom AL & AM (Satwa), Kolom AQ, dan Kolom AR s.d. BA (Tindak Lanjut)
 * =========================================================================
 * 
 * PETUNJUK PEMBARUAN DI GOOGLE SPREADSHEET (WAJIB DILAKUKAN):
 * 1. Buka Google Spreadsheet TRS_PLM:
 *    https://docs.google.com/spreadsheets/d/1IMpg20-ciVpykFKyM4TB60Mt2asL9o1H2thnNYDtudo/edit
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script".
 * 3. Hapus seluruh isi script lama di editor, lalu paste seluruh isi file ini.
 * 4. Klik ikon Save (Disket) atau tekan Ctrl+S.
 * 5. PENTING (Agar Script Baru Aktif):
 *    - Klik tombol biru "Deploy" (Terapkan) di pojok kanan atas.
 *    - Pilih "Manage deployments" (Kelola penerapan).
 *    - Klik ikon Pensil (Edit).
 *    - Pada dropdown "Version" (Versi), pilih "New version" (Versi baru).
 *    - Klik tombol "Deploy" (Terapkan).
 *    - Selesai! Script baru langsung aktif dan menerima input secara realtime.
 */

// Helper: dapatkan sheet data TRS_PLM secara otomatis
function getTargetSheet(ss) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName().toUpperCase();
    if (name.includes("TRS_PLM") || name.includes("KERAWANAN") || name.includes("DATA")) {
      return sheets[i];
    }
  }
  return ss.getActiveSheet() || sheets[0];
}

// Handler GET: Verifikasi data dan Fallback Update
function doGet(e) {
  try {
    // Jika request GET membawa parameter pembaruan (fallback untuk browser yang memblokir POST)
    if (e && e.parameter && (e.parameter.action || e.parameter.payload || e.parameter.nama)) {
      let contents = {};
      if (e.parameter.payload) {
        try {
          contents = JSON.parse(e.parameter.payload);
        } catch (err) {
          contents = e.parameter;
        }
      } else {
        contents = e.parameter;
      }
      return handleUpdateRequest(contents);
    }

    // Default GET: Baca seluruh data menara
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
    const data = sheet.getDataRange().getValues();
    const towers = [];

    // Baris 0, 1, 2 adalah baris Header
    for (let i = 3; i < data.length; i++) {
      const r = data[i];
      const nama = String(r[3] || "").trim();
      if (!nama) continue;

      const ultg = String(r[1] || "").trim();
      const jalur = String(r[2] || "").trim();
      const b1 = String(r[37] || "").trim(); // Kolom AL
      const b2 = String(r[38] || "").trim(); // Kolom AM
      let kategori = "(Blanks) / Tidak Ada";
      if (b1 && b2) kategori = b1 + ", " + b2;
      else if (b1) kategori = b1;
      else if (b2) kategori = b2;

      const antiBinatang = String(r[35] || "").trim();
      let proteksi = "BELUM TERPASANG";
      let perangkat = "-";
      if (antiBinatang && antiBinatang !== "TIDAK TERPASANG" && antiBinatang !== "0" && antiBinatang !== "FALSE" && antiBinatang !== "-") {
        proteksi = "TERPASANG";
        perangkat = antiBinatang;
      }

      towers.push({
        no: i - 2,
        nama: nama,
        jalur: jalur,
        ultg: ultg,
        binatang1: b1,
        binatang2: b2,
        kategori: kategori,
        proteksi: proteksi,
        perangkat: perangkat,
        kolomAP: String(r[41] || "").trim(),
        rekomendasi: String(r[42] || "-").trim(),
        tapak: String(r[43] || "FALSE").toUpperCase().includes("TRUE") ? "Perlu Pembersihan Tapak" : "Tidak Diperlukan",
        tapakBool: String(r[43] || "FALSE").toUpperCase().includes("TRUE"),
        // Rencana Tindak Lanjut Kolom AS s.d. BA
        boluves: String(r[44] || "FALSE").toUpperCase().includes("TRUE"),
        jaring: String(r[45] || "FALSE").toUpperCase().includes("TRUE"),
        pemves: String(r[46] || "FALSE").toUpperCase().includes("TRUE"),
        pelakor: String(r[47] || "FALSE").toUpperCase().includes("TRUE"),
        topSkor: String(r[48] || "FALSE").toUpperCase().includes("TRUE"),
        ironMan: String(r[49] || "FALSE").toUpperCase().includes("TRUE"),
        kawatSilet: String(r[50] || "FALSE").toUpperCase().includes("TRUE"),
        asb: String(r[51] || "FALSE").toUpperCase().includes("TRUE"),
        togarAbes: String(r[52] || "FALSE").toUpperCase().includes("TRUE"),
        catatan: String(r[54] || r[40] || "-").trim(),
        // Kolom E s.d. Z (Pemasangan Anti-Binatang & Tanggal)
        ezTopSkorL1: String(r[4] || "FALSE").toUpperCase().includes("TRUE"),
        ezTopSkorL1Date: String(r[5] || "").trim(),
        ezTopSkorL2: String(r[6] || "FALSE").toUpperCase().includes("TRUE"),
        ezTopSkorL2Date: String(r[7] || "").trim(),
        ezIronmanL1: String(r[8] || "FALSE").toUpperCase().includes("TRUE"),
        ezIronmanL1Date: String(r[9] || "").trim(),
        ezIronmanL2: String(r[10] || "FALSE").toUpperCase().includes("TRUE"),
        ezIronmanL2Date: String(r[11] || "").trim(),
        ezBoluves: String(r[12] || "FALSE").toUpperCase().includes("TRUE"),
        ezBoluvesDate: String(r[13] || "").trim(),
        ezJaring: String(r[14] || "FALSE").toUpperCase().includes("TRUE"),
        ezJaringDate: String(r[15] || "").trim(),
        ezPelakor: String(r[16] || "FALSE").toUpperCase().includes("TRUE"),
        ezPelakorDate: String(r[17] || "").trim(),
        ezKawatSilet: String(r[18] || "FALSE").toUpperCase().includes("TRUE"),
        ezKawatSiletDate: String(r[19] || "").trim(),
        ezAsb: String(r[20] || "FALSE").toUpperCase().includes("TRUE"),
        ezAsbDate: String(r[21] || "").trim(),
        ezPemves: String(r[22] || "FALSE").toUpperCase().includes("TRUE"),
        ezPemvesDate: String(r[23] || "").trim(),
        ezTogarAbes: String(r[24] || "FALSE").toUpperCase().includes("TRUE"),
        ezTogarAbesDate: String(r[25] || "").trim()
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: towers.length,
      data: towers
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handler POST: Menyimpan pembaruan data menara dari Web Dashboard
function doPost(e) {
  try {
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (pErr) {
        contents = e.parameter || {};
      }
    } else if (e && e.parameter) {
      contents = e.parameter;
    }

    return handleUpdateRequest(contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Logika Inti Penulisan Data ke Spreadsheet
function handleUpdateRequest(contents) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);

    const targetNama = String(contents.nama || "").trim();
    if (!targetNama) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Parameter 'nama' menara diperlukan."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Cari baris berdasarkan Nama Menara di Kolom D (index 3), fleksibel huruf besar/kecil & spasi
    const cleanTarget = targetNama.replace(/\s+/g, " ").toLowerCase();
    for (let i = 3; i < data.length; i++) {
      const rowNama = String(data[i][3] || "").trim().replace(/\s+/g, " ").toLowerCase();
      if (rowNama === cleanTarget) {
        rowIndex = i + 1; // 1-based index baris sheet
        break;
      }
    }

    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Menara tidak ditemukan di Kolom D: " + targetNama
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const toBoolStr = function(val) {
      return (val === true || String(val).toUpperCase() === "TRUE" || val === 1 || val === "1") ? "TRUE" : "FALSE";
    };

    // =========================================================================
    // 1. TULIS KE KOLOM E s.d. Z (5 s.d. 26: PEMASANGAN ANTI BINATANG & TANGGAL)
    // =========================================================================
    if (contents.hasKolomEZ || contents.updateKolomEZ || contents.ezTopSkorL1 !== undefined || contents.topSkorL1 !== undefined) {
      const getEzVal = function(key1, key2, fallback) {
        if (contents[key1] !== undefined) return contents[key1];
        if (key2 && contents[key2] !== undefined) return contents[key2];
        return fallback;
      };

      const ezValues = [
        toBoolStr(getEzVal("ezTopSkorL1", "topSkorL1", false)),
        String(getEzVal("ezTopSkorL1Date", "topSkorL1Date", "")),
        toBoolStr(getEzVal("ezTopSkorL2", "topSkorL2", false)),
        String(getEzVal("ezTopSkorL2Date", "topSkorL2Date", "")),
        toBoolStr(getEzVal("ezIronmanL1", "ironmanL1", false)),
        String(getEzVal("ezIronmanL1Date", "ironmanL1Date", "")),
        toBoolStr(getEzVal("ezIronmanL2", "ironmanL2", false)),
        String(getEzVal("ezIronmanL2Date", "ironmanL2Date", "")),
        toBoolStr(getEzVal("ezBoluves", "boluvesInstalled", false)),
        String(getEzVal("ezBoluvesDate", "boluvesDate", "")),
        toBoolStr(getEzVal("ezJaring", "jaringInstalled", false)),
        String(getEzVal("ezJaringDate", "jaringDate", "")),
        toBoolStr(getEzVal("ezPelakor", "pelakorInstalled", false)),
        String(getEzVal("ezPelakorDate", "pelakorDate", "")),
        toBoolStr(getEzVal("ezKawatSilet", "kawatSiletInstalled", false)),
        String(getEzVal("ezKawatSiletDate", "kawatSiletDate", "")),
        toBoolStr(getEzVal("ezAsb", "asbInstalled", false)),
        String(getEzVal("ezAsbDate", "asbDate", "")),
        toBoolStr(getEzVal("ezPemves", "pemvesInstalled", false)),
        String(getEzVal("ezPemvesDate", "pemvesDate", "")),
        toBoolStr(getEzVal("ezTogarAbes", "togarAbesInstalled", false)),
        String(getEzVal("ezTogarAbesDate", "togarAbesDate", ""))
      ];

      // Tulis 22 kolom sekaligus (Kolom E sampai Z)
      sheet.getRange(rowIndex, 5, 1, 22).setValues([ezValues]);

      // Perbarui juga Kolom AJ (36: ANTI BINATANG TERPASANG) secara sinkron
      const installedNames = [];
      if (toBoolStr(getEzVal("ezTopSkorL1", "topSkorL1", false)) === "TRUE" || toBoolStr(getEzVal("ezTopSkorL2", "topSkorL2", false)) === "TRUE") installedNames.push("TOP SKOR");
      if (toBoolStr(getEzVal("ezIronmanL1", "ironmanL1", false)) === "TRUE" || toBoolStr(getEzVal("ezIronmanL2", "ironmanL2", false)) === "TRUE") installedNames.push("IRONMAN");
      if (toBoolStr(getEzVal("ezBoluves", "boluvesInstalled", false)) === "TRUE") installedNames.push("BOLUVES");
      if (toBoolStr(getEzVal("ezJaring", "jaringInstalled", false)) === "TRUE") installedNames.push("JARING");
      if (toBoolStr(getEzVal("ezPelakor", "pelakorInstalled", false)) === "TRUE") installedNames.push("PELAKOR");
      if (toBoolStr(getEzVal("ezKawatSilet", "kawatSiletInstalled", false)) === "TRUE") installedNames.push("KAWAT SILET");
      if (toBoolStr(getEzVal("ezAsb", "asbInstalled", false)) === "TRUE") installedNames.push("ASB");
      if (toBoolStr(getEzVal("ezPemves", "pemvesInstalled", false)) === "TRUE") installedNames.push("PEMVES");
      if (toBoolStr(getEzVal("ezTogarAbes", "togarAbesInstalled", false)) === "TRUE") installedNames.push("TOGAR ABES");

      if (installedNames.length > 0) {
        sheet.getRange(rowIndex, 36).setValue(installedNames.join(", "));
      } else {
        sheet.getRange(rowIndex, 36).setValue("TIDAK TERPASANG");
      }
    }

    // =========================================================================
    // 2. TULIS KE KOLOM AL (38: BINATANG 1) & KOLOM AM (39: BINATANG 2)
    // =========================================================================
    let b1 = contents.binatang1;
    let b2 = contents.binatang2;
    if (b1 === undefined && contents.kategori !== undefined) {
      if (contents.kategori === "(Blanks) / Tidak Ada" || !contents.kategori) {
        b1 = "";
        b2 = "";
      } else {
        const parts = contents.kategori.split(",").map(function(s) { return s.trim(); });
        b1 = parts[0] || "";
        b2 = parts[1] || "";
      }
    }
    if (b1 !== undefined) {
      sheet.getRange(rowIndex, 38).setValue(b1 ? String(b1).toUpperCase() : ""); // Kolom AL
    }
    if (b2 !== undefined) {
      sheet.getRange(rowIndex, 39).setValue(b2 ? String(b2).toUpperCase() : ""); // Kolom AM
    }

    // =========================================================================
    // 3. TULIS KE KOLOM AJ (36: ANTI BINATANG TERPASANG) MANUAL (JIKA BUKAN DARI KOLOM E-Z)
    // =========================================================================
    if (!contents.hasKolomEZ && contents.proteksi !== undefined) {
      if (contents.proteksi === "BELUM TERPASANG") {
        sheet.getRange(rowIndex, 36).setValue("TIDAK TERPASANG");
      } else {
        sheet.getRange(rowIndex, 36).setValue(contents.perangkat && contents.perangkat !== "-" ? contents.perangkat : "TERPASANG");
      }
    }

    // =========================================================================
    // 4. TULIS KE KOLOM AQ (43: REKOMENDASI)
    // =========================================================================
    if (contents.rekomendasi !== undefined) {
      sheet.getRange(rowIndex, 43).setValue(contents.rekomendasi);
    }

    // =========================================================================
    // 5. TULIS KE KOLOM AR (44: PEMBERSIHAN TAPAK TOWER)
    // =========================================================================
    if (contents.tapak !== undefined || contents.tapakBool !== undefined) {
      const isTapak = contents.tapakBool !== undefined 
        ? Boolean(contents.tapakBool) 
        : (String(contents.tapak).toUpperCase().includes("PERLU") || contents.tapak === true || String(contents.tapak).toUpperCase() === "TRUE");
      sheet.getRange(rowIndex, 44).setValue(isTapak ? "TRUE" : "FALSE");
    }

    // =========================================================================
    // 6. TULIS KE KOLOM AS s.d. BA (45 s.d. 53: RENCANA PERANGKAT TINDAK LANJUT)
    // =========================================================================
    if (contents.boluves !== undefined) sheet.getRange(rowIndex, 45).setValue(toBoolStr(contents.boluves));
    if (contents.jaring !== undefined) sheet.getRange(rowIndex, 46).setValue(toBoolStr(contents.jaring));
    if (contents.pemves !== undefined) sheet.getRange(rowIndex, 47).setValue(toBoolStr(contents.pemves));
    if (contents.pelakor !== undefined) sheet.getRange(rowIndex, 48).setValue(toBoolStr(contents.pelakor));
    if (contents.topSkor !== undefined) sheet.getRange(rowIndex, 49).setValue(toBoolStr(contents.topSkor));
    if (contents.ironMan !== undefined) sheet.getRange(rowIndex, 50).setValue(toBoolStr(contents.ironMan));
    if (contents.kawatSilet !== undefined) sheet.getRange(rowIndex, 51).setValue(toBoolStr(contents.kawatSilet));
    if (contents.asb !== undefined) sheet.getRange(rowIndex, 52).setValue(toBoolStr(contents.asb));
    if (contents.togarAbes !== undefined) sheet.getRange(rowIndex, 53).setValue(toBoolStr(contents.togarAbes));

    // =========================================================================
    // 7. TULIS KE KOLOM BC (55: CATATAN)
    // =========================================================================
    if (contents.catatan !== undefined) {
      sheet.getRange(rowIndex, 55).setValue(contents.catatan);
    }

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data menara " + targetNama + " berhasil disimpan ke Spreadsheet (termasuk Kolom E-Z)!",
      row: rowIndex
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal memproses update: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
