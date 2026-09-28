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

  // Update judul tabel dan badge fokus sesuai tab aktif
  const elTableTitle = document.getElementById("tableMainTitle");
  const elTableBadge = document.getElementById("tableFocusBadge");
  const isSatwaTab = typeof currentActiveTab !== "undefined" && currentActiveTab === "satwa";

  if (elTableTitle) {
    if (isSatwaTab) {
      elTableTitle.innerText = "Monitoring & Input Kerawanan Satwa (Kolom AL & AM)";
      if (elTableBadge) {
        elTableBadge.className = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200";
        elTableBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>Fokus: Kerawanan Satwa (Kolom AL & AM)`;
      }
    } else {
      elTableTitle.innerText = "Manajemen Asset Tower & Status Proteksi (Kolom E s.d. Z)";
      if (elTableBadge) {
        elTableBadge.className = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200";
        elTableBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Fokus: Pemasangan Proteksi (Kolom E s.d. Z)`;
      }
    }
  }

  pageSlice.forEach((item, index) => {
    // 1. Render Tampilan Nama Hewan (Kolom AL & AM)
    let hewanBadge = `<span class="text-slate-400 font-normal">-</span>`;
    const hasHewan = item.kategori && item.kategori !== "(Blanks) / Tidak Ada" && item.kategori !== "-";

    if (hasHewan) {
      let badgeStyle = "bg-purple-50 text-purple-700 border-purple-200 dot-purple-500";
      if (item.kategori === "BURUNG") badgeStyle = "bg-sky-50 text-sky-700 border-sky-200 dot-sky-500";
      else if (item.kategori === "KERA") badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dot-amber-500";
      else if (item.kategori === "ULAR") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500";

      const dotBg = badgeStyle.split("dot-")[1] || "sky-500";
      const cleanClass = badgeStyle.split(" dot-")[0];

      if (isSatwaTab) {
        hewanBadge = `
          <button onclick="openModalSatwaALAM(${item.no})" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cleanClass} border hover:opacity-80 transition cursor-pointer" title="Klik untuk edit data Satwa Kolom AL & AM">
            <span class="w-1.5 h-1.5 rounded-full bg-${dotBg}"></span>${item.kategori}
          </button>
        `;
      } else {
        hewanBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cleanClass} border">
            <span class="w-1.5 h-1.5 rounded-full bg-${dotBg}"></span>${item.kategori}
          </span>
        `;
      }
    } else if (isSatwaTab) {
      hewanBadge = `
        <button onclick="openModalSatwaALAM(${item.no})" class="group inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-700 transition" title="Input Satwa Kolom AL & AM">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600"></i>
          <span class="group-hover:underline italic">+ Isi Satwa (AL/AM)</span>
        </button>
      `;
    }

    const isSesuai = item.aktivitas === "Sesuai";
    const actText = isSesuai
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Sesuai</span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Tidak Sesuai</span>`;

    // 2. Render Kolom E s.d. Z (Perangkat Terpasang Eksisting & Tanggal Pasang)
    const ezInstalled = typeof getInstalledDevicesFromEZ === "function" ? getInstalledDevicesFromEZ(item) : [];
    let perangkatHtml = "";

    if (ezInstalled.length > 0) {
      if (!isSatwaTab) {
        // Mode Tab Manajemen Asset: tombol interaktif buka Kolom E-Z
        perangkatHtml = `
          <button onclick="openModalKolomEZ(${item.no})" class="text-left group flex flex-col gap-1 cursor-pointer" title="Klik untuk edit data Kolom E s.d. Z">
            <div class="flex items-center gap-1 flex-wrap">
              ${ezInstalled.slice(0, 3).map(d => `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:border-emerald-400 transition" title="Terpasang: ${d.name} (${d.col}) ${d.date ? 'pada ' + d.date : ''}">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${d.name}
                </span>
              `).join("")}
              ${ezInstalled.length > 3 ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">+${ezInstalled.length - 3}</span>` : ""}
            </div>
            ${ezInstalled[0] && ezInstalled[0].date ? `<div class="text-[10px] text-slate-400 group-hover:text-emerald-700 transition">Tgl: ${ezInstalled[0].date}</div>` : ""}
          </button>
        `;
      } else {
        // Mode Tab Satwa: tampilan informatif
        perangkatHtml = `
          <div class="flex items-center gap-1 flex-wrap">
            ${ezInstalled.slice(0, 2).map(d => `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                ${d.name}
              </span>
            `).join("")}
            ${ezInstalled.length > 2 ? `<span class="text-[10px] text-slate-400 font-bold">+${ezInstalled.length - 2}</span>` : ""}
          </div>
        `;
      }
    } else if (item.perangkat && item.perangkat !== "-" && item.perangkat !== "TIDAK TERPASANG") {
      if (!isSatwaTab) {
        perangkatHtml = `
          <button onclick="openModalKolomEZ(${item.no})" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer" title="Klik untuk atur tanggal di Kolom E-Z">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${item.perangkat}
          </button>
        `;
      } else {
        perangkatHtml = `<span class="text-slate-600 text-xs font-medium">${item.perangkat}</span>`;
      }
    } else {
      if (!isSatwaTab) {
        perangkatHtml = `
          <button onclick="openModalKolomEZ(${item.no})" class="group inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-700 transition" title="Isi status & tanggal pemasangan Kolom E s.d. Z">
            <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600"></i>
            <span class="group-hover:underline italic">+ Isi Kolom E–Z</span>
          </button>
        `;
      } else {
        perangkatHtml = `<span class="text-slate-400 font-normal">-</span>`;
      }
    }

    // 3. Tombol Aksi spesifik per Tab
    let primaryActionBtn = "";
    if (isSatwaTab) {
      primaryActionBtn = `
        <button onclick="openModalSatwaALAM(${item.no})" class="p-1.5 rounded-lg hover:bg-sky-50 text-sky-600 transition" title="Kerawanan Satwa: Isi Binatang 1 & 2 (Kolom AL & AM)">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
        </button>
      `;
    } else {
      primaryActionBtn = `
        <button onclick="openModalKolomEZ(${item.no})" class="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition" title="Manajemen Aset: Isi Kolom E s.d. Z (Pemasangan Anti-Binatang & Tanggal)">
          <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
        </button>
      `;
    }

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
      <td class="py-3 px-3.5">${perangkatHtml}</td>
      <td class="py-3 px-3.5 text-[11px]">${actText}</td>
      <td class="py-3 px-3.5 text-[11px]">
        <button onclick="openModalTindakLanjut(${item.no})" class="text-left group flex items-center gap-1 hover:text-sky-800 transition" title="Klik untuk edit rencana tindak lanjut (Kolom AR-BA)">
          ${item.rekomendasi && item.rekomendasi !== "-"
            ? `<span class="text-sky-700 font-semibold group-hover:underline">${item.rekomendasi}</span>`
            : `<span class="text-slate-400 group-hover:text-slate-600 italic">+ Atur Rencana</span>`
          }
        </button>
      </td>
      <td class="py-3 px-3.5 text-center">
        <div class="flex items-center justify-center gap-1">
          ${primaryActionBtn}
          <button onclick="openModalTindakLanjut(${item.no})" class="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition" title="Isi Rencana Tindak Lanjut (Kolom AR-BA)"><i data-lucide="sliders" class="w-3.5 h-3.5"></i></button>
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
    await syncToGoogleSpreadsheet(payload);
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
    await syncToGoogleSpreadsheet(payload);
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

  const headers = ["No", "Nama Menara", "Jalur Transmisi", "ULTG", "Binatang 1 (AL)", "Binatang 2 (AM)", "Kategori AP", "Status Proteksi", "Perangkat", "Aktivitas", "Rekomendasi (Kolom AQ)", "Catatan"];
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
