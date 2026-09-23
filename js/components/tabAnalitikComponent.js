/**
 * KOMPONEN TAB 1: RINGKASAN & ANALITIK
 * Sesuai desain dashboard PLN UPT Palembang
 */

function renderAnalitikComponent() {
  const container = document.getElementById("viewAnalitik");
  if (!container) return;

  container.innerHTML = `
    <!-- 1. ATTENTION / WARNING BANNER -->
    <div id="analitikAttentionBanner" class="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 border border-amber-400/40">
          <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
        </div>
        <div>
          <h3 class="text-xs sm:text-sm font-black tracking-tight text-amber-900 uppercase">
            PERHATIAN: <span id="bannerRawanBelumCount" class="text-amber-700">83</span> MENARA BERSTATUS SATWA (KOLOM AP) BELUM MEMILIKI PERANGKAT ANTI-BINATANG
          </h3>
          <p class="text-xs text-amber-800/80 mt-0.5">
            Menara tercatat dengan kategori satwa BURUNG / KERA / KERA, BURUNG / ULAR yang belum terproteksi deterrent.
          </p>
        </div>
      </div>
      <button onclick="tinjauMenaraBelumProteksi()" class="shrink-0 px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center justify-center gap-2">
        <span>Tinjau Menara Belum Proteksi</span>
        <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
      </button>
    </div>

    <!-- 2. DUA PANEL UTAMA: DISTRIBUSI PERANGKAT & MATRIKS KERAWANAN -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      <!-- PANEL KIRI: DISTRIBUSI PERANGKAT ANTI-BINATANG TERPASANG (7 COLS) -->
      <div class="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div class="flex items-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-sky-600"></i>
              <h2 class="text-sm font-bold text-slate-800">Distribusi Perangkat Anti-Binatang Terpasang</h2>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Jumlah menara transmisi per jenis proteksi satwa (Top Skor, Jaring, Boluves, dll)</p>
          </div>
          <span id="badgeTotalTerproteksi" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
            563 Menara Terproteksi
          </span>
        </div>

        <!-- DIAGRAM BATANG HORIZONTAL -->
        <div id="deviceBarChartContainer" class="space-y-3 pt-1">
          <!-- Diisi otomatis oleh updateAnalitikView() -->
        </div>
      </div>

      <!-- PANEL KANAN: MATRIKS KERAWANAN & PROTEKSI (5 COLS) -->
      <div class="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-sky-600"></i>
            <h2 class="text-sm font-bold text-slate-800">Matriks Kerawanan & Proteksi</h2>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wider">
            KOLOM AP
          </span>
        </div>
        <p class="text-[11px] text-slate-400 -mt-1">
          Kategori langsung Kolom AP (RAWAN BINATANG) sesuai kemunculan data tanpa peringkasan biner.
        </p>

        <!-- DONUT CHART & LEGENDA STATISTIK -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 py-2 border-b border-slate-100">
          <div class="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" stroke-width="14"></circle>
              <!-- Segments rendered dynamically -->
              <circle id="donutSegBlanks" cx="50" cy="50" r="38" fill="transparent" stroke="#94a3b8" stroke-width="14" stroke-dasharray="238.7" stroke-dashoffset="0"></circle>
              <circle id="donutSegUlar" cx="50" cy="50" r="38" fill="transparent" stroke="#f472b6" stroke-width="14" stroke-dasharray="0 238.7" stroke-dashoffset="0"></circle>
              <circle id="donutSegKeraBurung" cx="50" cy="50" r="38" fill="transparent" stroke="#c084fc" stroke-width="14" stroke-dasharray="0 238.7" stroke-dashoffset="0"></circle>
              <circle id="donutSegKera" cx="50" cy="50" r="38" fill="transparent" stroke="#fbbf24" stroke-width="14" stroke-dasharray="0 238.7" stroke-dashoffset="0"></circle>
              <circle id="donutSegBurung" cx="50" cy="50" r="38" fill="transparent" stroke="#38bdf8" stroke-width="14" stroke-dasharray="0 238.7" stroke-dashoffset="0"></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span id="donutTotalCount" class="text-lg font-black text-slate-800 tracking-tight leading-none">3,201</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">TOTAL</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs w-full max-w-[200px]">
            <div class="flex items-center justify-between text-slate-600">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>BURUNG</span>
              <span id="legendBurung" class="font-bold text-slate-800">11 <span class="font-normal text-slate-400 text-[10px]">(0)</span></span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>KERA</span>
              <span id="legendKera" class="font-bold text-slate-800">61 <span class="font-normal text-slate-400 text-[10px]">(20)</span></span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span>KERA, BURUNG</span>
              <span id="legendKeraBurung" class="font-bold text-slate-800">5 <span class="font-normal text-slate-400 text-[10px]">(2)</span></span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-pink-400"></span>ULAR</span>
              <span id="legendUlar" class="font-bold text-slate-800">31 <span class="font-normal text-slate-400 text-[10px]">(3)</span></span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>(Blanks) / Tidak Ada</span>
              <span id="legendBlanks" class="font-bold text-slate-800">3,093 <span class="font-normal text-slate-400 text-[10px]">(538)</span></span>
            </div>
          </div>
        </div>

        <!-- TABEL MATRIKS INTERAKTIF -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>KATEGORI KOLOM AP x PROTEKSI</span>
            <span class="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">KLIK SEL UNTUK FILTER</span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50/80 text-slate-600 text-[11px] font-bold border-b border-slate-200">
                  <th class="py-2 px-3">Kategori AP</th>
                  <th class="py-2 px-3 text-center text-emerald-700 bg-emerald-50/50">Terpasang</th>
                  <th class="py-2 px-3 text-center text-rose-700 bg-rose-50/50">Belum</th>
                  <th class="py-2 px-3 text-center font-black">Total</th>
                </tr>
              </thead>
              <tbody id="analitikMatrixBody" class="divide-y divide-slate-100 text-[11px]">
                <!-- Diisi otomatis oleh updateAnalitikView() -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- DUA KARTU STATISTIK BAWAH -->
        <div class="grid grid-cols-2 gap-3 pt-1">
          <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-center">
            <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Menara Kolom AP</div>
            <div id="matriksTotalMenara" class="text-base font-black text-slate-800 mt-0.5">3,201 Menara</div>
          </div>
          <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-center">
            <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Terpasang Proteksi</div>
            <div id="matriksTotalTerpasang" class="text-base font-black text-emerald-600 mt-0.5">563 (17.6%)</div>
          </div>
        </div>

      </div>

    </div>
  `;
}

