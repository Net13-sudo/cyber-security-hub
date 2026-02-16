const incidents = [
  {
    id: '1',
    title: 'Suspicious lateral movement detected',
    description: 'Multiple failed logins followed by successful access from new IP.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    assignedTo: 'SOC Team',
    reportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 2;

function listIncidents({ status, limit }) {
  let list = status
    ? incidents.filter((i) => i.status.toUpperCase() === status.toUpperCase())
    : [...incidents];
  list = list.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  return list.slice(0, limit);
}

function getIncidentById(id) {
  return incidents.find((i) => i.id === id) || null;
}

function createIncident({ title, description, severity, assignedTo }) {
  const now = new Date().toISOString();
  const newIncident = {
    id: String(nextId++),
    title,
    description: description || '',
    severity,
    status: 'OPEN',
    assignedTo: assignedTo || '',
    reportedAt: now,
    updatedAt: now,
  };
  incidents.push(newIncident);
  return newIncident;
}

function updateIncidentStatus(id, status) {
  const incident = incidents.find((i) => i.id === id);
  if (!incident) return null;
  incident.status = status;
  incident.updatedAt = new Date().toISOString();
  return incident;
}

module.exports = {
  listIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
};
