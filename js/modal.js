/**
 * PENGELOLAAN MODAL SINKRONISASI REALTIME KE GOOGLE SHEETS
 * PLN UPT Palembang
 * 
 * Pemisahan Fungsional:
 * 1. Tab Kerawanan Satwa -> Modal Satwa (Kolom AL & Kolom AM)
 * 2. Tab Manajemen Asset -> Modal Proteksi (Kolom E s.d. Kolom Z)
 */

// =========================================================================
// 1. MODAL KHUSUS TAB KERAWANAN SATWA (KOLOM AL & KOLOM AM)
// =========================================================================

// Buka modal input/edit Kerawanan Satwa (Kolom AL & AM)
function openModalSatwaALAM(no) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;

  // Header info
  const elNo = document.getElementById("satwaTowerNo");
  if (elNo) elNo.value = item.no;

  const elNamaHidden = document.getElementById("satwaTowerNamaHidden");
  if (elNamaHidden) elNamaHidden.value = item.nama;

  const elName = document.getElementById("satwaModalTowerName");
  if (elName) elName.innerText = item.nama;

  const elJalur = document.getElementById("satwaModalJalur");
  if (elJalur) elJalur.innerText = item.jalur;

  const elUltg = document.getElementById("satwaModalUltg");
  if (elUltg) elUltg.innerText = item.ultg;

  // Ekstrak Kolom AL (Binatang 1) & Kolom AM (Binatang 2)
  let b1 = item.binatang1 || "";
  let b2 = item.binatang2 || "";
  if (!b1 && item.kategori && item.kategori !== "(Blanks) / Tidak Ada" && item.kategori !== "-") {
    const parts = item.kategori.split(",").map(s => s.trim().toUpperCase());
    b1 = parts[0] || "";
    b2 = parts[1] || "";
  }

  const elB1 = document.getElementById("satwaBinatang1");
  if (elB1) elB1.value = b1;

  const elB2 = document.getElementById("satwaBinatang2");
  if (elB2) elB2.value = b2;

  // Aktivitas & Catatan
  const elAkt = document.getElementById("satwaAktivitas");
  if (elAkt) elAkt.value = (item.aktivitas === "Tidak Sesuai") ? "Tidak Sesuai" : "Sesuai";

  const elCat = document.getElementById("satwaCatatan");
  if (elCat) elCat.value = item.catatan !== "-" ? (item.catatan || "") : "";

  // Pratinjau
  updateSatwaLivePreview();

  const modal = document.getElementById("modalSatwaALAM");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  if (window.lucide) window.lucide.createIcons();
}

