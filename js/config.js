/**
 * KONFIGURASI SISTEM MONITORING KERAWANAN SATWA TRS_PLM
 * UPT PALEMBANG
 */

// URL Ekspor CSV Google Spreadsheet Langsung (Live Sync Tanpa Hosting)
const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1IMpg20-ciVpykFKyM4TB60Mt2asL9o1H2thnNYDtudo/export?format=csv&gid=1063140133";

// URL Web App Google Apps Script Aktif (untuk POST/Write-Back update data)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyQuri-Iq_8cMUUGYhlWf0RrvN549rgCKYyYj_Gw2kajLLN9OyjeWRLyvLRXUVKcKeu/exec";

// Target total aset menara sesuai database TRS_PLM (Real dari spreadsheet)
const TARGET_COUNT = 3202;

// Mapping resmi jalur SUTT/SUTET berdasarkan Unit Layanan Transmisi & GI (ULTG) - 6 ULTG & 39 Jalur
const ultgJalurMapping = {
  "ULTG BETUNG": [
    "TRS 275kV SMSL5 - SGLIN",
    "TRS 150 KV BTUNG - SKAYU",
    "TRS 150kV BTUNG - TLDKU",
    "TRS 150kV TLKLP - BTUNG",
    "TRS 275 KV BTUNG-SGLIN"
  ],
  "ULTG KERAMASAN": [
    "TRS 150 KV KYUNG - GMWNG",
    "TRS 150 kV MRINA - KYUNG",
    "TRS 150kV INCOMER GI JAKABARING",
    "TRS 150KV INCOMER GI NRING",
    "TRS 150 kV KRSAN-GNDUS",
    "TRS 150 kV KRSAN-NRING",
    "TRS 150kV MRINA - BRANG",
    "TRS 150 kV NRING-MRINA",
    "TRS 70kV BGRAN - SKDKN",
    "TRS 70kV KRSAN - BGRAN",
    "TRS 70kV KRSAN - BKSGT"
  ],
  "ULTG BOOM BARU": [
    "TRS 150kV BRANG - AGP",
    "TRS 70kV BKSGT - TRATU",
    "TRS 70kV SDPTH - BMBRU",
    "TRS 70kV SDPTH - BRANG",
    "TRS 70kV SJARO - BRANG",
    "TRS 70kV SJARO - SKDKN",
    "TRS 70kV TRATU - SDPTH"
  ],
  "ULTG BORANG": [
    "TRS 150 kV GNDUS-TLKLP",
    "TRS 150KV INCOMER GI GNDUS",
    "TRS 150 KV INCOMER GI KNTEN",
    "TRS 150 kV KNTEN-BRANG",
    "TRS 150kV KNTEN - TJAPI",
    "TRS 150kV TJAPI - TJCRT",
    "TRS 150 kV TLKLP - KNTEN"
  ],
  "ULTG BANGKA": [
    "TRS 150 KV AIR ANYIR - PANGKAL PINANG",
    "TRS 150 KV AIR ANYIR - SUNGAI LIAT",
    "TRS 150 KV KELAPA - MUNTOK",
    "TRS 150 KV KOBA - TOBOALI",
    "TRS 150 KV MUNTOK - LANDING POINT",
    "TRS 150 KV PANGKALPINANG - KELAPA",
    "TRS 150 KV PANGKALPINANG - KOBA"
  ],
  "ULTG BELITUNG": [
    "TRS 70 KV DUKONG - MANGGAR",
    "TRS 70 KV SUGE - DUKONG"
  ]
};

// Daftar opsi kategori Kolom AP (Kerawanan Satwa Riil)
const KATEGORI_OPTIONS = [
  "(Blanks) / Tidak Ada",
  "BURUNG",
  "KERA",
  "ULAR",
  "KERA, BURUNG",
  "ULAR, BURUNG",
  "KERA, ULAR"
];

// Helper: dapatkan ULTG induk dari nama jalur
function getUltgByJalur(jalur) {
  for (const [u, jalurs] of Object.entries(ultgJalurMapping)) {
    if (jalurs.includes(jalur)) return u;
  }
  return "ULTG BETUNG";
}
