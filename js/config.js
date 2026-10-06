/**
 * KONFIGURASI SISTEM MONITORING KERAWANAN SATWA TRS_PLM
 * UPT PALEMBANG
 */

// =========================================================================
// SECURITY HELPER: Sanitasi HTML Entity untuk Mencegah Cross-Site Scripting (XSS)
// =========================================================================
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
if (typeof window !== "undefined") {
  window.escapeHtml = escapeHtml;
}

// =========================================================================
// SECURITY & CRYPTO HELPER: SHA-256 Client-Side Hasher
// =========================================================================
async function computeSha256(str) {
  if (typeof str !== "string") str = String(str || "");
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
    try {
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toLowerCase();
    } catch (e) {
      console.warn("[SHA256] Crypto.subtle fallback:", e);
    }
  }
  return sha256Fallback(str);
}

function sha256Fallback(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result.toLowerCase();
}
if (typeof window !== "undefined") {
  window.computeSha256 = computeSha256;
}

// URL Ekspor CSV Google Spreadsheet Langsung (Live Sync Tanpa Hosting)
const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1IMpg20-ciVpykFKyM4TB60Mt2asL9o1H2thnNYDtudo/export?format=csv&gid=1063140133";

// URL Web App Google Apps Script Aktif (untuk POST/Write-Back update data)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx33SxSTLv-qCIDR9w87uEzlLFmBKfmjLCQpC9GxA1GCkQ-4pCvOwW3gtNlkDUYoONv/exec";

// URL Endpoint Backend MongoDB Auth & Audit Trail (Otomatis mengikuti domain aktif / Vercel)
const AUTH_API_URL = (typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("file://")) 
  ? window.location.origin 
  : "http://localhost:8080";

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
