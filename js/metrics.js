/**
 * KALKULASI METRIK KPI, KLASIFIKASI SATWA & PROGRESS BAR
 */

function updateMetrics(dataToCalculate) {
  const total = dataToCalculate.length;
  
  // Update total menara
  const elDisplayed = document.getElementById("displayedCount");
  if (elDisplayed) elDisplayed.innerText = total.toLocaleString('id-ID');
  
  const elKpiTotal = document.getElementById("kpiTotalTower");
  if (elKpiTotal) elKpiTotal.innerText = total.toLocaleString('id-ID');

  // Filter per kategori
  const burungItems = dataToCalculate.filter(t => t.kategori === "BURUNG");
  const keraItems = dataToCalculate.filter(t => t.kategori === "KERA");
  // Mencakup kombinasi Kera, Burung, Ular
  const keraBurungItems = dataToCalculate.filter(t => 
    t.kategori === "KERA, BURUNG" || t.kategori === "ULAR, BURUNG" || t.kategori === "KERA, ULAR"
  );
  const ularItems = dataToCalculate.filter(t => t.kategori === "ULAR");
  const blanksItems = dataToCalculate.filter(t => t.kategori === "(Blanks) / Tidak Ada");

  // Helper pasang & belum
  const countPasang = (items) => items.filter(t => t.proteksi === "TERPASANG").length;
  const countBelum = (items) => items.filter(t => t.proteksi !== "TERPASANG").length;

  // Top KPI Summary Cards
  const elKpiBurung = document.getElementById("kpiBurung");
  if (elKpiBurung) elKpiBurung.innerText = burungItems.length;
  const elKpiBurungPasang = document.getElementById("kpiBurungPasang");
  if (elKpiBurungPasang) elKpiBurungPasang.innerText = countPasang(burungItems);

  const elKpiKera = document.getElementById("kpiKera");
  if (elKpiKera) elKpiKera.innerText = keraItems.length;
  const elKpiKeraPasang = document.getElementById("kpiKeraPasang");
  if (elKpiKeraPasang) elKpiKeraPasang.innerText = countPasang(keraItems);

  const elKpiKeraBurung = document.getElementById("kpiKeraBurung");
  if (elKpiKeraBurung) elKpiKeraBurung.innerText = keraBurungItems.length;
  const elKpiKeraBurungPasang = document.getElementById("kpiKeraBurungPasang");
  if (elKpiKeraBurungPasang) elKpiKeraBurungPasang.innerText = countPasang(keraBurungItems);

  // Aktivitas Satwa (Sesuai & Tidak Sesuai)
  const sesuaiCount = dataToCalculate.filter(t => t.aktivitas === "Sesuai").length;
  const tidakSesuaiCount = dataToCalculate.filter(t => t.aktivitas === "Tidak Sesuai").length;
  const tapakCount = dataToCalculate.filter(t => t.tapak && t.tapak !== "Tidak Diperlukan").length;
  
  const elKpiAktif = document.getElementById("kpiAktivitas");
  if (elKpiAktif) elKpiAktif.innerText = sesuaiCount.toLocaleString();
  const elKpiSesuai = document.getElementById("kpiAktivitasSesuai");
  if (elKpiSesuai) elKpiSesuai.innerText = sesuaiCount.toLocaleString();
  const elKpiTidak = document.getElementById("kpiAktivitasTidak");
  if (elKpiTidak) elKpiTidak.innerText = tidakSesuaiCount.toLocaleString();
  const elKpiTapak = document.getElementById("kpiBersihTapak");
  if (elKpiTapak) elKpiTapak.innerText = tapakCount.toLocaleString();

  // 5 Kotak Metrik Klasifikasi Satwa
  const elBoxBurung = document.getElementById("boxBurungCount");
  if (elBoxBurung) elBoxBurung.innerText = burungItems.length;
  const elBoxBurungPasang = document.getElementById("boxBurungPasang");
  if (elBoxBurungPasang) elBoxBurungPasang.innerText = countPasang(burungItems);
  const elBoxBurungBelum = document.getElementById("boxBurungBelum");
  if (elBoxBurungBelum) elBoxBurungBelum.innerText = countBelum(burungItems);

  const elBoxKera = document.getElementById("boxKeraCount");
  if (elBoxKera) elBoxKera.innerText = keraItems.length;
  const elBoxKeraPasang = document.getElementById("boxKeraPasang");
  if (elBoxKeraPasang) elBoxKeraPasang.innerText = countPasang(keraItems);
  const elBoxKeraBelum = document.getElementById("boxKeraBelum");
  if (elBoxKeraBelum) elBoxKeraBelum.innerText = countBelum(keraItems);

  const elBoxKeraBurung = document.getElementById("boxKeraBurungCount");
  if (elBoxKeraBurung) elBoxKeraBurung.innerText = keraBurungItems.length;
  const elBoxKeraBurungPasang = document.getElementById("boxKeraBurungPasang");
  if (elBoxKeraBurungPasang) elBoxKeraBurungPasang.innerText = countPasang(keraBurungItems);
  const elBoxKeraBurungBelum = document.getElementById("boxKeraBurungBelum");
  if (elBoxKeraBurungBelum) elBoxKeraBurungBelum.innerText = countBelum(keraBurungItems);

  const elBoxUlar = document.getElementById("boxUlarCount");
  if (elBoxUlar) elBoxUlar.innerText = ularItems.length;
  const elBoxUlarPasang = document.getElementById("boxUlarPasang");
  if (elBoxUlarPasang) elBoxUlarPasang.innerText = countPasang(ularItems);
  const elBoxUlarBelum = document.getElementById("boxUlarBelum");
  if (elBoxUlarBelum) elBoxUlarBelum.innerText = countBelum(ularItems);

  const elBoxBlanks = document.getElementById("boxBlanksCount");
  if (elBoxBlanks) elBoxBlanks.innerText = blanksItems.length.toLocaleString('id-ID');
  const elBoxBlanksPasang = document.getElementById("boxBlanksPasang");
  if (elBoxBlanksPasang) elBoxBlanksPasang.innerText = countPasang(blanksItems);
  const elBoxBlanksBelum = document.getElementById("boxBlanksBelum");
  if (elBoxBlanksBelum) elBoxBlanksBelum.innerText = countBelum(blanksItems).toLocaleString('id-ID');

  // Persentase & Progress Bar
  const calcPct = (count) => total > 0 ? ((count / total) * 100).toFixed(1) + "%" : "0%";
  
  if (document.getElementById("pctBurung")) document.getElementById("pctBurung").innerText = calcPct(burungItems.length);
  if (document.getElementById("pctKera")) document.getElementById("pctKera").innerText = calcPct(keraItems.length);
  if (document.getElementById("pctKeraBurung")) document.getElementById("pctKeraBurung").innerText = calcPct(keraBurungItems.length);
  if (document.getElementById("pctUlar")) document.getElementById("pctUlar").innerText = calcPct(ularItems.length);
  if (document.getElementById("pctBlanks")) document.getElementById("pctBlanks").innerText = calcPct(blanksItems.length);

  if (document.getElementById("barBurung")) document.getElementById("barBurung").style.width = calcPct(burungItems.length);
  if (document.getElementById("barKera")) document.getElementById("barKera").style.width = calcPct(keraItems.length);
  if (document.getElementById("barKeraBurung")) document.getElementById("barKeraBurung").style.width = calcPct(keraBurungItems.length);
  if (document.getElementById("barUlar")) document.getElementById("barUlar").style.width = calcPct(ularItems.length);
  if (document.getElementById("barBlanks")) document.getElementById("barBlanks").style.width = calcPct(blanksItems.length);

  // Update badge count pada tombol pill kategori
  const elBtnAll = document.getElementById("btnCountAll");
  if (elBtnAll) elBtnAll.innerText = total.toLocaleString('id-ID');
  const elBtnBurung = document.getElementById("btnCountBurung");
  if (elBtnBurung) elBtnBurung.innerText = burungItems.length;
  const elBtnKera = document.getElementById("btnCountKera");
  if (elBtnKera) elBtnKera.innerText = keraItems.length;
  const elBtnKeraBurung = document.getElementById("btnCountKeraBurung");
  if (elBtnKeraBurung) elBtnKeraBurung.innerText = keraBurungItems.length;
  const elBtnUlar = document.getElementById("btnCountUlar");
  if (elBtnUlar) elBtnUlar.innerText = ularItems.length;
  const elBtnBlanks = document.getElementById("btnCountBlanks");
  if (elBtnBlanks) elBtnBlanks.innerText = blanksItems.length.toLocaleString('id-ID');
}
