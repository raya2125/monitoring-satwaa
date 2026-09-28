/**
 * KALKULASI METRIK KPI, REKAP PROTEKSI KOLOM E-Z, KLASIFIKASI SATWA & PROGRESS BAR
 */

function updateMetrics(dataToCalculate) {
  const total = dataToCalculate.length;
  
  // 1. Update counter total menara
  const elDisplayed = document.getElementById("displayedCount");
  if (elDisplayed) elDisplayed.innerText = total.toLocaleString('id-ID');
  
  const elKpiTotal = document.getElementById("kpiTotalTower");
  if (elKpiTotal) elKpiTotal.innerText = total.toLocaleString('id-ID');

  // 2. Status Proteksi (Kolom E s.d. Z)
  const countTerpasang = dataToCalculate.filter(t => t.proteksi === "TERPASANG").length;
  const countBelum = Math.max(0, total - countTerpasang);

  const elTerpasang = document.getElementById("kpiTotalTerpasang");
  if (elTerpasang) elTerpasang.innerText = countTerpasang.toLocaleString('id-ID');
  const elBelum = document.getElementById("kpiTotalBelum");
  if (elBelum) elBelum.innerText = countBelum.toLocaleString('id-ID');

  // 3. Rekapitulasi Perangkat Terpasang (Kolom E s.d. Z)
  const countTopSkor = dataToCalculate.filter(t => 
    t.ezTopSkorL1 || t.ezTopSkorL2 || (t.perangkat && t.perangkat.toUpperCase().includes("TOP SKOR"))
  ).length;

  const countIronMan = dataToCalculate.filter(t => 
    t.ezIronmanL1 || t.ezIronmanL2 || (t.perangkat && t.perangkat.toUpperCase().includes("IRON"))
  ).length;

  const countBoluves = dataToCalculate.filter(t => 
    t.ezBoluves || (t.perangkat && t.perangkat.toUpperCase().includes("BOLUVES"))
  ).length;

  const countJaring = dataToCalculate.filter(t => 
    t.ezJaring || (t.perangkat && t.perangkat.toUpperCase().includes("JARING"))
  ).length;

  const countPelakor = dataToCalculate.filter(t => 
    t.ezPelakor || (t.perangkat && t.perangkat.toUpperCase().includes("PELAKOR"))
  ).length;

  const countKawatSilet = dataToCalculate.filter(t => 
    t.ezKawatSilet || (t.perangkat && (t.perangkat.toUpperCase().includes("KAWAT SILET") || t.perangkat.toUpperCase().includes("KAWAT DURI")))
  ).length;

  const countAsb = dataToCalculate.filter(t => 
    t.ezAsb || (t.perangkat && t.perangkat.toUpperCase().includes("ASB"))
  ).length;

  const countPemves = dataToCalculate.filter(t => 
    t.ezPemves || (t.perangkat && t.perangkat.toUpperCase().includes("PEMVES"))
  ).length;

  const countTogarAbes = dataToCalculate.filter(t => 
    t.ezTogarAbes || (t.perangkat && t.perangkat.toUpperCase().includes("TOGAR ABES"))
  ).length;

  if (document.getElementById("rekapEzTopSkor")) document.getElementById("rekapEzTopSkor").innerText = countTopSkor;
  if (document.getElementById("rekapEzIronMan")) document.getElementById("rekapEzIronMan").innerText = countIronMan;
  if (document.getElementById("rekapEzBoluves")) document.getElementById("rekapEzBoluves").innerText = countBoluves;
  if (document.getElementById("rekapEzJaring")) document.getElementById("rekapEzJaring").innerText = countJaring;
  if (document.getElementById("rekapEzPelakor")) document.getElementById("rekapEzPelakor").innerText = countPelakor;
  if (document.getElementById("rekapEzKawatSilet")) document.getElementById("rekapEzKawatSilet").innerText = countKawatSilet;
  if (document.getElementById("rekapEzAsb")) document.getElementById("rekapEzAsb").innerText = countAsb;
  if (document.getElementById("rekapEzPemves")) document.getElementById("rekapEzPemves").innerText = countPemves;
  if (document.getElementById("rekapEzTogarAbes")) document.getElementById("rekapEzTogarAbes").innerText = countTogarAbes;

  // 4. Metrik Klasifikasi Satwa (Tab Kerawanan Satwa)
  const burungItems = dataToCalculate.filter(t => t.kategori === "BURUNG");
  const keraItems = dataToCalculate.filter(t => t.kategori === "KERA");
  const keraBurungItems = dataToCalculate.filter(t => 
    t.kategori === "KERA, BURUNG" || t.kategori === "ULAR, BURUNG" || t.kategori === "KERA, ULAR"
  );
  const ularItems = dataToCalculate.filter(t => t.kategori === "ULAR");
  const blanksItems = dataToCalculate.filter(t => t.kategori === "(Blanks) / Tidak Ada");

  const countItemPasang = (items) => items.filter(t => t.proteksi === "TERPASANG").length;
  const countItemBelum = (items) => items.filter(t => t.proteksi !== "TERPASANG").length;

  const elBoxBurung = document.getElementById("boxBurungCount");
  if (elBoxBurung) elBoxBurung.innerText = burungItems.length;
  const elBoxBurungPasang = document.getElementById("boxBurungPasang");
  if (elBoxBurungPasang) elBoxBurungPasang.innerText = countItemPasang(burungItems);
  const elBoxBurungBelum = document.getElementById("boxBurungBelum");
  if (elBoxBurungBelum) elBoxBurungBelum.innerText = countItemBelum(burungItems);

  const elBoxKera = document.getElementById("boxKeraCount");
  if (elBoxKera) elBoxKera.innerText = keraItems.length;
  const elBoxKeraPasang = document.getElementById("boxKeraPasang");
  if (elBoxKeraPasang) elBoxKeraPasang.innerText = countItemPasang(keraItems);
  const elBoxKeraBelum = document.getElementById("boxKeraBelum");
  if (elBoxKeraBelum) elBoxKeraBelum.innerText = countItemBelum(keraItems);

  const elBoxKeraBurung = document.getElementById("boxKeraBurungCount");
  if (elBoxKeraBurung) elBoxKeraBurung.innerText = keraBurungItems.length;
  const elBoxKeraBurungPasang = document.getElementById("boxKeraBurungPasang");
  if (elBoxKeraBurungPasang) elBoxKeraBurungPasang.innerText = countItemPasang(keraBurungItems);
  const elBoxKeraBurungBelum = document.getElementById("boxKeraBurungBelum");
  if (elBoxKeraBurungBelum) elBoxKeraBurungBelum.innerText = countItemBelum(keraBurungItems);

  const elBoxUlar = document.getElementById("boxUlarCount");
  if (elBoxUlar) elBoxUlar.innerText = ularItems.length;
  const elBoxUlarPasang = document.getElementById("boxUlarPasang");
  if (elBoxUlarPasang) elBoxUlarPasang.innerText = countItemPasang(ularItems);
  const elBoxUlarBelum = document.getElementById("boxUlarBelum");
  if (elBoxUlarBelum) elBoxUlarBelum.innerText = countItemBelum(ularItems);

  const elBoxBlanks = document.getElementById("boxBlanksCount");
  if (elBoxBlanks) elBoxBlanks.innerText = blanksItems.length.toLocaleString('id-ID');
  const elBoxBlanksPasang = document.getElementById("boxBlanksPasang");
  if (elBoxBlanksPasang) elBoxBlanksPasang.innerText = countItemPasang(blanksItems);
  const elBoxBlanksBelum = document.getElementById("boxBlanksBelum");
  if (elBoxBlanksBelum) elBoxBlanksBelum.innerText = countItemBelum(blanksItems).toLocaleString('id-ID');

  // Persentase & Progress Bar Satwa
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
