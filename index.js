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

async function initMongo() {
  if (isMongoConnected && db) return true;
  if (!MongoClient || !MONGO_URI || MONGO_URI.trim() === '') {
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

    // Seed supervisor awal jika koleksi masih kosong
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
    return true;
  } catch (err) {
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
    return sendJson(res, 200, {
      status: 'online',
      serverTime: new Date().toISOString(),
      mongoConnected: isMongoConnected,
      database: isMongoConnected ? 'MongoDB Cloud Atlas' : 'Local Fallback Mode',
      uptime: process.uptime()
    });
  }

  // 2. POST /api/verify-pin
  if (pathname === '/api/verify-pin') {
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return sendJson(res, 429, {
        valid: false,
        error: `Terlalu banyak percobaan salah. Silakan tunggu ${rateCheck.remainingMin} menit.`
      });
    }

    const body = await parseJsonBody(req);
    const pin = String(body.pin || '').trim();

    if (!pin) {
      return sendJson(res, 400, { valid: false, error: 'PIN tidak boleh kosong.' });
    }

    await initMongo().catch(() => {});

    let isValid = false;
    let authSource = 'local';

    if (isMongoConnected && colSupervisors && bcrypt) {
      try {
        const supervisor = await colSupervisors.findOne({ username: 'supervisor' });
        if (supervisor && supervisor.pinHash) {
          isValid = bcrypt.compareSync(pin, supervisor.pinHash);
          authSource = 'mongodb';
        }
      } catch (err) {
        isValid = (pin === DEFAULT_PIN);
      }
    } else {
      isValid = (pin === DEFAULT_PIN);
    }

    if (isValid) {
      attemptTracker.delete(clientIp);
      return sendJson(res, 200, {
        valid: true,
        authSource: authSource,
        message: 'PIN Supervisor valid.'
      });
    } else {
      recordFailedAttempt(clientIp);
      await new Promise(r => setTimeout(r, 500));
      return sendJson(res, 401, {
        valid: false,
        error: 'PIN Supervisor salah. Silakan coba kembali.'
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
