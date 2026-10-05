/**
 * =========================================================================
 * VERCEL SERVERLESS FUNCTION: /api/change-pin
 * =========================================================================
 * Mengubah PIN Supervisor di MongoDB dengan Enkripsi Bcrypt
 */

const { connectToDatabase, bcrypt } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const oldPin = String(body.oldPin || '').trim();
  const newPin = String(body.newPin || '').trim();

  if (!oldPin || !newPin) {
    return res.status(400).json({ success: false, message: 'PIN lama dan PIN baru wajib diisi.' });
  }

  if (newPin.length < 4) {
    return res.status(400).json({ success: false, message: 'PIN baru minimal 4 karakter.' });
  }

  const conn = await connectToDatabase();
  if (conn && conn.db) {
    try {
      const colSupervisors = conn.db.collection('supervisors');
      const supervisor = await colSupervisors.findOne({ role: 'supervisor' });
      if (!supervisor) {
        return res.status(404).json({ success: false, message: 'Akun supervisor tidak ditemukan di database.' });
      }

      const isMatch = bcrypt.compareSync(oldPin, supervisor.pinHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'PIN lama salah!' });
      }

      const newHash = bcrypt.hashSync(newPin, 10);
      await colSupervisors.updateOne(
        { _id: supervisor._id },
        { $set: { pinHash: newHash, updatedAt: new Date() } }
      );

      const colAuditLogs = conn.db.collection('audit_logs');
      colAuditLogs.insertOne({
        action: 'CHANGE_PIN_SUCCESS',
        name: supervisor.name,
        timestamp: new Date()
      }).catch(() => {});

      return res.status(200).json({ success: true, message: 'PIN Supervisor di MongoDB berhasil diperbarui!' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(400).json({ success: false, message: 'Database MongoDB belum terhubung.' });
};
