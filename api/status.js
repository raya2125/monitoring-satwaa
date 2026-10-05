/**
 * =========================================================================
 * VERCEL SERVERLESS FUNCTION: /api/status
 * =========================================================================
 * Cek status kesehatan koneksi database MongoDB Atlas & environment
 */

const { connectToDatabase } = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const conn = await connectToDatabase();
  const isConnected = Boolean(conn && conn.db);

  let supervisorCount = 0;
  let logCount = 0;

  if (isConnected) {
    try {
      supervisorCount = await conn.db.collection('supervisors').countDocuments();
      logCount = await conn.db.collection('audit_logs').countDocuments();
    } catch (e) {}
  }

  return res.status(200).json({
    status: 'ok',
    environment: 'Vercel Serverless',
    mongoConnected: isConnected,
    database: isConnected ? conn.db.databaseName : 'Belum Terhubung (Isi MONGO_URI)',
    authEngine: isConnected ? 'MongoDB Atlas (Bcrypt Hash)' : 'Local / Apps Script Fallback',
    stats: {
      supervisors: supervisorCount,
      auditLogs: logCount
    },
    timestamp: new Date().toISOString()
  });
};
