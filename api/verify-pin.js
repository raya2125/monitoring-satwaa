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
  const enteredPin = String(body.pin || body.password || '').trim();
  const username = String(body.username || '').trim().toLowerCase();

  if (!enteredPin) {
    return res.status(400).json({ success: false, valid: false, message: 'Password atau PIN diperlukan.' });
  }

  // Hash SHA-256 dari input pengguna
  const enteredPinSha256 = crypto.createHash('sha256').update(enteredPin).digest('hex').toLowerCase();
  const enteredPinRawLower = enteredPin.toLowerCase();

  // Hash SHA-256 resmi untuk akun PLN UPT Palembang
  const SHA256_UPT_PALEMBAG = '34f62975d347fafd70ae76d9f49ba78a7f9d4623dec4a18d7fe64ab704d70a2f';
  const SHA256_UPT_PALEMBANG = 'a39fec3ccf58fd5b29346115ee1e7e3d20e947a86ff3ca1965a2b622fdfc24e6';

  const isPlnPasswordMatch = (
    enteredPinSha256 === SHA256_UPT_PALEMBAG ||
    enteredPinSha256 === SHA256_UPT_PALEMBANG ||
    enteredPinRawLower === SHA256_UPT_PALEMBAG ||
    enteredPinRawLower === SHA256_UPT_PALEMBANG ||
    enteredPinRawLower === 'upt palembag' ||
    enteredPinRawLower === 'upt palembang'
  );

  // 3. Verifikasi ke Database MongoDB jika Terhubung
  const conn = await connectToDatabase();
  if (conn && conn.db) {
    try {
      const colSupervisors = conn.db.collection('supervisors');
      const colAuditLogs = conn.db.collection('audit_logs');
      
      const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cleanUser = escapeRegex(username);
      const query = username 
        ? { $or: [{ username: username }, { username: new RegExp('^' + cleanUser + '$', 'i') }] }
        : { $or: [{ username: 'pln' }, { role: 'supervisor' }] };

      let supervisor = await colSupervisors.findOne(query);

      // Fallback query jika belum ketemu
      if (!supervisor && (username === 'pln' || !username)) {
        supervisor = await colSupervisors.findOne({ username: 'pln' });
      }
      if (!supervisor && (!username || username === 'supervisor' || username === 'admin')) {
        supervisor = await colSupervisors.findOne({ role: 'supervisor' });
      }

      if (supervisor) {
        let isMatch = false;

        // Cek SHA-256 untuk akun pln atau jika tersimpan hash SHA-256 di db
        if (supervisor.username === 'pln' || username === 'pln') {
          if (isPlnPasswordMatch) {
            isMatch = true;
          } else if (supervisor.sha256Hash && (enteredPinSha256 === supervisor.sha256Hash.toLowerCase() || enteredPinRawLower === supervisor.sha256Hash.toLowerCase())) {
            isMatch = true;
          }
        }

        // Cek Bcrypt atau PIN biasa
        if (!isMatch && supervisor.pinHash) {
          if (supervisor.pinHash.startsWith('$2')) {
            isMatch = bcrypt.compareSync(enteredPin, supervisor.pinHash);
          } else {
            isMatch = (enteredPin === supervisor.pinHash || enteredPin === (process.env.DEFAULT_SUPERVISOR_PIN || '1234'));
          }
        }

        // Cek jika mencocokkan password pln secara universal
        if (!isMatch && isPlnPasswordMatch) {
          isMatch = true;
        }

        if (isMatch) {
          resetFailedAttempts(clientIp);
          const sessionToken = 'PLN_AUTH_' + Date.now() + '_' + crypto.randomBytes(12).toString('hex');
          const finalUsername = supervisor.username || (username === 'pln' ? 'pln' : 'supervisor');

          // Catat audit log login sukses
          colAuditLogs.insertOne({
            action: 'LOGIN_SUPERVISOR_SUCCESS',
            username: finalUsername,
            name: supervisor.name || 'PLN UPT Palembang',
            ip: clientIp,
            hashAlgorithm: 'sha256',
            timestamp: new Date()
          }).catch(() => {});

          return res.status(200).json({
            success: true,
            valid: true,
            role: 'supervisor',
            username: finalUsername,
            name: supervisor.name || (finalUsername === 'pln' ? 'PLN UPT Palembang' : 'Supervisor UPT'),
            token: sessionToken,
            hashAlgorithm: 'sha256',
            source: 'mongodb'
          });
        } else {
          recordFailedAttempt(clientIp);

          colAuditLogs.insertOne({
            action: 'LOGIN_SUPERVISOR_FAILED',
            username: username || 'unknown',
            ip: clientIp,
            timestamp: new Date()
          }).catch(() => {});

          // Delay tiruan (artificial delay 500ms) untuk menggagalkan bot brute force
          await new Promise(r => setTimeout(r, 500));

          return res.status(401).json({
            success: false,
            valid: false,
            message: 'Username atau Password/PIN salah. (Gunakan username: pln & password: upt palembag)'
          });
        }
      }
    } catch (err) {
      console.error('[Verify PIN] Error MongoDB query:', err);
    }
  }

  // 4. Fallback jika MONGO_URI belum diisi atau server lokal
  const defaultPin = process.env.DEFAULT_SUPERVISOR_PIN || '1234';
  
  // Validasi akun PLN dengan SHA-256
  const isPlnFallbackMatch = (username === 'pln' || !username) && isPlnPasswordMatch;
  // Validasi supervisor default 1234
  const isDefaultFallbackMatch = (enteredPin === defaultPin) && (!username || username === 'supervisor' || username === 'admin');

  if (isPlnFallbackMatch || isDefaultFallbackMatch) {
    resetFailedAttempts(clientIp);
    const sessionToken = 'PLN_FALLBACK_' + Date.now();
    const finalUser = isPlnFallbackMatch ? 'pln' : (username || 'supervisor');
    return res.status(200).json({
      success: true,
      valid: true,
      role: 'supervisor',
      username: finalUser,
      name: finalUser === 'pln' ? 'PLN UPT Palembang' : 'Supervisor UPT',
      token: sessionToken,
      hashAlgorithm: 'sha256',
      source: 'fallback'
    });
  } else {
    recordFailedAttempt(clientIp);
    await new Promise(r => setTimeout(r, 500));
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Username atau Password/PIN salah. (Gunakan username: pln & password: upt palembag)'
    });
  }
};
