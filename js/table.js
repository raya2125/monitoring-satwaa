/**
 * RENDER TABEL DATA, PAGINASI, AKSI INLINE & EKSPOR CSV
 */

let currentPage = 1;
let pageSize = 25;

// Render baris tabel data
function renderTable() {
  const tbody = document.getElementById("towerTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const pageSlice = filteredData.slice(startIndex, endIndex);

  // Update info range data di atas tabel
  const elRange = document.getElementById("tableRangeText");
  if (elRange) elRange.innerText = filteredData.length > 0 ? `${startIndex + 1} - ${endIndex}` : "0";

  const elFiltered = document.getElementById("tableFilteredTotal");
  if (elFiltered) elFiltered.innerText = filteredData.length.toLocaleString("id-ID");

  const elTotal = document.getElementById("tableTotalData");
  if (elTotal) elTotal.innerText = towerData.length.toLocaleString("id-ID");

  const elSummary = document.getElementById("paginationSummary");
  if (elSummary) {
    elSummary.innerText = `Menampilkan ${startIndex + 1} - ${endIndex} dari ${filteredData.length.toLocaleString("id-ID")} menara`;
  }

  if (pageSlice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12 text-slate-400 font-medium">Tidak ada data menara yang cocok dengan filter yang dipilih.</td></tr>`;
    renderPagination();
    return;
  }

  pageSlice.forEach((item, index) => {
    // Badge Tampilan Nama Hewan (Statis tanpa dropdown)
    let hewanBadge = `<span class="text-slate-400 font-normal">-</span>`;
    if (item.kategori && item.kategori !== "(Blanks) / Tidak Ada" && item.kategori !== "-") {
      if (item.kategori === "BURUNG") {
        hewanBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200"><span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>BURUNG</span>`;
      } else if (item.kategori === "KERA") {
        hewanBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>KERA</span>`;
      } else if (item.kategori === "ULAR") {
        hewanBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>ULAR</span>`;
      } else {
        hewanBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200"><span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>${item.kategori}</span>`;
      }
    }

    const protBadge = item.proteksi === "TERPASANG" 
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Terpasang</span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Belum Terpasang</span>`;

    const isSesuai = item.aktivitas === "Sesuai";
    const actText = isSesuai
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Sesuai</span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Tidak Sesuai</span>`;

    const row = document.createElement("tr");
    row.className = "hover:bg-slate-50/80 transition-colors";
    row.innerHTML = `
      <td class="py-3 px-3.5 text-center font-medium text-slate-500">${startIndex + index + 1}</td>
      <td class="py-3 px-3.5">
        <div class="font-bold text-slate-800">${item.nama}</div>
        <div class="text-[11px] text-slate-400 mt-0.5">${item.jalur}</div>
      </td>
      <td class="py-3 px-3.5">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">${item.ultg}</span>
      </td>
      <td class="py-3 px-3.5">${hewanBadge}</td>
      <td class="py-3 px-3.5">
        ${item.perangkat && item.perangkat !== "-" && item.perangkat !== "TIDAK TERPASANG"
          ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${item.perangkat}</span>`
          : `<span class="text-slate-400 font-normal">-</span>`
        }
      </td>
      <td class="py-3 px-3.5 text-[11px]">${actText}</td>
      <td class="py-3 px-3.5 text-[11px]">
        ${item.rekomendasi && item.rekomendasi !== "-"
          ? `<span class="text-sky-700 font-semibold">${item.rekomendasi}</span>`
          : `<span class="text-slate-400">-</span>`
        }
      </td>
      <td class="py-3 px-3.5 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="openEditModal(${item.no})" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" title="Lihat Detail"><i data-lucide="eye" class="w-3.5 h-3.5"></i></button>
          <button onclick="openEditModal(${item.no})" class="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition" title="Edit Data"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
          <button onclick="deleteRow(${item.no})" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination();
  if (window.lucide) window.lucide.createIcons();
}

// Ubah baris per halaman
function changePageSize(newVal) {
  pageSize = parseInt(newVal, 10) || 25;
  currentPage = 1;
  renderTable();
}

// Kontrol paginasi tabel
function renderPagination() {
  const controls = document.getElementById("paginationControls");
  if (!controls) return;
  controls.innerHTML = "";
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Tombol Prev
  const prevBtn = document.createElement("button");
  prevBtn.className = `px-2.5 py-1 rounded border border-slate-200 text-xs ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-100 text-slate-700"}`;
  prevBtn.innerHTML = `&laquo; Prev`;
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
  controls.appendChild(prevBtn);

  let startP = Math.max(1, currentPage - 2);
  let endP = Math.min(totalPages, startP + 4);
  if (endP - startP < 4) startP = Math.max(1, endP - 4);

  for (let p = startP; p <= endP; p++) {
    const pBtn = document.createElement("button");
    pBtn.className = `px-2.5 py-1 rounded border text-xs font-semibold ${p === currentPage ? "bg-sky-600 text-white border-sky-600 shadow-sm" : "border-slate-200 hover:bg-slate-100 text-slate-600"}`;
    pBtn.innerText = p;
    pBtn.onclick = () => { currentPage = p; renderTable(); };
    controls.appendChild(pBtn);
  }

  // Tombol Next
  const nextBtn = document.createElement("button");
  nextBtn.className = `px-2.5 py-1 rounded border border-slate-200 text-xs ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-100 text-slate-700"}`;
  nextBtn.innerHTML = `Next &raquo;`;
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderTable(); } };
  controls.appendChild(nextBtn);
}

