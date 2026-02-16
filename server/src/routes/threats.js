const express = require('express');
const { getThreatFeeds, getThreatById } = require('../data/threats');

const threatRouter = express.Router();

threatRouter.get('/feeds', (req, res) => {
  const limit = Math.min(Math.max(0, parseInt(req.query.limit, 10) || 50), 200);
  res.json(getThreatFeeds(limit));
});

threatRouter.get('/feeds/:id', (req, res) => {
  const item = getThreatById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

module.exports = { threatRouter };
