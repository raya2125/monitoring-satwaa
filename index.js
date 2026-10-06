/**
 * =========================================================================
 * SISTEM MONITORING KERAWANAN SATWA & PROTEKSI SUTT/SUTET PLN UPT PALEMBANG
 * NODE.JS + MONGODB SERVERLESS & LOCAL ENTRYPOINT (index.js)
 * =========================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// SHA-256 Constants
const SHA256_UPT_PALEMBAG = '34f62975d347fafd70ae76d9f49ba78a7f9d4623dec4a18d7fe64ab704d70a2f';
const SHA256_UPT_PALEMBANG = 'a39fec3ccf58fd5b29346115ee1e7e3d20e947a86ff3ca1965a2b622fdfc24e6';

// 1. Muat Environment Variables (.env lokal jika ada)
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
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
    } catch (e) {}
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '8080', 10);
const MONGO_URI = process.env.MONGO_URI || '';
const DEFAULT_PIN = process.env.DEFAULT_SUPERVISOR_PIN || '1234';

// 2. Muat Driver MongoDB & Bcrypt
let bcrypt = null;
let MongoClient = null;
try {
  bcrypt = require('bcryptjs');
} catch (e) {}
try {
  const mongoPkg = require('mongodb');
  MongoClient = mongoPkg.MongoClient;
} catch (e) {}

// State Koneksi MongoDB
let dbClient = null;
let db = null;
let colSupervisors = null;
let colAuditLogs = null;
let isMongoConnected = false;
let lastMongoError = null;

async function initMongo() {
  if (isMongoConnected && db) return true;
  if (!MongoClient) {
    lastMongoError = 'MongoClient not loaded';
    return false;
  }
  if (!MONGO_URI || MONGO_URI.trim() === '') {
    lastMongoError = 'MONGO_URI is empty or undefined';
    return false;
  }

  try {
    if (!dbClient) {
      dbClient = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10
      });
      await dbClient.connect();
    }
    const dbName = dbClient.options.dbName || 'trs_satwa_monitoring';
    db = dbClient.db(dbName);
    colSupervisors = db.collection('supervisors');
    colAuditLogs = db.collection('audit_logs');
    isMongoConnected = true;
    lastMongoError = null;

    // Seed supervisor & pln awal jika belum ada
    const count = await colSupervisors.countDocuments();
    if (count === 0 && bcrypt) {
      const hash = bcrypt.hashSync(DEFAULT_PIN, 10);
      await colSupervisors.insertOne({
        username: 'supervisor',
        name: 'Supervisor PLN UPT Palembang',
        role: 'supervisor',
        pinHash: hash,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Seed akun pln dengan SHA-256 hash (upt palembag)
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
    }
    return true;
  } catch (err) {
    lastMongoError = err.message;
    console.error('[MongoDB Error]', err.message);
    isMongoConnected = false;
    return false;
  }
}

// Inisialisasi koneksi awal di background
initMongo().catch(() => {});

// Rate Limiter
const attemptTracker = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const record = attemptTracker.get(ip) || { count: 0, resetTime: now + 15 * 60 * 1000 };
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + 15 * 60 * 1000;
  }
  if (record.count >= 5) {
    const remainingMin = Math.ceil((record.resetTime - now) / 60000);
    return { allowed: false, remainingMin };
  }
  return { allowed: true, record };
}
function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = attemptTracker.get(ip) || { count: 0, resetTime: now + 15 * 60 * 1000 };
  record.count += 1;
  attemptTracker.set(ip, record);
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Helper pencari file statis (kompatibel Vercel Lambda & Local)
function findStaticFile(safePath) {
  const cleanPath = String(safePath || '').replace(/^[\/\\]+/, '');
  const candidates = [
    path.join(__dirname, cleanPath),
    path.join(process.cwd(), cleanPath),
    path.resolve(cleanPath),
    path.join(__dirname, '..', cleanPath),
    path.join('/var/task', cleanPath)
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch (e) {}
  }
  return null;
}

// Helper parsing JSON body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// HTTP Server Handler
const server = http.createServer(async (req, res) => {
  // CORS Preflight
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

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // =========================================================================
  // API ROUTING
  // =========================================================================

  // 1. GET /api/status
  if (pathname === '/api/status') {
    await initMongo().catch(() => {});
    let cwdFiles = [];
    let dirnameFiles = [];
    try { cwdFiles = fs.readdirSync(process.cwd()); } catch(e) { cwdFiles = [e.message]; }
    try { dirnameFiles = fs.readdirSync(__dirname); } catch(e) { dirnameFiles = [e.message]; }
    return sendJson(res, 200, {
      status: 'online',
      serverTime: new Date().toISOString(),
      mongoUriSet: Boolean(process.env.MONGO_URI && process.env.MONGO_URI.trim() !== ''),
      mongoConnected: isMongoConnected,
      mongoError: lastMongoError,
      database: isMongoConnected ? 'MongoDB Cloud Atlas' : 'Local Fallback Mode',
      cwd: process.cwd(),
      cwdFiles: cwdFiles,
      dirname: __dirname,
      dirnameFiles: dirnameFiles
    });
  }

  // 2. POST /api/verify-pin & /api/auth/login
  if (pathname === '/api/verify-pin' || pathname === '/api/auth/verify-pin' || pathname === '/api/auth/login') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return sendJson(res, 429, {
        valid: false,
        success: false,
        error: `Terlalu banyak percobaan salah. Silakan tunggu ${rateCheck.remainingMin} menit.`
      });
    }

    await initMongo().catch(() => {});

    // Periksa rate limiting persisten di MongoDB (Tahan terhadap cold-start serverless)
    if (isMongoConnected && colAuditLogs) {
      try {
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
        const failCount = await colAuditLogs.countDocuments({
          action: 'LOGIN_SUPERVISOR_FAILED',
          ip: clientIp,
          timestamp: { $gte: fifteenMinAgo }
        });
        if (failCount >= 5) {
          return sendJson(res, 429, {
            valid: false,
            success: false,
            error: 'Terlalu banyak percobaan salah (Database Lock). Silakan tunggu 15 menit.'
          });
        }
      } catch (e) {}
    }

    const body = await parseJsonBody(req);
    const username = String(body.username || '').trim().toLowerCase();
    const pin = String(body.pin || body.password || '').trim();

    if (!pin) {
      return sendJson(res, 400, { valid: false, success: false, error: 'Password atau PIN tidak boleh kosong.' });
    }

    const inputSha256 = crypto.createHash('sha256').update(pin).digest('hex').toLowerCase();
    const inputRawLower = pin.toLowerCase();

    const isPlnPasswordMatch = (
      inputSha256 === SHA256_UPT_PALEMBAG ||
      inputSha256 === SHA256_UPT_PALEMBANG ||
      inputRawLower === SHA256_UPT_PALEMBAG ||
      inputRawLower === SHA256_UPT_PALEMBANG ||
      inputRawLower === 'upt palembag' ||
      inputRawLower === 'upt palembang'
    );

    let isValid = false;
    let authSource = 'local';
    let matchedUser = { 
      username: username === 'pln' ? 'pln' : (username || 'supervisor'), 
      name: (username === 'pln') ? 'PLN UPT Palembang' : 'Supervisor UPT', 
      role: 'supervisor' 
    };

    // Sanitasi Regex untuk Mencegah ReDoS (Regular Expression Denial of Service)
    const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (isMongoConnected && colSupervisors) {
      try {
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
              isValid = true;
            } else if (supervisor.sha256Hash && (inputSha256 === supervisor.sha256Hash.toLowerCase() || inputRawLower === supervisor.sha256Hash.toLowerCase())) {
              isValid = true;
            }
          }

          if (!isValid && supervisor.pinHash) {
            if (bcrypt && supervisor.pinHash.startsWith('$2')) {
              isValid = bcrypt.compareSync(pin, supervisor.pinHash);
            } else {
              isValid = (pin === supervisor.pinHash || pin === DEFAULT_PIN);
            }
          }

          if (!isValid && isPlnPasswordMatch) {
            isValid = true;
          }

          if (isValid) {
            authSource = 'mongodb';
            matchedUser = {
              username: supervisor.username || username || 'supervisor',
              name: supervisor.name || (supervisor.username === 'pln' ? 'PLN UPT Palembang' : 'Supervisor UPT'),
              role: supervisor.role || 'supervisor'
            };
          }
        }
      } catch (err) {
        // Fallback jika query mongo error
      }
    }

    // Fallback jika belum match dan offline/fallback
    if (!isValid) {
      const isPlnFallback = (username === 'pln' || !username) && isPlnPasswordMatch;
      const isDefaultFallback = (pin === DEFAULT_PIN) && (!username || username === 'supervisor' || username === 'admin');

      if (isPlnFallback) {
        isValid = true;
        authSource = 'fallback';
        matchedUser = { username: 'pln', name: 'PLN UPT Palembang', role: 'supervisor' };
      } else if (isDefaultFallback) {
        isValid = true;
        authSource = 'fallback';
        matchedUser = { username: username || 'supervisor', name: 'Supervisor UPT', role: 'supervisor' };
      }
    }

    if (isValid) {
      attemptTracker.delete(clientIp);
      if (isMongoConnected && colAuditLogs) {
        colAuditLogs.insertOne({
          action: 'LOGIN_SUPERVISOR_SUCCESS',
          ip: clientIp,
          username: matchedUser.username,
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
        authSource: authSource,
        hashAlgorithm: 'sha256',
        message: 'Login Supervisor berhasil.'
      });
    } else {
      recordFailedAttempt(clientIp);
      if (isMongoConnected && colAuditLogs) {
        colAuditLogs.insertOne({
          action: 'LOGIN_SUPERVISOR_FAILED',
          ip: clientIp,
          username: username || 'unknown',
          timestamp: new Date()
        }).catch(() => {});
      }

      await new Promise(r => setTimeout(r, 500));
      return sendJson(res, 401, {
        success: false,
        valid: false,
        error: 'Username atau Password/PIN salah. (Gunakan username: pln & password: upt palembag)'
      });
    }
  }

  // 3. POST /api/log-acc
  if (pathname === '/api/log-acc') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const body = await parseJsonBody(req);
    await initMongo().catch(() => {});

    const logEntry = {
      action: body.action || 'ACC_PROPOSAL',
      proposalId: body.proposalId || null,
      towerName: body.towerName || '-',
      jalur: body.jalur || '-',
      operatorName: body.operatorName || 'Anonim',
      supervisorName: body.supervisorName || 'Supervisor UPT',
      timestamp: new Date(),
      ipAddress: clientIp,
      details: body.details || {}
    };

    if (isMongoConnected && colAuditLogs) {
      try {
        await colAuditLogs.insertOne(logEntry);
      } catch (e) {}
    }

    return sendJson(res, 200, {
      status: 'success',
      loggedTo: isMongoConnected ? 'MongoDB' : 'Memory',
      timestamp: logEntry.timestamp
    });
  }

  // 4. POST /api/change-pin
  if (pathname === '/api/change-pin') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const body = await parseJsonBody(req);
    const oldPin = String(body.oldPin || '').trim();
    const newPin = String(body.newPin || '').trim();

    if (!newPin || newPin.length < 4) {
      return sendJson(res, 400, { error: 'PIN baru minimal 4 karakter.' });
    }

    await initMongo().catch(() => {});

    if (isMongoConnected && colSupervisors && bcrypt) {
      try {
        const supervisor = await colSupervisors.findOne({ username: 'supervisor' });
        if (!supervisor || !bcrypt.compareSync(oldPin, supervisor.pinHash)) {
          return sendJson(res, 401, { error: 'PIN lama salah.' });
        }
        const newHash = bcrypt.hashSync(newPin, 10);
        await colSupervisors.updateOne(
          { username: 'supervisor' },
          { $set: { pinHash: newHash, updatedAt: new Date() } }
        );
        return sendJson(res, 200, { status: 'success', message: 'PIN berhasil diperbarui di MongoDB.' });
      } catch (err) {
        return sendJson(res, 500, { error: 'Gagal memperbarui PIN di MongoDB.' });
      }
    } else {
      return sendJson(res, 400, { error: 'MongoDB belum terhubung, tidak dapat mengganti PIN.' });
    }
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const lowerPath = safePath.toLowerCase();

  // Proteksi file sensitif
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
    res.end('403 Forbidden');
    return;
  }

  const targetFile = findStaticFile(safePath.startsWith('/') ? safePath.slice(1) : safePath);

  if (!targetFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 Not Found: ${reqPath}`);
    return;
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const stats = fs.statSync(targetFile);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(targetFile).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

// Export untuk Vercel Serverless Function runtime
module.exports = server;

// Jalankan server jika dieksekusi langsung secara lokal (node index.js)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('======================================================================');
    console.log('  Sistem Monitoring Kerawanan Satwa & Proteksi SUTT/SUTET');
    console.log('                 PLN UPT PALEMBANG');
    console.log(`  🌐 Server aktif di: http://localhost:${PORT}/`);
    console.log('======================================================================');
  });
}
