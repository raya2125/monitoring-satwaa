/**
 * =========================================================================
 * VERCEL SERVERLESS FUNCTION: /api/verify-pin
 * =========================================================================
 * Verifikasi PIN Supervisor dengan Enkripsi Bcrypt + Anti Brute-Force Rate Limiter
 */

const crypto = require('crypto');
const { 
  connectToDatabase, 
  bcrypt, 
  checkRateLimit, 
  recordFailedAttempt, 
  resetFailedAttempts 
} = require('./_db');

module.exports = async (req, res) => {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // 1. Deteksi IP Klien untuk Anti Brute-Force
  const clientIp = req.headers['x-forwarded-for'] 
    ? String(req.headers['x-forwarded-for']).split(',')[0].trim() 
    : (req.socket.remoteAddress || 'unknown');

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan salah! Akun dikunci sementara. Silakan tunggu ${rateCheck.remainingMin} menit lagi.`
    });
  }

  // 2. Baca Body Request
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  const enteredPin = String(body.pin || '').trim();

  if (!enteredPin) {
    return res.status(400).json({ success: false, message: 'PIN diperlukan.' });
  }

  // 3. Verifikasi ke Database MongoDB jika Terhubung
  const conn = await connectToDatabase();
  if (conn && conn.db) {
    try {
      const colSupervisors = conn.db.collection('supervisors');
      const colAuditLogs = conn.db.collection('audit_logs');
      const supervisor = await colSupervisors.findOne({ role: 'supervisor' });

      if (supervisor) {
        let isMatch = false;
        if (supervisor.pinHash && supervisor.pinHash.startsWith('$2')) {
          isMatch = bcrypt.compareSync(enteredPin, supervisor.pinHash);
        } else {
          isMatch = enteredPin === supervisor.pinHash;
        }

        if (isMatch) {
          resetFailedAttempts(clientIp);
          const sessionToken = 'PLN_AUTH_' + Date.now() + '_' + crypto.randomBytes(12).toString('hex');

          // Catat audit log login sukses
          colAuditLogs.insertOne({
            action: 'LOGIN_SUPERVISOR_SUCCESS',
            name: supervisor.name,
            ip: clientIp,
            timestamp: new Date()
          }).catch(() => {});

          return res.status(200).json({
            success: true,
            role: 'supervisor',
            name: supervisor.name,
            token: sessionToken,
            source: 'mongodb'
          });
        } else {
          recordFailedAttempt(clientIp);

          colAuditLogs.insertOne({
            action: 'LOGIN_SUPERVISOR_FAILED',
            ip: clientIp,
            timestamp: new Date()
          }).catch(() => {});

          // Delay tiruan (artificial delay 500ms) untuk menggagalkan bot brute force
          await new Promise(r => setTimeout(r, 500));

          return res.status(401).json({
            success: false,
            message: 'PIN Supervisor tidak sesuai dengan database MongoDB.'
          });
        }
      }
    } catch (err) {
      console.error('[Verify PIN] Error MongoDB query:', err);
    }
  }

  // 4. Fallback jika MONGO_URI belum diisi
  const defaultPin = process.env.DEFAULT_SUPERVISOR_PIN || '1234';
  const isMatchFallback = enteredPin === defaultPin;

  if (isMatchFallback) {
    resetFailedAttempts(clientIp);
    const sessionToken = 'PLN_FALLBACK_' + Date.now();
    return res.status(200).json({
      success: true,
      role: 'supervisor',
      name: 'Supervisor (Fallback Mode)',
      token: sessionToken,
      source: 'fallback'
    });
  } else {
    recordFailedAttempt(clientIp);
    await new Promise(r => setTimeout(r, 500));
    return res.status(401).json({
      success: false,
      message: 'PIN salah (Default: 1234).'
    });
  }
};
