/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) - BACKEND SISTEM MONITORING SATWA TRS_PLM
 * UPT PALEMBANG
 * Fitur:
 * 1. Sheet Utama (TRS_PLM): Baca & Tulis Kolom E s.d. Z, AJ, AL, AM, AQ, AR s.d. BA
 * 2. Sheet DRAFT_ANTREAN: Penampungan Usulan Perubahan Realtime (Cloud Staging)
 * 3. Sistem Approval & Audit Trail (Nama Petugas, Timestamp, Status ACC)
 * 4. Verifikasi PIN Supervisor Tanpa Bocor di Frontend Inspect Element
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
 *    - Selesai! Script baru langsung aktif.
 */

// Konfigurasi Default PIN Supervisor (Bisa juga diset di Project Settings > Script Properties)
function getSupervisorPIN() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty("SUPERVISOR_PIN") || "1234";
  } catch (e) {
    return "1234";
  }
}

// Helper: Dapatkan sheet data utama TRS_PLM
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

// Helper: Dapatkan atau buat Tab Sheet "DRAFT_ANTREAN" otomatis jika belum ada
function getOrCreateDraftSheet(ss) {
  let draftSheet = ss.getSheetByName("DRAFT_ANTREAN");
  if (!draftSheet) {
    draftSheet = ss.insertSheet("DRAFT_ANTREAN");
    const headers = [
      "ID_DRAFT",
      "TIMESTAMP",
      "NAMA_PETUGAS",
      "NAMA_TOWER",
      "JALUR",
      "ULTG",
      "JENIS_USULAN",
      "RINGKASAN_PERUBAHAN",
      "PAYLOAD_JSON",
      "STATUS",
      "DISETUJUI_OLEH",
      "TANGGAL_ACC"
    ];
    draftSheet.appendRow(headers);
    const headerRange = draftSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0284c7");
    headerRange.setFontColor("#ffffff");
    draftSheet.setFrozenRows(1);
    draftSheet.setColumnWidth(1, 160); // ID
    draftSheet.setColumnWidth(2, 140); // Timestamp
    draftSheet.setColumnWidth(3, 160); // Petugas
    draftSheet.setColumnWidth(4, 120); // Tower
    draftSheet.setColumnWidth(5, 180); // Jalur
    draftSheet.setColumnWidth(6, 130); // ULTG
    draftSheet.setColumnWidth(7, 180); // Jenis
    draftSheet.setColumnWidth(8, 260); // Ringkasan
    draftSheet.setColumnWidth(9, 100); // Payload JSON
    draftSheet.setColumnWidth(10, 110); // Status
    draftSheet.setColumnWidth(11, 160); // Disetujui
    draftSheet.setColumnWidth(12, 140); // Tanggal ACC
  }
  return draftSheet;
}

// Helper format tanggal Indonesia (WIB)
function getFormattedNow() {
  const d = new Date();
  return Utilities.formatDate(d, "GMT+7", "dd/MM/yyyy HH:mm:ss");
}