// Tutup modal Satwa (Kolom AL & AM)
function closeModalSatwaALAM() {
  const modal = document.getElementById("modalSatwaALAM");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Update pratinjau kategori satwa secara realtime saat dropdown diubah
function updateSatwaLivePreview() {
  const b1 = (document.getElementById("satwaBinatang1") ? document.getElementById("satwaBinatang1").value : "").trim();
  const b2 = (document.getElementById("satwaBinatang2") ? document.getElementById("satwaBinatang2").value : "").trim();

  let previewText = "(Blanks) / Tidak Ada";
  if (b1 && b2) {
    previewText = `${b1}, ${b2}`;
  } else if (b1) {
    previewText = b1;
  } else if (b2) {
    previewText = b2;
  }

  const elPreview = document.getElementById("satwaPreviewKategori");
  if (elPreview) {
    elPreview.innerText = previewText;
    if (previewText === "(Blanks) / Tidak Ada") {
      elPreview.className = "font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200";
    } else {
      elPreview.className = "font-bold text-sky-800 bg-white px-2.5 py-0.5 rounded border border-sky-300";
    }
  }
}

// Submit data satwa Kolom AL & Kolom AM (Masuk ke Penampungan / Draft Staging)
async function submitSatwaALAMUpdate(event) {
  event.preventDefault();

  const no = parseInt(document.getElementById("satwaTowerNo").value, 10);
  const towerName = document.getElementById("satwaTowerNamaHidden").value;
  const b1 = (document.getElementById("satwaBinatang1") ? document.getElementById("satwaBinatang1").value : "").trim();
  const b2 = (document.getElementById("satwaBinatang2") ? document.getElementById("satwaBinatang2").value : "").trim();
  const aktivitas = (document.getElementById("satwaAktivitas") ? document.getElementById("satwaAktivitas").value : "Sesuai");
  const catatan = (document.getElementById("satwaCatatan") ? document.getElementById("satwaCatatan").value : "").trim() || "-";

  let kategori = "(Blanks) / Tidak Ada";
  if (b1 && b2) {
    kategori = `${b1}, ${b2}`;
  } else if (b1) {
    kategori = b1;
  } else if (b2) {
    kategori = b2;
  }

  const payload = {
    action: "updateSatwaALAM",
    nama: towerName,
    binatang1: b1,
    binatang2: b2,
    kategori: kategori,
    aktivitas: aktivitas,
    catatan: catatan
  };

  const item = towerData.find(t => t.no === no);
  const ultg = item ? item.ultg : "-";
  const jalur = item ? item.jalur : "-";

  const changeObj = {
    type: "satwa",
    typeLabel: "Kerawanan Satwa (Kolom AL & AM)",
    towerNo: no,
    towerName: towerName,
    ultg: ultg,
    jalur: jalur,
    payload: payload,
    changesSummary: [
      { label: "Binatang 1 (AL)", before: (item ? item.binatang1 : "-") || "-", after: b1 || "-" },
      { label: "Binatang 2 (AM)", before: (item ? item.binatang2 : "-") || "-", after: b2 || "-" },
      { label: "Kategori Satwa", before: (item ? item.kategori : "-") || "-", after: kategori },
      { label: "Evaluasi Aktivitas", before: (item ? item.aktivitas : "-") || "-", after: aktivitas },
      { label: "Catatan", before: (item ? item.catatan : "-") || "-", after: catatan }
    ],
    newData: {
      binatang1: b1,
      binatang2: b2,
      kategori: kategori,
      aktivitas: aktivitas,
      catatan: catatan,
      kolomAP: (kategori !== "(Blanks) / Tidak Ada" ? kategori : "")
    }
  };

  if (typeof stagingManager !== "undefined") {
    stagingManager.addPendingChange(changeObj);
  }
  closeModalSatwaALAM();
}


// =========================================================================
// 2. MODAL KHUSUS TAB MANAJEMEN ASET (KOLOM E s.d. KOLOM Z)
// =========================================================================

// Dapatkan tanggal hari ini dalam format MM/DD/YYYY sesuai format Spreadsheet
function getEZTodayFormatted() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

// Buka modal manajemen data Kolom E s.d. Z untuk menara tertentu
function openModalKolomEZ(no) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;

  // Isi data header
  const elNo = document.getElementById("ezTowerNo");
  if (elNo) elNo.value = item.no;

  const elNamaHidden = document.getElementById("ezTowerNamaHidden");
  if (elNamaHidden) elNamaHidden.value = item.nama;

  const elName = document.getElementById("ezModalTowerName");
  if (elName) elName.innerText = item.nama;

  const elJalur = document.getElementById("ezModalJalur");
  if (elJalur) elJalur.innerText = item.jalur;

  const elUltg = document.getElementById("ezModalUltg");
  if (elUltg) elUltg.innerText = item.ultg;

  // Helper set field checkbox & tanggal
  const setField = (chkId, dateId, isChecked, dateVal) => {
    const chk = document.getElementById(chkId);
    const dateInput = document.getElementById(dateId);
    if (chk) chk.checked = Boolean(isChecked);
    if (dateInput) dateInput.value = dateVal || "";
  };

  // 1. TOP SKOR (Kolom E, F, G, H)
  setField("ezTopSkorL1", "ezTopSkorL1Date", item.ezTopSkorL1, item.ezTopSkorL1Date);
  setField("ezTopSkorL2", "ezTopSkorL2Date", item.ezTopSkorL2, item.ezTopSkorL2Date);

  // 2. IRONMAN (Kolom I, J, K, L)
  setField("ezIronmanL1", "ezIronmanL1Date", item.ezIronmanL1, item.ezIronmanL1Date);
  setField("ezIronmanL2", "ezIronmanL2Date", item.ezIronmanL2, item.ezIronmanL2Date);

  // 3. BOLUVES (Kolom M, N)
  setField("ezBoluves", "ezBoluvesDate", item.ezBoluves, item.ezBoluvesDate);

  // 4. JARING (Kolom O, P)
  setField("ezJaring", "ezJaringDate", item.ezJaring, item.ezJaringDate);

  // 5. PELAKOR (Kolom Q, R)
  setField("ezPelakor", "ezPelakorDate", item.ezPelakor, item.ezPelakorDate);

  // 6. KAWAT SILET (Kolom S, T)
  setField("ezKawatSilet", "ezKawatSiletDate", item.ezKawatSilet, item.ezKawatSiletDate);

  // 7. ASB (Kolom U, V)
  setField("ezAsb", "ezAsbDate", item.ezAsb, item.ezAsbDate);

  // 8. PEMVES (Kolom W, X)
  setField("ezPemves", "ezPemvesDate", item.ezPemves, item.ezPemvesDate);

  // 9. TOGAR ABES (Kolom Y, Z)
  setField("ezTogarAbes", "ezTogarAbesDate", item.ezTogarAbes, item.ezTogarAbesDate);

  // Perbarui preview ringkasan
  updateEZLivePreview();

  const modal = document.getElementById("modalKolomEZ");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  if (window.lucide) window.lucide.createIcons();
}