// Update kategori inline dari tabel
async function inlineUpdateKategori(no, newKategori) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;
  item.kategori = newKategori;

  // Petakan ke Kolom AL (Binatang 1) dan Kolom AM (Binatang 2)
  let b1 = "";
  let b2 = "";
  if (newKategori && newKategori !== "(Blanks) / Tidak Ada") {
    const parts = newKategori.split(",").map(s => s.trim());
    b1 = parts[0] || "";
    b2 = parts[1] || "";
  }
  item.binatang1 = b1;
  item.binatang2 = b2;

  updateMetrics(filteredData);
  renderTable();

  try {
    const payload = {
      action: "updateTower",
      nama: item.nama,
      ultg: item.ultg,
      jalur: item.jalur,
      binatang1: b1,
      binatang2: b2,
      kategori: newKategori,
      proteksi: item.proteksi,
      perangkat: item.perangkat,
      aktivitas: item.aktivitas,
      catatan: item.catatan,
      tapak: item.tapak,
      rekomendasi: item.rekomendasi
    };
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const badge = document.getElementById("syncBadge");
    if (badge) {
      badge.classList.remove("hidden");
      badge.classList.add("flex");
      setTimeout(() => badge.classList.add("hidden"), 3000);
    }
  } catch (e) {
    console.error("Gagal sinkron kategori inline:", e);
  }
}

// Toggle proteksi inline dari tabel
async function inlineToggleProteksi(no) {
  const item = towerData.find(t => t.no === no);
  if (!item) return;
  item.proteksi = item.proteksi === "TERPASANG" ? "BELUM TERPASANG" : "TERPASANG";
  updateMetrics(filteredData);
  renderTable();

  try {
    const payload = {
      action: "updateTower",
      nama: item.nama,
      ultg: item.ultg,
      jalur: item.jalur,
      binatang1: item.binatang1,
      binatang2: item.binatang2,
      kategori: item.kategori,
      proteksi: item.proteksi,
      perangkat: item.perangkat,
      aktivitas: item.aktivitas,
      catatan: item.catatan,
      tapak: item.tapak,
      rekomendasi: item.rekomendasi
    };
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const badge = document.getElementById("syncBadge");
    if (badge) {
      badge.classList.remove("hidden");
      badge.classList.add("flex");
      setTimeout(() => badge.classList.add("hidden"), 3000);
    }
  } catch (e) {
    console.error("Gagal sinkron proteksi inline:", e);
  }
}

// Hapus baris data
function deleteRow(no) {
  if (confirm(`Yakin ingin menghapus menara dengan ID #${no}?`)) {
    towerData = towerData.filter(t => t.no !== no);
    applyFilters();
  }
}

// Ekspor data tabel saat ini ke CSV
function exportCSV() {
  if (!filteredData || filteredData.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const headers = ["No", "Nama Menara", "Jalur Transmisi", "ULTG", "Binatang 1 (AL)", "Binatang 2 (AM)", "Kategori AP", "Status Proteksi", "Perangkat", "Aktivitas", "Rencana Tindak Lanjut (Kolom AQ)", "Pembersihan Tapak (Kolom AR)", "Catatan"];
  const rows = filteredData.map((item, idx) => [
    idx + 1,
    `"${(item.nama || "").replace(/"/g, '""')}"`,
    `"${(item.jalur || "").replace(/"/g, '""')}"`,
    `"${(item.ultg || "").replace(/"/g, '""')}"`,
    `"${(item.binatang1 || "").replace(/"/g, '""')}"`,
    `"${(item.binatang2 || "").replace(/"/g, '""')}"`,
    `"${(item.kategori || "").replace(/"/g, '""')}"`,
    `"${(item.proteksi || "").replace(/"/g, '""')}"`,
    `"${(item.perangkat || "").replace(/"/g, '""')}"`,
    `"${(item.aktivitas || "").replace(/"/g, '""')}"`,
    `"${(item.rekomendasi || "").replace(/"/g, '""')}"`,
    `"${(item.tapak || "").replace(/"/g, '""')}"`,
    `"${(item.catatan || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
    headers.join(",") + "\n" + 
    rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Data_Menara_Satwa_UPT_Palembang_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