// Handler GET
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "";

    // 1. Aksi Khusus: Ambil Data Antrean Draft dari Sheet DRAFT_ANTREAN
    if (action === "getDrafts") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      return handleGetDrafts(ss, params.status || "ALL");
    }

    // 2. Aksi Khusus: Verifikasi PIN Supervisor secara aman
    if (action === "verifyPin") {
      const isMatch = String(params.pin || "").trim() === String(getSupervisorPIN()).trim();
      return ContentService.createTextOutput(JSON.stringify({
        status: isMatch ? "success" : "error",
        valid: isMatch,
        message: isMatch ? "PIN Supervisor Valid" : "PIN Salah"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Fallback Update via GET (jika ada payload atau action lain)
    if (action || params.payload || params.nama) {
      let contents = {};
      if (params.payload) {
        try {
          contents = JSON.parse(params.payload);
        } catch (err) {
          contents = params;
        }
      } else {
        contents = params;
      }
      return routeAction(contents);
    }

    // 4. Default GET: Baca seluruh data menara dari sheet utama
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
    const data = sheet.getDataRange().getValues();
    const towers = [];

    for (let i = 3; i < data.length; i++) {
      const r = data[i];
      const nama = String(r[3] || "").trim();
      if (!nama) continue;

      const ultg = String(r[1] || "").trim();
      const jalur = String(r[2] || "").trim();
      const b1 = String(r[37] || "").trim();
      const b2 = String(r[38] || "").trim();
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
        catatan: String(r[54] || r[40] || "-").trim(),
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

// Handler POST
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

    return routeAction(contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Router Tindakan Berdasarkan parameter 'action'
function routeAction(contents) {
  const action = contents.action || "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Simpan usulan draft ke tab DRAFT_ANTREAN (Terbuka untuk teknisi lapangan input usulan)
  if (action === "submitDraft") {
    return handleSubmitDraft(ss, contents);
  }

  // 2. Ambil daftar draft antrean (Read-only status antrean)
  if (action === "getDrafts") {
    return handleGetDrafts(ss, contents.status || "ALL");
  }

  // 3. Otorisasi Keamanan: Cegah IDOR & Manipulasi Data Tanpa Izin
  // Seluruh tindakan verifikasi ACC, penolakan, maupun penulisan langsung wajib menyertakan PIN Supervisor yang valid
  const providedPin = String(contents.pin || contents.supervisorPin || "").trim();
  const validPin = String(getSupervisorPIN()).trim();
  if (!providedPin || providedPin !== validPin) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Akses Ditolak (401 Unauthorized): PIN Supervisor diperlukan untuk menyetujui (ACC) atau mengubah data menara."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. Setujui usulan draft tertentu (ACC) & terapkan ke sheet utama
  if (action === "approveDraft") {
    return handleApproveDraft(ss, contents);
  }

  // 5. Tolak usulan draft
  if (action === "rejectDraft") {
    return handleRejectDraft(ss, contents);
  }

  // 6. Batch ACC banyak draft sekaligus
  if (action === "batchApproveDrafts") {
    return handleBatchApproveDrafts(ss, contents);
  }

  // 7. Langsung tulis ke data utama (Memerlukan PIN)
  return handleUpdateRequest(contents);
}

// =========================================================================
// SISTEM PENAMPUNGAN DRAFT ANTREAN (TAB DRAFT_ANTREAN)
// =========================================================================

// Simpan usulan perubahan baru ke Tab DRAFT_ANTREAN
function handleSubmitDraft(ss, contents) {
  try {
    const draftSheet = getOrCreateDraftSheet(ss);
    const draftId = contents.id || ("DFT_" + Date.now() + "_" + Math.floor(Math.random() * 1000));
    const timestamp = getFormattedNow();
    const operatorName = contents.operatorName || "Teknisi Lapangan";
    const towerName = contents.towerName || contents.nama || "-";
    const jalur = contents.jalur || "-";
    const ultg = contents.ultg || "-";
    const typeLabel = contents.typeLabel || contents.type || "Perubahan Data";
    
    // Ringkasan perubahan manusiawi (contoh: "TOP SKOR: BELUM -> TERPASANG")
    let summaryText = "";
    if (contents.changesSummary && Array.isArray(contents.changesSummary)) {
      summaryText = contents.changesSummary.map(function(s) {
        return s.label + ": [" + (s.before || "-") + " ➔ " + (s.after || "-") + "]";
      }).join("; ");
    } else {
      summaryText = contents.summary || "-";
    }

    const payloadJson = typeof contents.payload === "string" ? contents.payload : JSON.stringify(contents.payload || contents);
    const status = "PENDING";
    const approvedBy = "-";
    const accDate = "-";

    draftSheet.appendRow([
      draftId,
      timestamp,
      operatorName,
      towerName,
      jalur,
      ultg,
      typeLabel,
      summaryText,
      payloadJson,
      status,
      approvedBy,
      accDate
    ]);

    // Beri warna baris baru (kuning muda penanda PENDING)
    const lastRow = draftSheet.getLastRow();
    draftSheet.getRange(lastRow, 1, 1, 12).setBackground("#fef9c3");

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Usulan draft untuk menara " + towerName + " berhasil dicatat di tab DRAFT_ANTREAN!",
      draftId: draftId,
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal menyimpan ke DRAFT_ANTREAN: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Baca daftar draft antrean dari Tab DRAFT_ANTREAN
function handleGetDrafts(ss, statusFilter) {
  try {
    const draftSheet = getOrCreateDraftSheet(ss);
    const data = draftSheet.getDataRange().getValues();
    const drafts = [];

    // Baris 0 adalah Header
    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      const draftId = String(r[0] || "").trim();
      if (!draftId) continue;

      const status = String(r[9] || "PENDING").trim().toUpperCase();

      if (statusFilter && statusFilter !== "ALL" && status !== statusFilter.toUpperCase()) {
        continue;
      }

      let payload = {};
      try {
        payload = JSON.parse(r[8] || "{}");
      } catch (pErr) {
        payload = {};
      }

      drafts.push({
        rowIndex: i + 1,
        id: draftId,
        timestamp: String(r[1] || ""),
        operatorName: String(r[2] || "Teknisi Lapangan"),
        towerName: String(r[3] || "-"),
        jalur: String(r[4] || "-"),
        ultg: String(r[5] || "-"),
        typeLabel: String(r[6] || "Perubahan"),
        summary: String(r[7] || "-"),
        payload: payload,
        status: status,
        approvedBy: String(r[10] || "-"),
        accDate: String(r[11] || "-")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: drafts.length,
      drafts: drafts
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal membaca DRAFT_ANTREAN: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Setujui (ACC) satu draft: Update status jadi APPROVED & terapkan payload ke Tab Utama
function handleApproveDraft(ss, contents) {
  try {
    const draftSheet = getOrCreateDraftSheet(ss);
    const draftId = String(contents.draftId || contents.id || "").trim();
    const supervisorName = contents.supervisorName || contents.operatorName || "Supervisor";
    const data = draftSheet.getDataRange().getValues();
    let foundRow = -1;
    let payloadStr = "";

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === draftId) {
        foundRow = i + 1;
        payloadStr = data[i][8];
        break;
      }
    }

    if (foundRow === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Draft ID tidak ditemukan: " + draftId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Eksekusi payload ke Tab Utama
    let payload = {};
    try {
      payload = JSON.parse(payloadStr || "{}");
    } catch (e) {
      payload = contents.payload || {};
    }

    const updateResult = executeSheetUpdate(ss, payload);

    // 2. Tandai status baris draft jadi APPROVED
    const accDate = getFormattedNow();
    draftSheet.getRange(foundRow, 10).setValue("APPROVED");
    draftSheet.getRange(foundRow, 11).setValue(supervisorName);
    draftSheet.getRange(foundRow, 12).setValue(accDate);
    // Beri warna hijau muda penanda APPROVED
    draftSheet.getRange(foundRow, 1, 1, 12).setBackground("#dcfce7");

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Draft " + draftId + " berhasil di-ACC dan disinkronkan ke Data Utama!",
      updateResult: updateResult
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal menyetujui draft: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Tolak satu draft (Status: REJECTED)
function handleRejectDraft(ss, contents) {
  try {
    const draftSheet = getOrCreateDraftSheet(ss);
    const draftId = String(contents.draftId || contents.id || "").trim();
    const supervisorName = contents.supervisorName || contents.operatorName || "Supervisor";
    const data = draftSheet.getDataRange().getValues();
    let foundRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === draftId) {
        foundRow = i + 1;
        break;
      }
    }

    if (foundRow === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Draft ID tidak ditemukan: " + draftId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const accDate = getFormattedNow();
    draftSheet.getRange(foundRow, 10).setValue("REJECTED");
    draftSheet.getRange(foundRow, 11).setValue(supervisorName);
    draftSheet.getRange(foundRow, 12).setValue(accDate);
    // Beri warna merah muda penanda REJECTED
    draftSheet.getRange(foundRow, 1, 1, 12).setBackground("#fee2e2");

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Draft " + draftId + " telah ditolak (REJECTED)."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal menolak draft: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Batch Approve banyak draft sekaligus
function handleBatchApproveDrafts(ss, contents) {
  try {
    const draftSheet = getOrCreateDraftSheet(ss);
    const supervisorName = contents.supervisorName || contents.operatorName || "Supervisor";
    const targetIds = contents.draftIds || []; // Jika kosong, approve semua yang PENDING
    const data = draftSheet.getDataRange().getValues();
    const accDate = getFormattedNow();
    let approvedCount = 0;

    for (let i = 1; i < data.length; i++) {
      const currentId = String(data[i][0]).trim();
      const currentStatus = String(data[i][9]).trim().toUpperCase();

      const shouldApprove = (targetIds.length === 0 && currentStatus === "PENDING") ||
                            (targetIds.includes(currentId) && currentStatus === "PENDING");

      if (shouldApprove) {
        let payload = {};
        try {
          payload = JSON.parse(data[i][8] || "{}");
        } catch (e) {}

        // Terapkan ke sheet utama
        executeSheetUpdate(ss, payload);

        // Update row
        const rowNum = i + 1;
        draftSheet.getRange(rowNum, 10).setValue("APPROVED");
        draftSheet.getRange(rowNum, 11).setValue(supervisorName);
        draftSheet.getRange(rowNum, 12).setValue(accDate);
        draftSheet.getRange(rowNum, 1, 1, 12).setBackground("#dcfce7");
        approvedCount++;
      }
    }

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: approvedCount + " usulan draft berhasil di-ACC dan diterapkan ke Data Utama!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal memproses batch approval: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Trigger Otomatis Jika Supervisor Mengubah Dropdown Status di Spreadsheet Langsung
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== "DRAFT_ANTREAN") return;

    const col = e.range.getColumn();
    const row = e.range.getRow();

    // Kolom 10 adalah Kolom STATUS
    if (col === 10 && row > 1) {
      const newVal = String(e.value || "").trim().toUpperCase();
      const ss = SpreadsheetApp.getActiveSpreadsheet();

      if (newVal === "APPROVED") {
        const payloadStr = sheet.getRange(row, 9).getValue();
        let payload = {};
        try {
          payload = JSON.parse(payloadStr);
        } catch (err) {}

        // Terapkan ke Tab Utama
        executeSheetUpdate(ss, payload);

        sheet.getRange(row, 11).setValue("Supervisor (Langsung di Sheet)");
        sheet.getRange(row, 12).setValue(getFormattedNow());
        sheet.getRange(row, 1, 1, 12).setBackground("#dcfce7");
      } else if (newVal === "REJECTED") {
        sheet.getRange(row, 11).setValue("Supervisor (Langsung di Sheet)");
        sheet.getRange(row, 12).setValue(getFormattedNow());
        sheet.getRange(row, 1, 1, 12).setBackground("#fee2e2");
      }
    }
  } catch (err) {
    console.warn("onEdit error:", err);
  }
}

// =========================================================================
// LOGIKA PENULISAN KE DATA UTAMA TRS_PLM
// =========================================================================

function handleUpdateRequest(contents) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return executeSheetUpdate(ss, contents);
}

function executeSheetUpdate(ss, contents) {
  try {
    const sheet = getTargetSheet(ss);
    const targetNama = String(contents.nama || contents.towerName || "").trim();
    if (!targetNama) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Parameter 'nama' menara diperlukan."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Cari baris berdasarkan Nama Menara di Kolom D (index 3)
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

    // 1. TULIS KE KOLOM E s.d. Z (5 s.d. 26: PEMASANGAN ANTI BINATANG & TANGGAL)
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

    // 2. TULIS KE KOLOM AL (38: BINATANG 1) & KOLOM AM (39: BINATANG 2)
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
      sheet.getRange(rowIndex, 38).setValue(b1 ? String(b1).toUpperCase() : "");
    }
    if (b2 !== undefined) {
      sheet.getRange(rowIndex, 39).setValue(b2 ? String(b2).toUpperCase() : "");
    }

    // 3. TULIS KE KOLOM AJ MANUAL (JIKA BUKAN DARI KOLOM E-Z)
    if (!contents.hasKolomEZ && contents.proteksi !== undefined) {
      if (contents.proteksi === "BELUM TERPASANG") {
        sheet.getRange(rowIndex, 36).setValue("TIDAK TERPASANG");
      } else {
        sheet.getRange(rowIndex, 36).setValue(contents.perangkat && contents.perangkat !== "-" ? contents.perangkat : "TERPASANG");
      }
    }

    // 4. TULIS KE KOLOM AQ (43: REKOMENDASI)
    if (contents.rekomendasi !== undefined) {
      sheet.getRange(rowIndex, 43).setValue(contents.rekomendasi);
    }

    // 5. TULIS KE KOLOM AR (44: PEMBERSIHAN TAPAK TOWER)
    if (contents.tapak !== undefined || contents.tapakBool !== undefined) {
      const isTapak = contents.tapakBool !== undefined 
        ? Boolean(contents.tapakBool) 
        : (String(contents.tapak).toUpperCase().includes("PERLU") || contents.tapak === true || String(contents.tapak).toUpperCase() === "TRUE");
      sheet.getRange(rowIndex, 44).setValue(isTapak ? "TRUE" : "FALSE");
    }

    // 6. TULIS KE KOLOM AS s.d. BA (45 s.d. 53: RENCANA PERANGKAT TINDAK LANJUT)
    if (contents.boluves !== undefined) sheet.getRange(rowIndex, 45).setValue(toBoolStr(contents.boluves));
    if (contents.jaring !== undefined) sheet.getRange(rowIndex, 46).setValue(toBoolStr(contents.jaring));
    if (contents.pemves !== undefined) sheet.getRange(rowIndex, 47).setValue(toBoolStr(contents.pemves));
    if (contents.pelakor !== undefined) sheet.getRange(rowIndex, 48).setValue(toBoolStr(contents.pelakor));
    if (contents.topSkor !== undefined) sheet.getRange(rowIndex, 49).setValue(toBoolStr(contents.topSkor));
    if (contents.ironMan !== undefined) sheet.getRange(rowIndex, 50).setValue(toBoolStr(contents.ironMan));
    if (contents.kawatSilet !== undefined) sheet.getRange(rowIndex, 51).setValue(toBoolStr(contents.kawatSilet));
    if (contents.asb !== undefined) sheet.getRange(rowIndex, 52).setValue(toBoolStr(contents.asb));
    if (contents.togarAbes !== undefined) sheet.getRange(rowIndex, 53).setValue(toBoolStr(contents.togarAbes));

    // 7. TULIS KE KOLOM BC (55: CATATAN)
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
