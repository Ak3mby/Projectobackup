const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static("views"));

// Conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "booleanware",
  ...(process.env.DB_SOCKET ? { socketPath: process.env.DB_SOCKET } : {}),
});

const asyncRoute = (handler) => (req, res) => {
  Promise.resolve(handler(req, res)).catch((error) => {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  });
};

// --- REPORTES ---
app.get("/api/reports", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
  res.json(rows);
}));

app.post("/api/reports", asyncRoute(async (req, res) => {
  const { player, infraccion, confianza = 0, verdict = "suspicious" } = req.body;
  await pool.query(
    "INSERT INTO reports (player, infraccion, confianza, verdict) VALUES (?, ?, ?, ?)",
    [player, infraccion, confianza, verdict]
  );
  res.json({ message: "Reporte creado" });
}));

app.get("/api/dashboard", asyncRoute(async (req, res) => {
  const [[stats]] = await pool.query(`
    SELECT COUNT(*) AS total_reports,
      ROUND(AVG(confianza), 1) AS average_confidence,
      SUM(verdict = 'cheater') AS cheaters,
      (SELECT COUNT(*) FROM sanctions WHERE DATE(created_at) = CURRENT_DATE) AS sanctions_today
    FROM reports
  `);
  const [appeals] = await pool.query("SELECT * FROM appeals WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5");
  res.json({ stats, appeals });
}));

// --- SANCIONES ---
app.get("/api/sanctions", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM sanctions ORDER BY created_at DESC");
  res.json(rows);
}));

app.post("/api/sanctions", asyncRoute(async (req, res) => {
  const { report_id, player, type } = req.body;
  await pool.query("INSERT INTO sanctions (report_id, player, type) VALUES (?, ?, ?)", [report_id || null, player, type]);
  await pool.query("INSERT INTO logs (action, user) VALUES (?, ?)", [`Sanción aplicada: ${type}`, player]);
  res.json({ message: "Sanción aplicada" });
}));

app.post("/api/sanction/:id", asyncRoute(async (req, res) => {
  const [[report]] = await pool.query("SELECT * FROM reports WHERE id = ?", [req.params.id]);
  if (!report) return res.status(404).json({ error: "Reporte no encontrado" });
  await pool.query("INSERT INTO sanctions (report_id, player, type) VALUES (?, ?, ?)", [report.id, report.player, report.infraccion]);
  await pool.query("INSERT INTO logs (action, user) VALUES (?, ?)", [`Sanción aplicada: ${report.infraccion}`, report.player]);
  res.json({ message: "Sanción aplicada" });
}));

// --- APELACIONES ---
app.get("/api/appeals", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM appeals ORDER BY created_at DESC");
  res.json(rows);
}));

app.post("/api/appeals", asyncRoute(async (req, res) => {
  const { player, reason } = req.body;
  await pool.query("INSERT INTO appeals (player, reason) VALUES (?, ?)", [player, reason]);
  await pool.query("INSERT INTO logs (action, user) VALUES (?, ?)", ["Apelación registrada", player]);
  res.json({ message: "Apelación registrada" });
}));

app.patch("/api/appeals/:id", asyncRoute(async (req, res) => {
  const { status } = req.body;
  await pool.query("UPDATE appeals SET status = ? WHERE id = ?", [status, req.params.id]);
  await pool.query("INSERT INTO logs (action, user) SELECT CONCAT('Apelación ', ?, ' revisada'), player FROM appeals WHERE id = ?", [status, req.params.id]);
  res.json({ message: "Apelación actualizada" });
}));

// --- AUDITORÍA ---
app.get("/api/logs", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM logs ORDER BY created_at DESC");
  res.json(rows);
}));

// --- INTEGRACIÓN API ---
app.get("/api/external", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM integrations ORDER BY name");
  res.json(rows);
}));

// --- CONFIGURACIÓN ---
app.get("/api/config", asyncRoute(async (req, res) => {
  const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings");
  res.json(Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value])));
}));

app.patch("/api/config", asyncRoute(async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [key, String(value)]);
  }
  res.json({ message: "Configuración guardada" });
}));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
