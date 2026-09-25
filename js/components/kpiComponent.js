/**
 * KOMPONEN: TOP KPI SUMMARY CARDS
 */

function renderKpiComponent() {
  const container = document.getElementById("kpiSection");
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-500 text-xs">
          <span>Total Tower</span>
          <i data-lucide="layers" class="w-4 h-4 text-sky-500"></i>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-slate-800" id="kpiTotalTower">3,201</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Aset Tower Terdata</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-500 text-xs">
          <span>Satwa BURUNG</span>
          <i data-lucide="feather" class="w-4 h-4 text-sky-500"></i>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-slate-800" id="kpiBurung">18</div>
          <div class="text-[11px] text-sky-600 font-semibold mt-0.5"><span id="kpiBurungPasang">4</span> Terpasang</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-500 text-xs">
          <span>Satwa KERA</span>
          <i data-lucide="activity" class="w-4 h-4 text-amber-500"></i>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-slate-800" id="kpiKera">48</div>
          <div class="text-[11px] text-amber-600 font-semibold mt-0.5"><span id="kpiKeraPasang">7</span> Terpasang</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-500 text-xs">
          <span>KERA, BURUNG</span>
          <i data-lucide="alert-triangle" class="w-4 h-4 text-purple-500"></i>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-slate-800" id="kpiKeraBurung">18</div>
          <div class="text-[11px] text-purple-600 font-semibold mt-0.5"><span id="kpiKeraBurungPasang">7</span> Terpasang</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-slate-500 text-xs">
          <span>Aktivitas Satwa</span>
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-slate-800" id="kpiAktivitas">0</div>
          <div class="text-[11px] text-emerald-600 font-semibold mt-0.5"><span id="kpiAktivitasSesuai">0</span> Sesuai (<span id="kpiAktivitasTidak" class="text-rose-600 font-bold">0</span> Ga Sesuai)</div>
        </div>
      </div>
    </div>
  `;
}
