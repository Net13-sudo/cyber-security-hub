require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { healthRouter } = require('./routes/health');
const { threatRouter } = require('./routes/threats');
const { incidentsRouter } = require('./routes/incidents');
const { aiRouter } = require('./routes/ai');
const { authRouter } = require('./routes/auth');
const { adminRouter } = require('./routes/admin');
const { libraryRouter } = require('./routes/library');
const { researchRouter } = require('./routes/research');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../')));

app.use('/api', healthRouter);
app.use('/api/threat-intelligence', threatRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/library', libraryRouter);
app.use('/api/research', researchRouter);

module.exports = app;

if (require.main === module) {
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`[Server] Scorpion Security Hub API running on port ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[Server] Port ${port} is already in use. Trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('[Server] Error starting server:', err);
      }
    });
  };

  startServer(PORT);
}
