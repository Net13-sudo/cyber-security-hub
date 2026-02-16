const threatFeeds = [
  { id: '1', source: 'CISA', title: 'Critical RCE in Apache Log4j', severity: 'CRITICAL', type: 'Vulnerability', description: 'Remote code execution in Log4j 2.x. Apply patches immediately.', publishedAt: new Date().toISOString() },
  { id: '2', source: 'NIST NVD', title: 'OpenSSH privilege escalation', severity: 'HIGH', type: 'Vulnerability', description: 'Privilege escalation in OpenSSH server. Update to latest version.', publishedAt: new Date().toISOString() },
  { id: '3', source: 'MITRE ATT&CK', title: 'T1566 - Phishing', severity: 'MEDIUM', type: 'Tactic', description: 'Adversaries send phishing messages to gain access to victim systems.', publishedAt: new Date().toISOString() },
  { id: '4', source: 'AlienVault OTX', title: 'New C2 infrastructure', severity: 'HIGH', type: 'IOC', description: 'New command-and-control servers linked to known APT group.', publishedAt: new Date().toISOString() },
  { id: '5', source: 'Scorpion TI', title: 'Ransomware campaign targeting healthcare', severity: 'CRITICAL', type: 'Campaign', description: 'Active ransomware campaign targeting healthcare sector. IoCs available.', publishedAt: new Date().toISOString() },
];

function getThreatFeeds(limit = 50) {
  return threatFeeds.slice(0, limit);
}

function getThreatById(id) {
  return threatFeeds.find((f) => f.id === id) || null;
}

module.exports = { getThreatFeeds, getThreatById };
