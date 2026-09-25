/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) - BACKEND SISTEM MONITORING SATWA TRS_PLM
 * UPT PALEMBANG
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
        boluves: String(r[44] || "FALSE").toUpperCase().includes("TRUE"),
        jaring: String(r[45] || "FALSE").toUpperCase().includes("TRUE"),
        pemves: String(r[46] || "FALSE").toUpperCase().includes("TRUE"),
        pelakor: String(r[47] || "FALSE").toUpperCase().includes("TRUE"),
        topSkor: String(r[48] || "FALSE").toUpperCase().includes("TRUE"),
        ironMan: String(r[49] || "FALSE").toUpperCase().includes("TRUE"),
        kawatSilet: String(r[50] || "FALSE").toUpperCase().includes("TRUE"),
        asb: String(r[51] || "FALSE").toUpperCase().includes("TRUE"),
        togarAbes: String(r[52] || "FALSE").toUpperCase().includes("TRUE"),
        catatan: String(r[54] || r[40] || "-").trim()
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

    // 1. TULIS KE KOLOM AL (38: BINATANG 1) & KOLOM AM (39: BINATANG 2)
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

    // 2. TULIS KE KOLOM AJ (36: ANTI BINATANG TERPASANG)
    if (contents.proteksi !== undefined) {
      if (contents.proteksi === "BELUM TERPASANG") {
        sheet.getRange(rowIndex, 36).setValue("TIDAK TERPASANG");
      } else {
        sheet.getRange(rowIndex, 36).setValue(contents.perangkat && contents.perangkat !== "-" ? contents.perangkat : "TERPASANG");
      }
    }

    // 3. TULIS KE KOLOM AQ (43: Rekomendasi)
    if (contents.rekomendasi !== undefined) {
      sheet.getRange(rowIndex, 43).setValue(contents.rekomendasi);
    }

    // 4. TULIS KE KOLOM AR (44: PEMBERSIHAN TAPAK TOWER)
    if (contents.tapak !== undefined || contents.tapakBool !== undefined) {
      const isTapak = contents.tapakBool !== undefined 
        ? Boolean(contents.tapakBool) 
        : (String(contents.tapak).toUpperCase().includes("PERLU") || contents.tapak === true || String(contents.tapak).toUpperCase() === "TRUE");
      sheet.getRange(rowIndex, 44).setValue(isTapak ? "TRUE" : "FALSE");
    }

    // 5. TULIS KE KOLOM AS s.d. BA (45 s.d. 53: RENCANA PERANGKAT TINDAK LANJUT)
    const toBoolStr = function(val) {
      return (val === true || String(val).toUpperCase() === "TRUE" || val === 1 || val === "1") ? "TRUE" : "FALSE";
    };

    if (contents.boluves !== undefined) {
      sheet.getRange(rowIndex, 45).setValue(toBoolStr(contents.boluves)); // AS: BOLUVES
    }
    if (contents.jaring !== undefined) {
      sheet.getRange(rowIndex, 46).setValue(toBoolStr(contents.jaring)); // AT: JARING
    }
    if (contents.pemves !== undefined) {
      sheet.getRange(rowIndex, 47).setValue(toBoolStr(contents.pemves)); // AU: PEMVES
    }
    if (contents.pelakor !== undefined) {
      sheet.getRange(rowIndex, 48).setValue(toBoolStr(contents.pelakor)); // AV: PELAKOR
    }
    if (contents.topSkor !== undefined) {
      sheet.getRange(rowIndex, 49).setValue(toBoolStr(contents.topSkor)); // AW: TOP SKOR
    }
    if (contents.ironMan !== undefined) {
      sheet.getRange(rowIndex, 50).setValue(toBoolStr(contents.ironMan)); // AX: IRON MAN
    }
    if (contents.kawatSilet !== undefined) {
      sheet.getRange(rowIndex, 51).setValue(toBoolStr(contents.kawatSilet)); // AY: KAWAT SILET
    }
    if (contents.asb !== undefined) {
      sheet.getRange(rowIndex, 52).setValue(toBoolStr(contents.asb)); // AZ: ASB
    }
    if (contents.togarAbes !== undefined) {
      sheet.getRange(rowIndex, 53).setValue(toBoolStr(contents.togarAbes)); // BA: TOGAR ABES
    }

    // 6. TULIS KE KOLOM BC (55: Catatan)
    if (contents.catatan !== undefined) {
      sheet.getRange(rowIndex, 55).setValue(contents.catatan);
    }

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data menara " + targetNama + " berhasil disimpan ke Spreadsheet!",
      row: rowIndex
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal memproses update: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
