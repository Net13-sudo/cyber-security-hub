const express = require('express');
const {
  listIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
} = require('../data/incidents');

const incidentsRouter = express.Router();

incidentsRouter.get('/', (req, res) => {
  const rawStatus = req.query.status;
  const status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus.trim() : null;
  const limit = Math.min(Math.max(0, parseInt(req.query.limit, 10) || 100), 200);
  res.json(listIncidents({ status, limit }));
});

incidentsRouter.get('/:id', (req, res) => {
  const item = getIncidentById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

incidentsRouter.post('/', (req, res) => {
  const { title, description, severity, assignedTo } = req.body || {};
  const t = typeof title === 'string' ? title.trim() : '';
  const s = typeof severity === 'string' ? severity.trim() : '';
  if (!t || !s) {
    return res.status(400).json({ error: 'title and severity are required' });
  }
  const created = createIncident({
    title: t.slice(0, 255),
    description: typeof description === 'string' ? description.trim().slice(0, 2000) : '',
    severity: s.slice(0, 50),
    assignedTo: typeof assignedTo === 'string' ? assignedTo.trim().slice(0, 100) : '',
  });
  res.status(201).json(created);
});

incidentsRouter.patch('/:id/status', (req, res) => {
  const raw = req.query.status ?? req.body?.status;
  const status = typeof raw === 'string' ? raw.trim() : '';
  if (!status) return res.status(400).json({ error: 'status is required' });
  const updated = updateIncidentStatus(req.params.id, status.slice(0, 50));
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

module.exports = { incidentsRouter };
