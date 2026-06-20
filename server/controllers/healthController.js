export function getHealth(req, res) {
  res.json({
    name: 'Jejak Saku API',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
