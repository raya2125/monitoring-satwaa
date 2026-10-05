/**
 * =========================================================================
 * VERCEL SERVERLESS FUNCTION: /api/log-acc
 * =========================================================================
 * Mencatat jejak rekam aksi persetujuan (ACC) ke koleksi audit_logs MongoDB
 */

const { connectToDatabase } = require('./_db');

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

  const conn = await connectToDatabase();
  if (conn && conn.db) {
    try {
      const colAuditLogs = conn.db.collection('audit_logs');
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
      return res.status(200).json({ success: true, message: 'Audit log tercatat di MongoDB' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(200).json({ success: true, message: 'Mode fallback (MongoDB offline)' });
};
