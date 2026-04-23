const express = require('express');
const path = require('node:path');

const app = express();
const port = Number(process.env.WEB_PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const publicDir = path.resolve(__dirname, 'public');
const isProduction = process.env.NODE_ENV === 'production';

app.get('/health', (req, res) => {
  res.json({ service: 'web', ok: true });
});

app.get('/config.js', (req, res) => {
  const apiBase = process.env.CEPETS_API_URL || (isProduction ? '/api' : 'http://localhost:4000/api');
  res.type('application/javascript');
  res.send(`window.__CEPETS_API__ = ${JSON.stringify(apiBase)};`);
});

app.use(express.static(publicDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, host, () => {
  console.log(`Frontend web escuchando en http://${host}:${port}`);
});
