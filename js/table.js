/**
 * RENDER TABEL DATA, PAGINASI, AKSI INLINE & EKSPOR CSV
 * Mendukung tampilan spesifik per Tab:
 * - Tab Manajemen Asset: Fokus Kolom E s.d. Z (Kolom Satwa dihapus, format rapi mirip Rencana Tindak Lanjut)
 * - Tab Kerawanan Satwa: Fokus Kolom AL & AM (Monitoring & Evaluasi Kesesuaian Satwa)
 */

let currentPage = 1;
let pageSize = 25;

// Render baris tabel data
function renderTable() {
  const tbody = document.getElementById("towerTableBody");
  const thead = document.getElementById("towerTableHead");
  if (!tbody) return;
  tbody.innerHTML = "";

  const isSatwaTab = typeof currentActiveTab !== "undefined" && currentActiveTab === "satwa";

  // 1. Render Table Header dinamis sesuai tab aktif
  if (thead) {
    if (isSatwaTab) {
      thead.innerHTML = `
        <tr class="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
          <th class="py-3 px-3.5 w-12 text-center">NO</th>
          <th class="py-3 px-3.5 min-w-[220px]">TOWER & JALUR SUTT</th>
          <th class="py-3 px-3.5 min-w-[120px]">ULTG</th>
          <th class="py-3 px-3.5 min-w-[160px]">RAWAN SATWA (KOLOM AL)</th>
          <th class="py-3 px-3.5 min-w-[150px] text-center">EVALUASI (KOLOM AM)</th>
          <th class="py-3 px-3.5 min-w-[200px]">PERANGKAT PROTEKSI</th>
          <th class="py-3 px-3.5 text-center w-36">AKSI</th>
        </tr>
      `;
    } else {
      // Tab Manajemen Asset Tower: Kolom Nama Hewan DIHAPUS, format mirip Tab Tindak Lanjut
      thead.innerHTML = `
        <tr class="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
          <th class="py-3 px-3.5 w-12 text-center">NO</th>
          <th class="py-3 px-3.5 min-w-[240px]">TOWER & JALUR SUTT</th>
          <th class="py-3 px-3.5 min-w-[130px]">ULTG</th>
          <th class="py-3 px-3.5 min-w-[150px] text-center">STATUS PROTEKSI</th>
          <th class="py-3 px-3.5 min-w-[300px]">PERANGKAT TERPASANG (KOLOM E s.d. Z)</th>
          <th class="py-3 px-3.5 text-center w-36">AKSI</th>
        </tr>
      `;
    }
  }

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

  const colSpan = isSatwaTab ? 7 : 6;
  if (pageSlice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-12 text-slate-400 font-medium">Tidak ada data menara yang cocok dengan filter yang dipilih.</td></tr>`;
    renderPagination();
    return;
  }

  // Update judul tabel dan badge fokus sesuai tab aktif
  const elTableTitle = document.getElementById("tableMainTitle");
  const elTableBadge = document.getElementById("tableFocusBadge");

  if (elTableTitle) {
    if (isSatwaTab) {
      elTableTitle.innerText = "Monitoring & Input Kerawanan Satwa (Kolom AL & AM)";
      if (elTableBadge) {
        elTableBadge.className = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200";
        elTableBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>Fokus: Kerawanan Satwa (Kolom AL & AM)`;
      }
    } else {
      elTableTitle.innerText = "Daftar Menara Transmisi & Status Proteksi (Kolom E s.d. Z)";
      if (elTableBadge) {
        elTableBadge.className = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200";
        elTableBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Fokus: Pemasangan Proteksi (Kolom E s.d. Z)`;
      }
    }
  }

  pageSlice.forEach((item, index) => {
    const globalIdx = startIndex + index + 1;
    const ezInstalled = typeof getInstalledDevicesFromEZ === "function" ? getInstalledDevicesFromEZ(item) : [];

    if (!isSatwaTab) {
      // ==========================================
      // TAMPILAN TAB 2: MANAJEMEN ASSET TOWER
      // (Format Rencana Tindak Lanjut: NO, TOWER & JALUR, ULTG, STATUS, PERANGKAT E-Z, AKSI)
      // ==========================================
      
      // Status Proteksi Badge
      const isTerpasang = item.proteksi === "TERPASANG";
      const proteksiBadge = isTerpasang
        ? `<button onclick="inlineToggleProteksi(${item.no})" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer" title="Klik untuk mengubah status proteksi">
             <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
             <span>Terpasang</span>
           </button>`
        : `<button onclick="inlineToggleProteksi(${item.no})" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition cursor-pointer" title="Klik untuk mengubah status proteksi">
             <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-slate-400"></i>
             <span>Belum Pasang</span>
           </button>`;

      // Badges Perangkat Terpasang Kolom E s.d. Z
      let perangkatHtml = "";
      if (ezInstalled.length > 0) {
        perangkatHtml = `
          <div class="flex items-center gap-1.5 flex-wrap">
            ${ezInstalled.map(d => `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200" title="Terpasang: ${d.name} (${d.col}) ${d.date ? 'pada ' + d.date : ''}">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${d.name}
              </span>
            `).join("")}
          </div>
          ${ezInstalled[0] && ezInstalled[0].date ? `<div class="text-[10px] text-slate-400 mt-1">Tgl Instalasi: ${ezInstalled[0].date}</div>` : ""}
        `;
      } else if (item.perangkat && item.perangkat !== "-" && item.perangkat !== "TIDAK TERPASANG") {
        perangkatHtml = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${item.perangkat}
          </span>
        `;
      } else {
        perangkatHtml = `
          <button onclick="openModalKolomEZ(${item.no})" class="group inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-700 transition" title="Isi status & tanggal pemasangan Kolom E s.d. Z">
            <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600"></i>
            <span class="group-hover:underline italic">+ Isi Kolom E–Z</span>
          </button>
        `;
      }

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors";
      row.innerHTML = `
        <td class="py-3 px-3.5 text-center font-medium text-slate-400 text-xs">${globalIdx}</td>
        <td class="py-3 px-3.5">
          <div class="font-bold text-slate-800">${item.nama}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${item.jalur}</div>
        </td>
        <td class="py-3 px-3.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">${item.ultg}</span>
        </td>
        <td class="py-3 px-3.5 text-center">${proteksiBadge}</td>
        <td class="py-3 px-3.5">${perangkatHtml}</td>
        <td class="py-3 px-3.5 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="openModalKolomEZ(${item.no})" class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 flex items-center justify-center gap-1.5 transition" title="Isi / Edit Data Proteksi Kolom E s.d. Z">
              <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
              <span>Isi / Edit</span>
            </button>
            <button onclick="deleteRow(${item.no})" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(row);

    } else {
      // ==========================================
      // TAMPILAN TAB 3: KERAWANAN SATWA (KOLOM AL & AM)
      // ==========================================
      let hewanBadge = `<span class="text-slate-400 font-normal">-</span>`;
      const hasHewan = item.kategori && item.kategori !== "(Blanks) / Tidak Ada" && item.kategori !== "-";

      if (hasHewan) {
        let badgeStyle = "bg-purple-50 text-purple-700 border-purple-200 dot-purple-500";
        if (item.kategori === "BURUNG") badgeStyle = "bg-sky-50 text-sky-700 border-sky-200 dot-sky-500";
        else if (item.kategori === "KERA") badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dot-amber-500";
        else if (item.kategori === "ULAR") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 dot-rose-500";
        else if (item.kategori.includes("BURUNG") && item.kategori.includes("KERA")) badgeStyle = "bg-purple-50 text-purple-800 border-purple-300 dot-purple-600";

        const dotBg = badgeStyle.split("dot-")[1] || "sky-500";
        const cleanClass = badgeStyle.split(" dot-")[0];

        hewanBadge = `
          <button onclick="openModalSatwaALAM(${item.no})" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cleanClass} border hover:opacity-80 transition cursor-pointer" title="Klik untuk edit data Satwa Kolom AL & AM">
            <span class="w-1.5 h-1.5 rounded-full bg-${dotBg}"></span>${item.kategori}
          </button>
        `;
      } else {
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

      let devInfo = "";
      if (ezInstalled.length > 0) {
        devInfo = `
          <div class="flex items-center gap-1 flex-wrap">
            ${ezInstalled.slice(0, 2).map(d => `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                ${d.name}
              </span>
            `).join("")}
            ${ezInstalled.length > 2 ? `<span class="text-[10px] text-slate-400 font-bold">+${ezInstalled.length - 2}</span>` : ""}
          </div>
        `;
      } else {
        devInfo = `<span class="text-slate-400 font-normal text-[11px]">-</span>`;
      }

      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50/80 transition-colors";
      row.innerHTML = `
        <td class="py-3 px-3.5 text-center font-medium text-slate-400 text-xs">${globalIdx}</td>
        <td class="py-3 px-3.5">
          <div class="font-bold text-slate-800">${item.nama}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${item.jalur}</div>
        </td>
        <td class="py-3 px-3.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">${item.ultg}</span>
        </td>
        <td class="py-3 px-3.5">${hewanBadge}</td>
        <td class="py-3 px-3.5 text-center text-[11px]">${actText}</td>
        <td class="py-3 px-3.5">${devInfo}</td>
        <td class="py-3 px-3.5 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="openModalSatwaALAM(${item.no})" class="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 flex items-center justify-center gap-1 transition" title="Kerawanan Satwa: Isi Binatang 1 & 2 (Kolom AL & AM)">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Edit Satwa</span>
            </button>
            <button onclick="deleteRow(${item.no})" class="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition" title="Hapus"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    }
  });

  renderPagination();
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
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

  // Numbers
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
