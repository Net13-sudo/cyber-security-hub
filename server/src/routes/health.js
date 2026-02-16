const express = require('express');
const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'scorpion-security-hub',
    version: '1.0.0',
    backend: 'node',
  });
});

module.exports = { healthRouter };
