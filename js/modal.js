/**
 * PENGELOLAAN MODAL TAMBAH & EDIT DATA MENARA
 * SINKRONISASI REALTIME KE GOOGLE SHEETS
 */

// Buka modal edit data
function openEditModal(no) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;

  document.getElementById("editRowNumber").value = item.no;
  document.getElementById("editTowerName").value = item.nama;
  document.getElementById("editUltg").value = item.ultg;
  updateEditJalurOptions(item.jalur);

  // Set nilai Kolom AL (Binatang 1) dan Kolom AM (Binatang 2)
  const b1 = item.binatang1 || (item.kategori && item.kategori !== "(Blanks) / Tidak Ada" ? item.kategori.split(",")[0].trim() : "");
  const b2 = item.binatang2 || (item.kategori && item.kategori.includes(",") ? item.kategori.split(",")[1].trim() : "");
  if (document.getElementById("editBinatang1")) document.getElementById("editBinatang1").value = b1;
  if (document.getElementById("editBinatang2")) document.getElementById("editBinatang2").value = b2;

  let aktVal = item.aktivitas || "Sesuai";
  if (aktVal === "Tidak Ada Aktivitas" || aktVal === "Terlihat Aktivitas Ringan" || aktVal === "Sesuai") {
    aktVal = "Sesuai";
  } else {
    aktVal = "Tidak Sesuai";
  }
  if (document.getElementById("editAktivitas")) document.getElementById("editAktivitas").value = aktVal;
  if (document.getElementById("editCatatan")) document.getElementById("editCatatan").value = item.catatan !== "-" ? (item.catatan || "") : "";
  if (document.getElementById("editTapak")) document.getElementById("editTapak").value = item.tapak || "Tidak Diperlukan";
  if (document.getElementById("editRekomendasi")) document.getElementById("editRekomendasi").value = item.rekomendasi !== "-" ? (item.rekomendasi || "") : "";

  if (document.getElementById("editProteksi")) setProteksiStatus(item.proteksi || "BELUM TERPASANG");

  const checkboxes = document.querySelectorAll("input[name='deviceCheck']");
  if (checkboxes && checkboxes.length > 0) {
    checkboxes.forEach(cb => {
      cb.checked = item.perangkat && item.perangkat.includes(cb.value);
    });
  }

  const modal = document.getElementById("editModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

// Tutup modal edit
function closeEditModal() {
  const modal = document.getElementById("editModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Toggle tombol status proteksi di modal
function setProteksiStatus(status) {
  const input = document.getElementById("editProteksi");
  if (input) input.value = status;

  const btnPasang = document.getElementById("btnTogglePasang");
  const btnBelum = document.getElementById("btnToggleBelum");

  if (status === "TERPASANG") {
    if (btnPasang) btnPasang.className = "flex-1 py-2 rounded-lg font-bold bg-[#0284c7] text-white transition";
    if (btnBelum) btnBelum.className = "flex-1 py-2 rounded-lg font-bold border border-slate-200 text-slate-600 bg-slate-50 transition";
  } else {
    if (btnPasang) btnPasang.className = "flex-1 py-2 rounded-lg font-bold border border-slate-200 text-slate-600 bg-slate-50 transition";
    if (btnBelum) btnBelum.className = "flex-1 py-2 rounded-lg font-bold bg-[#1e293b] text-white transition";
  }
}

// Update pilihan dropdown jalur pada modal edit sesuai ULTG terpilih
function updateEditJalurOptions(selectedJalur = "") {
  const editUltg = document.getElementById("editUltg");
  const editJalur = document.getElementById("editJalur");
  if (!editUltg || !editJalur) return;

  const ultgVal = editUltg.value;
  const jalurs = getJalursForUltg(ultgVal);

  let optionsHtml = `<option value="">-- Pilih Jalur SUTT/SUTET --</option>`;
  jalurs.forEach(j => {
    optionsHtml += `<option value="${j}">${j}</option>`;
  });

  if (selectedJalur && !jalurs.includes(selectedJalur)) {
    optionsHtml += `<option value="${selectedJalur}">${selectedJalur}</option>`;
  }

  editJalur.innerHTML = optionsHtml;
  if (selectedJalur) {
    editJalur.value = selectedJalur;
  }
}

function onEditUltgChange() {
  updateEditJalurOptions("");
}

// Simpan perubahan ke Google Sheets TRS_PLM
async function submitTowerUpdate(event) {
  event.preventDefault();

  const btnSubmit = document.getElementById("btnSubmitEdit");
  const originalText = btnSubmit.innerHTML;
  btnSubmit.innerHTML = `<span class="inline-block animate-spin mr-1">⌛</span> Menyimpan ke Spreadsheet...`;
  btnSubmit.disabled = true;

  const no = parseInt(document.getElementById("editRowNumber").value, 10);
  const towerName = document.getElementById("editTowerName").value;
  const ultg = document.getElementById("editUltg").value;
  const jalur = document.getElementById("editJalur").value;

  // Baca input khusus Kolom AL (Binatang 1) dan Kolom AM (Binatang 2)
  const b1 = (document.getElementById("editBinatang1") ? document.getElementById("editBinatang1").value : "").trim();
  const b2 = (document.getElementById("editBinatang2") ? document.getElementById("editBinatang2").value : "").trim();

  let kategori = "(Blanks) / Tidak Ada";
  if (b1 && b2) {
    kategori = `${b1}, ${b2}`;
  } else if (b1) {
    kategori = b1;
  } else if (b2) {
    kategori = b2;
  }

  const existingItem = towerData.find(t => t.no === no);
  const proteksi = (document.getElementById("editProteksi") && document.getElementById("editProteksi").value) || (existingItem ? existingItem.proteksi : "BELUM TERPASANG");
  const aktivitas = (document.getElementById("editAktivitas") && document.getElementById("editAktivitas").value) || (existingItem ? existingItem.aktivitas : "Sesuai");
  const catatan = (document.getElementById("editCatatan") && document.getElementById("editCatatan").value) || (existingItem ? existingItem.catatan : "-");
  const tapak = (document.getElementById("editTapak") && document.getElementById("editTapak").value) || (existingItem ? existingItem.tapak : "Tidak Diperlukan");
  const rekomendasi = (document.getElementById("editRekomendasi") && document.getElementById("editRekomendasi").value) || (existingItem ? existingItem.rekomendasi : "-");

  let perangkat = existingItem ? (existingItem.perangkat || "-") : "-";
  const checkedBoxes = document.querySelectorAll("input[name='deviceCheck']:checked");
  if (checkedBoxes && checkedBoxes.length > 0) {
    const selectedDevices = [];
    checkedBoxes.forEach(cb => selectedDevices.push(cb.value));
    perangkat = selectedDevices.join(", ");
  }

  const payload = {
    action: "updateTower",
    nama: towerName,
    ultg: ultg,
    jalur: jalur,
    binatang1: b1,
    binatang2: b2,
    kategori: kategori,
    proteksi: proteksi,
    perangkat: perangkat,
    aktivitas: aktivitas,
    catatan: catatan,
    tapak: tapak,
    rekomendasi: rekomendasi
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Perbarui data di memori
    const item = towerData.find(t => t.no === no);
    if (item) {
      item.nama = towerName;
      item.ultg = ultg;
      item.jalur = jalur;
      item.binatang1 = b1;
      item.binatang2 = b2;
      item.kategori = kategori;
      item.proteksi = proteksi;
      item.perangkat = perangkat;
      item.aktivitas = aktivitas;
      item.catatan = catatan;
      item.tapak = tapak;
      item.rekomendasi = rekomendasi;
      item.rencanaTindakLanjut = rekomendasi;
    }

    const badge = document.getElementById("syncBadge");
    if (badge) {
      badge.classList.remove("hidden");

      badge.classList.add("flex");
      setTimeout(() => badge.classList.add("hidden"), 4000);
    }

    applyFilters();
    closeEditModal();
    alert(`✅ Sukses! Data "${towerName}" telah tersimpan ke Google Sheets TRS_PLM.`);
  } catch (err) {
    console.error("Sinkronisasi gagal:", err);
    alert("⚠️ Gagal terhubung ke Google Apps Script: " + err.message);
  } finally {
    btnSubmit.innerHTML = originalText;
    btnSubmit.disabled = false;
  }
}

// Buka dialog untuk menambah menara baru
function openAddNewModal() {
  const newName = prompt("Masukkan Nama Tower Baru (misal: TOWER SUTT 150kV KRSAN - NRING #0023):");
  if (!newName) return;
  const currentUltg = (document.getElementById("filterUltg") && document.getElementById("filterUltg").value) || "ULTG BETUNG";
  const availableJalurs = getJalursForUltg(currentUltg);
  const defaultJalur = availableJalurs[0] || "TRS 150kV TLKLP - BTUNG";

  const newTower = {
    no: towerData.length + 1,
    nama: newName,
    jalur: defaultJalur,
    ultg: currentUltg,
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
