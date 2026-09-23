/**
 * KOMPONEN: KLASIFIKASI KATEGORI SATWA (KOLOM AP) & PROGRESS BAR
 */

function renderClassificationComponent() {
  const container = document.getElementById("classificationSection");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200/80 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <i data-lucide="shield-alert" class="w-5 h-5 text-sky-600"></i>
          <h2 class="text-sm font-bold text-slate-800">Klasifikasi Kategori Satwa Liar (RAWAN BINATANG)</h2>
          <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded bg-sky-50 text-sky-600 border border-sky-200">DATA SATWA</span>
        </div>
      </div>
      <p class="text-xs text-slate-500">
        Data dikelompokkan sesuai jenis satwa: <span class="font-medium text-slate-700">BURUNG, KERA, KERA, BURUNG, ULAR</span>, dan <span class="font-medium text-slate-700">(Blanks) / Tidak Ada</span> untuk sel kosong. Klik kartu untuk filter instan.
      </p>

      <!-- 5 CATEGORY METRIC BOXES (CLICKABLE) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        <!-- Burung -->
        <div onclick="setCategoryFilter('BURUNG')" title="Klik untuk filter kategori BURUNG" class="metric-card-interactive bg-slate-50/70 border border-slate-200 hover:border-sky-400 hover:shadow-md cursor-pointer rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span class="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
              BURUNG
            </div>
            <span id="pctBurung" class="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">0.6%</span>
          </div>
          <div class="text-xl font-black text-slate-800"><span id="boxBurungCount">18</span> <span class="text-xs font-normal text-slate-400">Tower</span></div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
            <span class="text-emerald-600 font-medium">Pasang: <span id="boxBurungPasang">4</span></span>
            <span class="text-rose-500 font-medium">Belum: <span id="boxBurungBelum">14</span></span>
          </div>
        </div>

        <!-- Kera -->
        <div onclick="setCategoryFilter('KERA')" title="Klik untuk filter kategori KERA" class="metric-card-interactive bg-slate-50/70 border border-slate-200 hover:border-amber-400 hover:shadow-md cursor-pointer rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              KERA
            </div>
            <span id="pctKera" class="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">1.5%</span>
          </div>
          <div class="text-xl font-black text-slate-800"><span id="boxKeraCount">48</span> <span class="text-xs font-normal text-slate-400">Tower</span></div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
            <span class="text-emerald-600 font-medium">Pasang: <span id="boxKeraPasang">7</span></span>
            <span class="text-rose-500 font-medium">Belum: <span id="boxKeraBelum">41</span></span>
          </div>
        </div>

        <!-- Kera, Burung -->
        <div onclick="setCategoryFilter('KERA, BURUNG')" title="Klik untuk filter kategori KERA, BURUNG" class="metric-card-interactive bg-slate-50/70 border border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
              KERA, BURUNG
            </div>
            <span id="pctKeraBurung" class="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">0.6%</span>
          </div>
          <div class="text-xl font-black text-slate-800"><span id="boxKeraBurungCount">18</span> <span class="text-xs font-normal text-slate-400">Tower</span></div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
            <span class="text-emerald-600 font-medium">Pasang: <span id="boxKeraBurungPasang">7</span></span>
            <span class="text-rose-500 font-medium">Belum: <span id="boxKeraBurungBelum">11</span></span>
          </div>
        </div>

        <!-- Ular -->
        <div onclick="setCategoryFilter('ULAR')" title="Klik untuk filter kategori ULAR" class="metric-card-interactive bg-slate-50/70 border border-slate-200 hover:border-pink-400 hover:shadow-md cursor-pointer rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span class="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
              ULAR
            </div>
            <span id="pctUlar" class="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">1.1%</span>
          </div>
          <div class="text-xl font-black text-slate-800"><span id="boxUlarCount">34</span> <span class="text-xs font-normal text-slate-400">Tower</span></div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
            <span class="text-emerald-600 font-medium">Pasang: <span id="boxUlarPasang">4</span></span>
            <span class="text-rose-500 font-medium">Belum: <span id="boxUlarBelum">30</span></span>
          </div>
        </div>

        <!-- Blanks -->
        <div onclick="setCategoryFilter('(Blanks) / Tidak Ada')" title="Klik untuk filter (Blanks) / Tidak Ada" class="metric-card-interactive bg-slate-50/70 border border-slate-200 hover:border-slate-400 hover:shadow-md cursor-pointer rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span class="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
              (Blanks) / Tidak Ada
            </div>
            <span id="pctBlanks" class="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">96.3%</span>
          </div>
          <div class="text-xl font-black text-slate-800"><span id="boxBlanksCount">3,083</span> <span class="text-xs font-normal text-slate-400">Tower</span></div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
            <span class="text-emerald-600 font-medium">Pasang: <span id="boxBlanksPasang">521</span></span>
            <span class="text-rose-500 font-medium">Belum: <span id="boxBlanksBelum">2,562</span></span>
          </div>
        </div>
      </div>

      <!-- PROGRESS COMPOSITION BAR (CLICKABLE) -->
      <div class="pt-3 space-y-2">
        <div class="flex items-center justify-between text-xs text-slate-600">
          <span class="font-semibold text-slate-700">Komposisi Kategori Kolom AP:</span>
          <div class="flex items-center gap-3 text-[11px]">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sky-500"></span>BURUNG</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span>KERA</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-500"></span>KERA, BURUNG</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-pink-500"></span>ULAR</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-400"></span>(Blanks) / Tidak Ada</span>
          </div>
        </div>
        <div class="h-3 w-full bg-slate-200 rounded-full flex overflow-hidden shadow-inner cursor-pointer">
          <div id="barBurung" onclick="setCategoryFilter('BURUNG')" class="bg-sky-500 h-full hover:opacity-80 transition" style="width: 0.6%;" title="BURUNG - Klik untuk filter"></div>
          <div id="barKera" onclick="setCategoryFilter('KERA')" class="bg-amber-500 h-full hover:opacity-80 transition" style="width: 1.5%;" title="KERA - Klik untuk filter"></div>
          <div id="barKeraBurung" onclick="setCategoryFilter('KERA, BURUNG')" class="bg-purple-500 h-full hover:opacity-80 transition" style="width: 0.6%;" title="KERA, BURUNG - Klik untuk filter"></div>
          <div id="barUlar" onclick="setCategoryFilter('ULAR')" class="bg-pink-500 h-full hover:opacity-80 transition" style="width: 1.1%;" title="ULAR - Klik untuk filter"></div>
          <div id="barBlanks" onclick="setCategoryFilter('(Blanks) / Tidak Ada')" class="bg-slate-400 h-full hover:opacity-80 transition" style="width: 96.2%;" title="(Blanks) - Klik untuk filter"></div>
        </div>
      </div>
    </div>
  `;
}
