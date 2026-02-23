require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const app = express();

// ── Middleware global ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas ──────────────────────────────────────────────────────
app.use('/api', require('./routes'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Error handler global ───────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status  = err.status || 500;
  const message = err.message || 'Erro interno do servidor.';

  if (process.env.NODE_ENV !== 'production' && status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🦷 DentalContent Pro API rodando na porta ${PORT}`);
});

module.exports = app;