/**
 * Filter data menara rawan satwa yang belum memiliki proteksi
 */
function tinjauMenaraBelumProteksi() {
  if (typeof resetAllFilters === "function") resetAllFilters();
  const filterProt = document.getElementById("filterProteksi");
  if (filterProt) filterProt.value = "BELUM TERPASANG";

  // Alihkan tampilan ke Tab Manajemen Asset
  if (typeof switchTab === "function") switchTab("manajemen");
  if (typeof applyFilters === "function") applyFilters();
}

/**
 * Filter interaktif saat user mengklik sel di tabel matriks
 */
function filterMatrixCell(kategori, proteksi) {
  if (typeof resetAllFilters === "function") resetAllFilters();
  const filterKat = document.getElementById("filterKategori");
  const filterProt = document.getElementById("filterProteksi");

  if (filterKat) filterKat.value = kategori;
  if (filterProt) filterProt.value = proteksi;

  if (typeof switchTab === "function") switchTab("manajemen");
  if (typeof applyFilters === "function") applyFilters();
}

/**
 * Update perhitungan dinamis pada Tab 1: Ringkasan & Analitik
 */
function updateAnalitikView(data) {
  const total = data.length;

  // 1. Attention Banner
  const rawanBelumCount = data.filter(
    t => t.kategori && t.kategori !== "(Blanks) / Tidak Ada" && t.proteksi !== "TERPASANG"
  ).length;

  const elBannerCount = document.getElementById("bannerRawanBelumCount");
  if (elBannerCount) elBannerCount.innerText = rawanBelumCount;

  // 2. Distribusi Perangkat Terpasang
  const deviceList = [
    { name: "TOP SKOR", key: "TOP SKOR", color: "bg-sky-500" },
    { name: "JARING", key: "JARING", color: "bg-sky-500" },
    { name: "BOLUVES", key: "BOLUVES", color: "bg-sky-500" },
    { name: "ASB", key: "ASB", color: "bg-sky-500" },
    { name: "KAWAT SILET", key: "KAWAT SILET", color: "bg-sky-500" },
    { name: "PELAKOR", key: "PELAKOR", color: "bg-sky-500" },
    { name: "TOGAR ABES", key: "TOGAR ABES", color: "bg-sky-500" },
    { name: "IRONMAN", key: "IRONMAN", color: "bg-sky-500" },
    { name: "PEMVES", key: "PEMVES", color: "bg-sky-500" }
  ];

  // Hitung jumlah menara per perangkat
  const counts = {};
  deviceList.forEach(d => { counts[d.name] = 0; });
  let totalTerproteksi = 0;

  data.forEach(t => {
    if (t.proteksi === "TERPASANG") {
      totalTerproteksi++;
      const p = (t.perangkat || "").toUpperCase();
      deviceList.forEach(d => {
        if (p.includes(d.name)) {
          counts[d.name]++;
        }
      });
    }
  });

  const elBadgeTerproteksi = document.getElementById("badgeTotalTerproteksi");
  if (elBadgeTerproteksi) elBadgeTerproteksi.innerText = `${totalTerproteksi.toLocaleString("id-ID")} Menara Terproteksi`;

  const maxDeviceCount = Math.max(...Object.values(counts), 1);
  const chartContainer = document.getElementById("deviceBarChartContainer");

  if (chartContainer) {
    chartContainer.innerHTML = deviceList.map(dev => {
      const c = counts[dev.name] || 0;
      const pct = ((c / maxDeviceCount) * 100).toFixed(1);
      return `
        <div class="flex items-center gap-3 text-xs">
          <div class="w-24 text-right font-semibold text-slate-700 text-[11px] truncate">${dev.name}</div>
          <div class="flex-1 bg-slate-100 rounded-r-md h-4 overflow-hidden relative">
            <div class="h-full bg-sky-500 rounded-r-md transition-all duration-500" style="width: ${pct}%"></div>
          </div>
          <div class="w-10 text-left font-bold text-slate-800 text-xs">${c}</div>
        </div>
      `;
    }).join("");
  }

  // 3. Matriks Kerawanan & Proteksi
  const matrixCategories = [
    { name: "BURUNG", color: "bg-sky-400", border: "border-sky-400" },
    { name: "KERA", color: "bg-amber-400", border: "border-amber-400" },
    { name: "KERA, BURUNG", color: "bg-purple-400", border: "border-purple-400" },
    { name: "ULAR", color: "bg-pink-400", border: "border-pink-400" },
    { name: "(Blanks) / Tidak Ada", color: "bg-slate-400", border: "border-slate-400" }
  ];

  const tbody = document.getElementById("analitikMatrixBody");
  if (tbody) {
    tbody.innerHTML = matrixCategories.map(cat => {
      const items = data.filter(t => t.kategori === cat.name);
      const terpasang = items.filter(t => t.proteksi === "TERPASANG").length;
      const belum = items.filter(t => t.proteksi !== "TERPASANG").length;
      const tot = items.length;

      return `
        <tr class="hover:bg-slate-50 transition cursor-pointer">
          <td onclick="filterMatrixCell('${cat.name}', '')" class="py-2.5 px-3 font-semibold text-slate-700 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${cat.color}"></span>
            <span>${cat.name}</span>
          </td>
          <td onclick="filterMatrixCell('${cat.name}', 'TERPASANG')" class="py-2.5 px-3 text-center font-bold text-emerald-600 hover:bg-emerald-100/60 rounded transition">
            ${terpasang}
          </td>
          <td onclick="filterMatrixCell('${cat.name}', 'BELUM TERPASANG')" class="py-2.5 px-3 text-center font-bold text-rose-600 hover:bg-rose-100/60 rounded transition">
            ${belum.toLocaleString("id-ID")}
          </td>
          <td onclick="filterMatrixCell('${cat.name}', '')" class="py-2.5 px-3 text-center font-black text-slate-800">
            ${tot.toLocaleString("id-ID")}
          </td>
        </tr>
      `;
    }).join("");
  }

  // 4. Update Donut Chart & Legend
  const elDonutTotal = document.getElementById("donutTotalCount");
  if (elDonutTotal) elDonutTotal.innerText = total.toLocaleString("id-ID");

  const cBurung = data.filter(t => t.kategori === "BURUNG");
  const cKera = data.filter(t => t.kategori === "KERA");
  const cKeraBurung = data.filter(t => t.kategori === "KERA, BURUNG");
  const cUlar = data.filter(t => t.kategori === "ULAR");
  const cBlanks = data.filter(t => t.kategori === "(Blanks) / Tidak Ada");

  const legB = document.getElementById("legendBurung");
  if (legB) legB.innerHTML = `${cBurung.length} <span class="font-normal text-slate-400 text-[10px]">(${cBurung.filter(t=>t.proteksi==='TERPASANG').length})</span>`;
  const legK = document.getElementById("legendKera");
  if (legK) legK.innerHTML = `${cKera.length} <span class="font-normal text-slate-400 text-[10px]">(${cKera.filter(t=>t.proteksi==='TERPASANG').length})</span>`;
  const legKB = document.getElementById("legendKeraBurung");
  if (legKB) legKB.innerHTML = `${cKeraBurung.length} <span class="font-normal text-slate-400 text-[10px]">(${cKeraBurung.filter(t=>t.proteksi==='TERPASANG').length})</span>`;
  const legU = document.getElementById("legendUlar");
  if (legU) legU.innerHTML = `${cUlar.length} <span class="font-normal text-slate-400 text-[10px]">(${cUlar.filter(t=>t.proteksi==='TERPASANG').length})</span>`;
  const legBl = document.getElementById("legendBlanks");
  if (legBl) legBl.innerHTML = `${cBlanks.length.toLocaleString('id-ID')} <span class="font-normal text-slate-400 text-[10px]">(${cBlanks.filter(t=>t.proteksi==='TERPASANG').length})</span>`;

  // Update SVG donut stroke dashes (circumference 2 * PI * 38 = 238.76)
  const circ = 238.76;
  const pB = total > 0 ? (cBurung.length / total) * circ : 0;
  const pK = total > 0 ? (cKera.length / total) * circ : 0;
  const pKB = total > 0 ? (cKeraBurung.length / total) * circ : 0;
  const pU = total > 0 ? (cUlar.length / total) * circ : 0;
  const pBl = circ - (pB + pK + pKB + pU);

  let offset = 0;
  const sB = document.getElementById("donutSegBurung");
  if (sB) { sB.setAttribute("stroke-dasharray", `${pB} ${circ}`); sB.setAttribute("stroke-dashoffset", -offset); offset += pB; }
  const sK = document.getElementById("donutSegKera");
  if (sK) { sK.setAttribute("stroke-dasharray", `${pK} ${circ}`); sK.setAttribute("stroke-dashoffset", -offset); offset += pK; }
  const sKB = document.getElementById("donutSegKeraBurung");
  if (sKB) { sKB.setAttribute("stroke-dasharray", `${pKB} ${circ}`); sKB.setAttribute("stroke-dashoffset", -offset); offset += pKB; }
  const sU = document.getElementById("donutSegUlar");
  if (sU) { sU.setAttribute("stroke-dasharray", `${pU} ${circ}`); sU.setAttribute("stroke-dashoffset", -offset); offset += pU; }
  const sBl = document.getElementById("donutSegBlanks");
  if (sBl) { sBl.setAttribute("stroke-dasharray", `${pBl} ${circ}`); sBl.setAttribute("stroke-dashoffset", -offset); }

  // 5. Bottom summary cards
  const elMatTotal = document.getElementById("matriksTotalMenara");
  if (elMatTotal) elMatTotal.innerText = `${total.toLocaleString("id-ID")} Menara`;

  const elMatTerpasang = document.getElementById("matriksTotalTerpasang");
  const pctTerpasang = total > 0 ? ((totalTerproteksi / total) * 100).toFixed(1) : 0;
  if (elMatTerpasang) elMatTerpasang.innerText = `${totalTerproteksi} (${pctTerpasang}%)`;
}
