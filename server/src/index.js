require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { healthRouter } = require('./routes/health');
const { threatRouter } = require('./routes/threats');
const { incidentsRouter } = require('./routes/incidents');
const { aiRouter } = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/threat-intelligence', threatRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`Scorpion Security Hub API running at http://localhost:${PORT}`);
});
