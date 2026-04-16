const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { buildServiceUrl, nowIso } = require('../../../packages/shared/src');

const app = express();
const port = Number(process.env.GATEWAY_PORT || process.env.PORT || 4000);

function createServiceProxy(target, servicePrefix) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite(path) {
      return path === '/' ? `/${servicePrefix}` : `/${servicePrefix}${path}`;
    },
    proxyTimeout: 10000,
    onError(error, req, res) {
      res.status(502).json({
        message: 'No fue posible contactar el microservicio solicitado.',
        detail: error.message
      });
    }
  });
}

app.use(cors());

app.get('/health', (req, res) => {
  res.json({ service: 'gateway', ok: true, time: nowIso() });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    gateway: 'online',
    services: {
      auth: buildServiceUrl('AUTH_SERVICE_URL', 4101),
      users: buildServiceUrl('USER_SERVICE_URL', 4102),
      pets: buildServiceUrl('PET_SERVICE_URL', 4103),
      images: buildServiceUrl('IMAGE_SERVICE_URL', 4104),
      adoptions: buildServiceUrl('ADOPTION_SERVICE_URL', 4105)
    }
  });
});

app.use('/api/auth', createServiceProxy(buildServiceUrl('AUTH_SERVICE_URL', 4101), 'auth'));
app.use('/api/users', createServiceProxy(buildServiceUrl('USER_SERVICE_URL', 4102), 'users'));
app.use('/api/pets', createServiceProxy(buildServiceUrl('PET_SERVICE_URL', 4103), 'pets'));
app.use('/api/images', createServiceProxy(buildServiceUrl('IMAGE_SERVICE_URL', 4104), 'images'));
app.use('/api/adoptions', createServiceProxy(buildServiceUrl('ADOPTION_SERVICE_URL', 4105), 'adoptions'));

app.listen(port, () => {
  console.log(`Gateway escuchando en el puerto ${port}`);
});
