/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) - BACKEND SISTEM MONITORING SATWA TRS_PLM
 * UPT PALEMBANG
 * =========================================================================
 * 
 * PETUNJUK PEMASANGAN DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet TRS_PLM Anda:
 *    https://docs.google.com/spreadsheets/d/1IMpg20-ciVpykFKyM4TB60Mt2asL9o1H2thnNYDtudo/edit
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script".
 * 3. Hapus semua kode default (myFunction), lalu tempel seluruh isi script ini.
 * 4. Klik ikon "Save" (Disket).
 * 5. Klik tombol biru "Deploy" (Terapkan) di kanan atas > pilih "New deployment" (Penerapan baru).
 * 6. Klik ikon Gear (Roda gigi) di samping 'Select type' > pilih "Web app".
 * 7. PENGATURAN SANGAT PENTING:
 *    - Description: "API Satwa TRS_PLM"
 *    - Execute as: "Me" (Akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja)  <-- WAJIB PILIH INI agar tidak 403 Forbidden!
 * 8. Klik "Deploy", lalu klik "Authorize Access" dan pilih "Allow".
 * 9. Salin URL Web App yang muncul (akhiran /exec), lalu ganti SCRIPT_URL di js/config.js.
 */

// Helper: dapatkan sheet data TRS_PLM secara otomatis
function getTargetSheet(ss) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName().toUpperCase();
    if (name.includes("TRS_PLM") || name.includes("KERAWANAN")) {
      return sheets[i];
    }
  }
  return ss.getActiveSheet() || sheets[0];
}

// Handler GET: Verifikasi endpoint dan pembacaan data
function doGet(e) {
  try {
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
      const b1 = String(r[37] || "").trim(); // Kolom AL: Binatang 1
      const b2 = String(r[38] || "").trim(); // Kolom AM: Binatang 2
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
        aktivitas: (kategori !== "(Blanks) / Tidak Ada" && proteksi === "BELUM TERPASANG") ? "Tidak Sesuai" : "Sesuai",
        rekomendasi: String(r[42] || "-").trim(),
        tapak: String(r[43] || "FALSE").toUpperCase().includes("TRUE") ? "Perlu Pembersihan Tapak" : "Tidak Diperlukan",
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

// Handler POST: Menyimpan pembaruan data menara dari Web Dashboard ke Kolom AL & Kolom AM Spreadsheet
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
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

    // Cari baris berdasarkan Nama Menara di Kolom D (index 3)
    for (let i = 3; i < data.length; i++) {
      if (String(data[i][3]).trim() === targetNama) {
        rowIndex = i + 1; // 1-based index baris sheet
        break;
      }
    }

    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Menara tidak ditemukan: " + targetNama
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. TULIS KHUSUS KE KOLOM AL (38: BINATANG 1) & KOLOM AM (39: BINATANG 2)
    // Formula TEXTJOIN di kolom AN / AP akan otomatis terhitung oleh spreadsheet
    let b1 = contents.binatang1;
    let b2 = contents.binatang2;
    if (b1 === undefined && contents.kategori !== undefined) {
      if (contents.kategori === "(Blanks) / Tidak Ada" || !contents.kategori) {
        b1 = "";
        b2 = "";
      } else {
        const parts = contents.kategori.split(",").map(s => s.trim());
        b1 = parts[0] || "";
        b2 = parts[1] || "";
      }
    }
    if (b1 !== undefined) {
      sheet.getRange(rowIndex, 38).setValue(b1 || ""); // Kolom AL
    }
    if (b2 !== undefined) {
      sheet.getRange(rowIndex, 39).setValue(b2 || ""); // Kolom AM
    }

    // 2. Kolom AJ (36) -> ANTI BINATANG TERPASANG
    if (contents.proteksi !== undefined) {
      if (contents.proteksi === "BELUM TERPASANG") {
        sheet.getRange(rowIndex, 36).setValue("TIDAK TERPASANG");
      } else {
        sheet.getRange(rowIndex, 36).setValue(contents.perangkat && contents.perangkat !== "-" ? contents.perangkat : "TERPASANG");
      }
    }

    // 3. Kolom AQ (43) -> Rekomendasi
    if (contents.rekomendasi !== undefined) {
      sheet.getRange(rowIndex, 43).setValue(contents.rekomendasi);
    }

    // 4. Kolom AR (44) -> PEMBERSIHAN TAPAK TOWER
    if (contents.tapak !== undefined) {
      sheet.getRange(rowIndex, 44).setValue(contents.tapak === "Perlu Pembersihan Tapak" ? "TRUE" : "FALSE");
    }

    // 5. Kolom BC (55) -> Catatan
    if (contents.catatan !== undefined) {
      sheet.getRange(rowIndex, 55).setValue(contents.catatan);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data menara " + targetNama + " berhasil ditulis ke Kolom AL & AM!",
      row: rowIndex,
      binatang1: b1,
      binatang2: b2
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
