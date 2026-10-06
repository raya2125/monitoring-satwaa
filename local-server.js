/**
 * =========================================================================
 * SERVER UTAMA SISTEM MONITORING SATWA PLN UPT PALEMBANG
 * + MONGODB AUTHENTICATION & AUDIT TRAIL BACKEND
 * =========================================================================
 * Fitur:
 * 1. Static File Server untuk Web Dashboard (HTML, CSS, JS)
 * 2. API Autentikasi Supervisor terhubung ke MongoDB (Password Hashing via bcrypt)
 * 3. Pencatatan Jejak Audit (Audit Trail Log) setiap aksi ACC ke MongoDB
 * 4. Fallback Aman: jika MongoDB belum dikonfigurasi, tetap berjalan normal
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Muat variabel lingkungan dari .env secara manual (tanpa perlu dependensi tambahan)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '8080', 10);
const BASE_DIR = __dirname;
const MONGO_URI = process.env.MONGO_URI || '';
const DEFAULT_PIN = process.env.DEFAULT_SUPERVISOR_PIN || '1234';

// SHA-256 Constants
const SHA256_UPT_PALEMBAG = '34f62975d347fafd70ae76d9f49ba78a7f9d4623dec4a18d7fe64ab704d70a2f';
const SHA256_UPT_PALEMBANG = 'a39fec3ccf58fd5b29346115ee1e7e3d20e947a86ff3ca1965a2b622fdfc24e6';

// Coba muat bcryptjs & mongodb
let bcrypt = null;
let MongoClient = null;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.warn('[Server] bcryptjs belum terpasang, menggunakan pembanding bawaan.');
}
try {
  const mongoPkg = require('mongodb');
  MongoClient = mongoPkg.MongoClient;
} catch (e) {
  console.warn('[Server] driver mongodb belum terpasang.');
}

// State Koneksi MongoDB
let dbClient = null;
let db = null;
let colSupervisors = null;
let colAuditLogs = null;
let isMongoConnected = false;

// Inisialisasi Koneksi ke MongoDB
async function initMongo() {
  if (!MongoClient || !MONGO_URI || MONGO_URI.trim() === '') {
    console.log('ℹ️  MONGO_URI belum diisi di .env. Server berjalan dalam Mode Auth Lokal/Fallback.');
    return;
  }

  try {
    console.log('🔌 Menghubungkan ke MongoDB Atlas...');
    dbClient = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    await dbClient.connect();
    
    // Gunakan nama database dari URI atau default ke 'trs_satwa_monitoring'
    const dbName = dbClient.options.dbName || 'trs_satwa_monitoring';
    db = dbClient.db(dbName);
    colSupervisors = db.collection('supervisors');
    colAuditLogs = db.collection('audit_logs');
    isMongoConnected = true;

    console.log(`✅ Sukses terhubung ke Database MongoDB: "${dbName}"`);

    // Inisialisasi supervisor default jika database masih baru/kosong
    const supervisorCount = await colSupervisors.countDocuments();
    if (supervisorCount === 0) {
      const hashedDefault = bcrypt ? bcrypt.hashSync(DEFAULT_PIN, 10) : DEFAULT_PIN;
      await colSupervisors.insertOne({
        username: 'supervisor',
        name: 'Supervisor PLN UPT Palembang',
        role: 'supervisor',
        pinHash: hashedDefault,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`🌱 Default Supervisor dibuat di MongoDB (PIN default: ${DEFAULT_PIN})`);
    }

    // Inisialisasi user pln dengan SHA-256 hash (upt palembag)
    const plnUser = await colSupervisors.findOne({ username: 'pln' });
    if (!plnUser) {
      await colSupervisors.insertOne({
        username: 'pln',
        name: 'PLN UPT Palembang',
        role: 'supervisor',
        sha256Hash: SHA256_UPT_PALEMBAG,
        sha256HashAlt: SHA256_UPT_PALEMBANG,
        pinHash: bcrypt ? bcrypt.hashSync('upt palembag', 10) : SHA256_UPT_PALEMBAG,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`🌱 Akun PLN UPT Palembang dibuat di MongoDB (SHA-256 hash aktif)`);
    }

  } catch (err) {
    console.error('⚠️  Gagal terhubung ke MongoDB:', err.message);
    console.log('ℹ️  Server tetap aktif dan melayani web dengan fallback.');
    isMongoConnected = false;
  }
}

// Eksekusi koneksi MongoDB
initMongo();

// Tipe MIME untuk File Statis
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Helper Kirim Respon JSON dengan CORS Aktif
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

// Helper Baca Body JSON dari Request
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Server Utama
const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // =========================================================================
  // API ROUTER: MONGODB AUTHENTICATION & AUDIT TRAIL
  // =========================================================================

  // 1. GET /api/status & /api/auth/status
  if (req.method === 'GET' && (parsedUrl === '/api/status' || parsedUrl === '/api/auth/status')) {
    return sendJson(res, 200, {
      status: 'ok',
      mongoConnected: isMongoConnected,
      database: isMongoConnected ? (db ? db.databaseName : 'MongoDB Atlas') : 'Local Fallback',
      authEngine: isMongoConnected ? 'MongoDB (Bcrypt Enkripsi)' : 'In-Memory / Google Apps Script',
      version: '1.0.0'
    });
  }

  // 2. POST /api/verify-pin & /api/auth/verify-pin
  if (req.method === 'POST' && (parsedUrl === '/api/verify-pin' || parsedUrl === '/api/auth/verify-pin' || parsedUrl === '/api/auth/login')) {
    const body = await parseJsonBody(req);
    const enteredPin = String(body.pin || body.password || '').trim();
    const username = String(body.username || '').trim().toLowerCase();

    if (!enteredPin) {
      return sendJson(res, 400, { success: false, valid: false, message: 'Password atau PIN diperlukan.' });
    }

    const inputSha256 = crypto.createHash('sha256').update(enteredPin).digest('hex').toLowerCase();
    const inputRawLower = enteredPin.toLowerCase();

    const isPlnPasswordMatch = (
      inputSha256 === SHA256_UPT_PALEMBAG ||
      inputSha256 === SHA256_UPT_PALEMBANG ||
      inputRawLower === SHA256_UPT_PALEMBAG ||
      inputRawLower === SHA256_UPT_PALEMBANG ||
      inputRawLower === 'upt palembag' ||
      inputRawLower === 'upt palembang'
    );

    let isMatch = false;
    let matchedUser = { username: username === 'pln' ? 'pln' : (username || 'supervisor'), name: 'PLN UPT Palembang', role: 'supervisor' };
    let authSource = 'fallback';

    if (isMongoConnected && colSupervisors) {
      try {
        const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cleanUser = escapeRegex(username);
        const query = username 
          ? { $or: [{ username: username }, { username: new RegExp('^' + cleanUser + '$', 'i') }] }
          : { $or: [{ username: 'pln' }, { role: 'supervisor' }] };

        let supervisor = await colSupervisors.findOne(query);
        if (!supervisor && (username === 'pln' || !username)) {
          supervisor = await colSupervisors.findOne({ username: 'pln' });
        }
        if (!supervisor && (!username || username === 'supervisor' || username === 'admin')) {
          supervisor = await colSupervisors.findOne({ role: 'supervisor' });
        }

        if (supervisor) {
          if (supervisor.username === 'pln' || username === 'pln') {
            if (isPlnPasswordMatch) {
              isMatch = true;
            } else if (supervisor.sha256Hash && (inputSha256 === supervisor.sha256Hash.toLowerCase() || inputRawLower === supervisor.sha256Hash.toLowerCase())) {
              isMatch = true;
            }
          }

          if (!isMatch && supervisor.pinHash) {
            if (bcrypt && supervisor.pinHash.startsWith('$2')) {
              isMatch = bcrypt.compareSync(enteredPin, supervisor.pinHash);
            } else {
              isMatch = enteredPin === supervisor.pinHash || enteredPin === DEFAULT_PIN;
            }
          }

          if (!isMatch && isPlnPasswordMatch) {
            isMatch = true;
          }

          if (isMatch) {
            authSource = 'mongodb';
            matchedUser = {
              username: supervisor.username || username || 'supervisor',
              name: supervisor.name || (supervisor.username === 'pln' ? 'PLN UPT Palembang' : 'Supervisor UPT'),
              role: supervisor.role || 'supervisor'
            };
          }
        }
      } catch (dbErr) {
        console.error('Error verifikasi MongoDB:', dbErr);
      }
    }

    if (!isMatch) {
      const isPlnFallback = (username === 'pln' || !username) && isPlnPasswordMatch;
      const isDefaultFallback = (enteredPin === DEFAULT_PIN) && (!username || username === 'supervisor' || username === 'admin');

      if (isPlnFallback) {
        isMatch = true;
        authSource = 'fallback';
        matchedUser = { username: 'pln', name: 'PLN UPT Palembang', role: 'supervisor' };
      } else if (isDefaultFallback) {
        isMatch = true;
        authSource = 'fallback';
        matchedUser = { username: username || 'supervisor', name: 'Supervisor UPT', role: 'supervisor' };
      }
    }

    if (isMatch) {
      const sessionToken = 'PLN_AUTH_' + Date.now() + '_' + crypto.randomBytes(12).toString('hex');
      if (colAuditLogs) {
        colAuditLogs.insertOne({
          action: 'LOGIN_SUPERVISOR_SUCCESS',
          username: matchedUser.username,
          name: matchedUser.name,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local',
          hashAlgorithm: 'sha256',
          timestamp: new Date()
        }).catch(() => {});
      }

      return sendJson(res, 200, {
        success: true,
        valid: true,
        role: 'supervisor',
        username: matchedUser.username,
        name: matchedUser.name,
        token: sessionToken,
        hashAlgorithm: 'sha256',
        source: authSource
      });
    } else {
      if (colAuditLogs) {
        colAuditLogs.insertOne({
          action: 'LOGIN_SUPERVISOR_FAILED',
          username: username || 'unknown',
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local',
          timestamp: new Date()
        }).catch(() => {});
      }

      return sendJson(res, 401, {
        success: false,
        valid: false,
        message: 'Username atau Password/PIN salah. (Gunakan username: pln & password: upt palembag)'
      });
    }
  }

  // 3. POST /api/change-pin & /api/auth/change-pin
  if (req.method === 'POST' && (parsedUrl === '/api/change-pin' || parsedUrl === '/api/auth/change-pin')) {
    const body = await parseJsonBody(req);
    const oldPin = String(body.oldPin || '').trim();
    const newPin = String(body.newPin || '').trim();

    if (!oldPin || !newPin) {
      return sendJson(res, 400, { success: false, message: 'PIN lama dan PIN baru wajib diisi.' });
    }

    if (newPin.length < 4) {
      return sendJson(res, 400, { success: false, message: 'PIN baru minimal 4 karakter.' });
    }

    if (isMongoConnected && colSupervisors) {
      try {
        const supervisor = await colSupervisors.findOne({ role: 'supervisor' });
        if (!supervisor) return sendJson(res, 404, { success: false, message: 'Supervisor tidak ditemukan.' });

        const isMatch = bcrypt ? bcrypt.compareSync(oldPin, supervisor.pinHash) : oldPin === supervisor.pinHash;
        if (!isMatch) {
          return sendJson(res, 401, { success: false, message: 'PIN lama salah!' });
        }

        const newHash = bcrypt ? bcrypt.hashSync(newPin, 10) : newPin;
        await colSupervisors.updateOne(
          { _id: supervisor._id },
          { $set: { pinHash: newHash, updatedAt: new Date() } }
        );

        if (colAuditLogs) {
          colAuditLogs.insertOne({
            action: 'CHANGE_PIN_SUCCESS',
            name: supervisor.name,
            timestamp: new Date()
          }).catch(() => {});
        }

        return sendJson(res, 200, { success: true, message: 'PIN Supervisor di MongoDB berhasil diperbarui!' });
      } catch (err) {
        return sendJson(res, 500, { success: false, message: err.message });
      }
    }

    return sendJson(res, 200, { success: true, message: 'MongoDB tidak aktif, ubah PIN di .env.' });
  }

  // 4. POST /api/log-acc & /api/auth/log-acc
  if (req.method === 'POST' && (parsedUrl === '/api/log-acc' || parsedUrl === '/api/auth/log-acc')) {
    const body = await parseJsonBody(req);
    if (isMongoConnected && colAuditLogs) {
      try {
        await colAuditLogs.insertOne({
          action: 'ACC_DATA_MENARA',
          towerName: body.towerName || '-',
          jalur: body.jalur || '-',
          ultg: body.ultg || '-',
          diubahOleh: body.operatorName || 'Petugas',
          disetujuiOleh: body.supervisorName || 'Supervisor',
          typeLabel: body.typeLabel || '-',
          changesSummary: body.changesSummary || [],
          timestamp: new Date()
        });
      } catch (err) {}
    }
    return sendJson(res, 200, { success: true });
  }

  // 5. GET /api/audit-logs & /api/auth/audit-logs
  if (req.method === 'GET' && (parsedUrl === '/api/audit-logs' || parsedUrl === '/api/auth/audit-logs')) {
    if (isMongoConnected && colAuditLogs) {
      try {
        const logs = await colAuditLogs.find({}).sort({ timestamp: -1 }).limit(50).toArray();
        return sendJson(res, 200, { success: true, count: logs.length, logs: logs });
      } catch (err) {
        return sendJson(res, 500, { success: false, message: err.message });
      }
    }
    return sendJson(res, 200, { success: true, count: 0, logs: [] });
  }

  // =========================================================================
  // STATIC FILE HANDLER (Untuk Tampilan Dashboard Web)
  // =========================================================================
  let reqUrl = parsedUrl;
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');

  // Blokir akses ke file rahasia (.env, .git, node_modules, package.json, dsb)
  const lowerPath = safePath.toLowerCase();
  if (
    safePath.startsWith('.') || 
    safePath.includes('/.') || 
    safePath.includes('\\.') || 
    lowerPath.includes('.env') || 
    lowerPath.includes('package.json') || 
    lowerPath.startsWith('node_modules') || 
    lowerPath.endsWith('.bat')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden: Akses ke file konfigurasi atau sistem diblokir.');
    return;
  }

  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${reqUrl}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('======================================================================');
  console.log('  Sistem Monitoring Kerawanan Satwa & Proteksi SUTT/SUTET');
  console.log('                 PLN UPT PALEMBANG');
  console.log(`  🌐 Server aktif di: http://localhost:${PORT}/`);
  console.log(`  🔐 Engine Auth: ${isMongoConnected ? 'MongoDB Cloud Atlas' : 'Local Fallback'}`);
  console.log('======================================================================');
});
