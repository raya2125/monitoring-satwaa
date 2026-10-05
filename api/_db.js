/**
 * =========================================================================
 * VERCEL SERVERLESS: MONGODB CONNECTION CACHING & AUTH HELPER
 * =========================================================================
 * Menggunakan pola caching koneksi MongoDB Serverless agar tidak membuat
 * koneksi baru pada setiap pemanggilan fungsi (Cold-Start Optimization).
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.trim() === '') {
    return null;
  }

  if (cachedClient && cachedDb) {
    try {
      // Tes koneksi singkat
      await cachedDb.command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (e) {
      cachedClient = null;
      cachedDb = null;
    }
  }

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    await client.connect();
    const dbName = client.options.dbName || 'trs_satwa_monitoring';
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    // Inisialisasi supervisor default jika database baru
    const colSupervisors = db.collection('supervisors');
    const count = await colSupervisors.countDocuments();
    if (count === 0) {
      const defaultPin = process.env.DEFAULT_SUPERVISOR_PIN || '1234';
      const pinHash = bcrypt.hashSync(defaultPin, 10);
      await colSupervisors.insertOne({
        username: 'supervisor',
        name: 'Supervisor PLN UPT Palembang',
        role: 'supervisor',
        pinHash: pinHash,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return { client, db };
  } catch (err) {
    console.error('[Vercel DB] Gagal terhubung ke MongoDB:', err.message);
    return null;
  }
}

// In-Memory Rate Limiter Sederhana untuk mencegah Brute-Force tebakan PIN
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

function resetFailedAttempts(ip) {
  attemptTracker.delete(ip);
}

module.exports = {
  connectToDatabase,
  bcrypt,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts
};