// Tutup modal Kolom E s.d. Z
function closeModalKolomEZ() {
  const modal = document.getElementById("modalKolomEZ");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Handler saat checkbox perangkat berubah
function onEZCheckboxChange(chkId, dateId) {
  const chk = document.getElementById(chkId);
  const dateInput = document.getElementById(dateId);
  if (!chk || !dateInput) return;

  if (chk.checked) {
    if (!dateInput.value.trim()) {
      dateInput.value = getEZTodayFormatted();
    }
  } else {
    // Jika dicentang batal, kosongkan tanggal
    dateInput.value = "";
  }
  updateEZLivePreview();
}

// Set tanggal input menjadi hari ini dan centang checkboxnya
function setEZToday(dateId, chkId) {
  const dateInput = document.getElementById(dateId);
  const chk = document.getElementById(chkId);
  if (dateInput) dateInput.value = getEZTodayFormatted();
  if (chk) chk.checked = true;
  updateEZLivePreview();
}

// Set tanggal hari ini ke seluruh perangkat yang tercentang
function setAllEZToday() {
  const today = getEZTodayFormatted();
  const pairs = [
    ["ezTopSkorL1", "ezTopSkorL1Date"],
    ["ezTopSkorL2", "ezTopSkorL2Date"],
    ["ezIronmanL1", "ezIronmanL1Date"],
    ["ezIronmanL2", "ezIronmanL2Date"],
    ["ezBoluves", "ezBoluvesDate"],
    ["ezJaring", "ezJaringDate"],
    ["ezPelakor", "ezPelakorDate"],
    ["ezKawatSilet", "ezKawatSiletDate"],
    ["ezAsb", "ezAsbDate"],
    ["ezPemves", "ezPemvesDate"],
    ["ezTogarAbes", "ezTogarAbesDate"]
  ];

  pairs.forEach(([chkId, dateId]) => {
    const chk = document.getElementById(chkId);
    const dateInput = document.getElementById(dateId);
    if (chk && dateInput && chk.checked) {
      dateInput.value = today;
    }
  });
  updateEZLivePreview();
}

// Reset semua centang dan tanggal Kolom E s.d. Z
function resetAllEZ() {
  if (!confirm("Apakah Anda yakin ingin mereset seluruh data Kolom E s.d. Z untuk menara ini?")) return;

  const pairs = [
    ["ezTopSkorL1", "ezTopSkorL1Date"],
    ["ezTopSkorL2", "ezTopSkorL2Date"],
    ["ezIronmanL1", "ezIronmanL1Date"],
    ["ezIronmanL2", "ezIronmanL2Date"],
    ["ezBoluves", "ezBoluvesDate"],
    ["ezJaring", "ezJaringDate"],
    ["ezPelakor", "ezPelakorDate"],
    ["ezKawatSilet", "ezKawatSiletDate"],
    ["ezAsb", "ezAsbDate"],
    ["ezPemves", "ezPemvesDate"],
    ["ezTogarAbes", "ezTogarAbesDate"]
  ];

  pairs.forEach(([chkId, dateId]) => {
    const chk = document.getElementById(chkId);
    const dateInput = document.getElementById(dateId);
    if (chk) chk.checked = false;
    if (dateInput) dateInput.value = "";
  });
  updateEZLivePreview();
}

// Perbarui badge counter & ringkasan hasil secara live
function updateEZLivePreview() {
  const getChecked = id => {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  };

  const activeNames = [];
  let totalChecked = 0;

  if (getChecked("ezTopSkorL1") || getChecked("ezTopSkorL2")) {
    activeNames.push("TOP SKOR");
    if (getChecked("ezTopSkorL1")) totalChecked++;
    if (getChecked("ezTopSkorL2")) totalChecked++;
  }
  if (getChecked("ezIronmanL1") || getChecked("ezIronmanL2")) {
    activeNames.push("IRONMAN");
    if (getChecked("ezIronmanL1")) totalChecked++;
    if (getChecked("ezIronmanL2")) totalChecked++;
  }
  if (getChecked("ezBoluves")) { activeNames.push("BOLUVES"); totalChecked++; }
  if (getChecked("ezJaring")) { activeNames.push("JARING"); totalChecked++; }
  if (getChecked("ezPelakor")) { activeNames.push("PELAKOR"); totalChecked++; }
  if (getChecked("ezKawatSilet")) { activeNames.push("KAWAT SILET"); totalChecked++; }
  if (getChecked("ezAsb")) { activeNames.push("ASB"); totalChecked++; }
  if (getChecked("ezPemves")) { activeNames.push("PEMVES"); totalChecked++; }
  if (getChecked("ezTogarAbes")) { activeNames.push("TOGAR ABES"); totalChecked++; }

  // Update counter pill
  const elCounter = document.getElementById("ezCounterBadge");
  if (elCounter) {
    elCounter.innerText = `${totalChecked} Item Terpasang (${activeNames.length} Jenis)`;
    if (totalChecked > 0) {
      elCounter.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
    } else {
      elCounter.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700";
    }
  }

  // Update proteksi badge
  const elProt = document.getElementById("ezProteksiBadge");
  if (elProt) {
    if (activeNames.length > 0) {
      elProt.innerText = "TERPASANG";
      elProt.className = "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white";
    } else {
      elProt.innerText = "BELUM TERPASANG";
      elProt.className = "px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300";
    }
  }

  // Update preview Kolom AJ
  const elPreviewAJ = document.getElementById("ezPreviewKolomAJ");
  if (elPreviewAJ) {
    elPreviewAJ.innerText = activeNames.length > 0 ? activeNames.join(", ") : "TIDAK TERPASANG";
  }
}

// Simpan pembaruan Kolom E s.d. Z ke Spreadsheet
async function submitKolomEZUpdate(event) {
  event.preventDefault();

  const btnSubmit = document.getElementById("btnSubmitKolomEZ");
  const originalHtml = btnSubmit.innerHTML;
  btnSubmit.innerHTML = `<span class="inline-block animate-spin mr-1">⌛</span> Menyimpan ke Kolom E–Z Spreadsheet...`;
  btnSubmit.disabled = true;

  const no = parseInt(document.getElementById("ezTowerNo").value, 10);
  const towerName = document.getElementById("ezTowerNamaHidden").value;

  const getChk = id => {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  };
  const getVal = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const payload = {
    action: "updateKolomEZ",
    hasKolomEZ: true,
    nama: towerName,
    // 22 Kolom (E sampai Z)
    topSkorL1: getChk("ezTopSkorL1"),
    topSkorL1Date: getVal("ezTopSkorL1Date"),
    topSkorL2: getChk("ezTopSkorL2"),
    topSkorL2Date: getVal("ezTopSkorL2Date"),
    ironmanL1: getChk("ezIronmanL1"),
    ironmanL1Date: getVal("ezIronmanL1Date"),
    ironmanL2: getChk("ezIronmanL2"),
    ironmanL2Date: getVal("ezIronmanL2Date"),
    ezBoluves: getChk("ezBoluves"),
    boluvesDate: getVal("ezBoluvesDate"),
    ezJaring: getChk("ezJaring"),
    jaringDate: getVal("ezJaringDate"),
    ezPelakor: getChk("ezPelakor"),
    pelakorDate: getVal("ezPelakorDate"),
    ezKawatSilet: getChk("ezKawatSilet"),
    kawatSiletDate: getVal("ezKawatSiletDate"),
    ezAsb: getChk("ezAsb"),
    asbDate: getVal("ezAsbDate"),
    ezPemves: getChk("ezPemves"),
    pemvesDate: getVal("ezPemvesDate"),
    ezTogarAbes: getChk("ezTogarAbes"),
    togarAbesDate: getVal("ezTogarAbesDate")
  };

  const item = towerData.find(t => t.no === no);
  const ultg = item ? item.ultg : "-";
  const jalur = item ? item.jalur : "-";

  // Hitung ulang Kolom AJ dan Status Proteksi
  const activeDevices = [];
  if (payload.topSkorL1 || payload.topSkorL2) activeDevices.push("TOP SKOR");
  if (payload.ironmanL1 || payload.ironmanL2) activeDevices.push("IRONMAN");
  if (payload.ezBoluves) activeDevices.push("BOLUVES");
  if (payload.ezJaring) activeDevices.push("JARING");
  if (payload.ezPelakor) activeDevices.push("PELAKOR");
  if (payload.ezKawatSilet) activeDevices.push("KAWAT SILET");
  if (payload.ezAsb) activeDevices.push("ASB");
  if (payload.ezPemves) activeDevices.push("PEMVES");
  if (payload.ezTogarAbes) activeDevices.push("TOGAR ABES");

  const newProteksi = activeDevices.length > 0 ? "TERPASANG" : "BELUM TERPASANG";
  const newPerangkat = activeDevices.length > 0 ? activeDevices.join(", ") : "-";

  const changeObj = {
    type: "manajemen",
    typeLabel: "Manajemen Asset (Kolom E s.d. Z)",
    towerNo: no,
    towerName: towerName,
    ultg: ultg,
    jalur: jalur,
    payload: payload,
    changesSummary: [
      { label: "Status Proteksi", before: (item ? item.proteksi : "BELUM TERPASANG"), after: newProteksi },
      { label: "Perangkat Terpasang", before: (item ? item.perangkat : "-"), after: newPerangkat }
    ],
    newData: {
      ezTopSkorL1: payload.topSkorL1,
      ezTopSkorL1Date: payload.topSkorL1Date,
      ezTopSkorL2: payload.topSkorL2,
      ezTopSkorL2Date: payload.topSkorL2Date,
      ezIronmanL1: payload.ironmanL1,
      ezIronmanL1Date: payload.ironmanL1Date,
      ezIronmanL2: payload.ironmanL2,
      ezIronmanL2Date: payload.ironmanL2Date,
      ezBoluves: payload.ezBoluves,
      ezBoluvesDate: payload.boluvesDate,
      ezJaring: payload.ezJaring,
      ezJaringDate: payload.jaringDate,
      ezPelakor: payload.ezPelakor,
      ezPelakorDate: payload.pelakorDate,
      ezKawatSilet: payload.ezKawatSilet,
      ezKawatSiletDate: payload.kawatSiletDate,
      ezAsb: payload.ezAsb,
      ezAsbDate: payload.asbDate,
      ezPemves: payload.ezPemves,
      ezPemvesDate: payload.pemvesDate,
      ezTogarAbes: payload.ezTogarAbes,
      ezTogarAbesDate: payload.togarAbesDate,
      proteksi: newProteksi,
      perangkat: newPerangkat
    }
  };

  if (typeof stagingManager !== "undefined") {
    stagingManager.addPendingChange(changeObj);
  }
  closeModalKolomEZ();
}

// Router cerdas: memanggil modal yang sesuai dengan tab aktif saat ini
function openEditModal(no) {
  if (typeof currentActiveTab !== "undefined" && currentActiveTab === "satwa") {
    openModalSatwaALAM(no);
  } else {
    openModalKolomEZ(no);
  }
}

// Buka dialog untuk menambah menara baru
function openAddNewModal() {
  const newName = prompt("Masukkan Nama Tower Baru (misal: TOWER SUTT 150kV KRSAN - NRING #0023):");
  if (!newName) return;
  const currentUltg = (document.getElementById(`filterUltg_${currentActiveTab}`) && document.getElementById(`filterUltg_${currentActiveTab}`).value) ||
                      (document.getElementById("filterUltg_manajemen") && document.getElementById("filterUltg_manajemen").value) ||
                      (document.getElementById("filterUltg") && document.getElementById("filterUltg").value) || "ULTG BETUNG";
  const availableJalurs = typeof getJalursForUltg === "function" ? getJalursForUltg(currentUltg) : [];
  const defaultJalur = availableJalurs[0] || "TRS 150kV TLKLP - BTUNG";

  const newTower = {
    no: towerData.length + 1,
    nama: newName,
    jalur: defaultJalur,
    ultg: currentUltg,
    binatang1: "",
    binatang2: "",
    kategori: "(Blanks) / Tidak Ada",
    proteksi: "BELUM TERPASANG",
    perangkat: "-",
    aktivitas: "Sesuai",
    catatan: "-",
    tapak: "Tidak Diperlukan",
    rekomendasi: "Pembersihan Rutin"
  };

  towerData.unshift(newTower);
  applyFilters();
  openEditModal(newTower.no);
}
