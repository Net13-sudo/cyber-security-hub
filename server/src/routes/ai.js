const express = require('express');
const { getAiResponse } = require('../services/ai');

const aiRouter = express.Router();

aiRouter.post('/chat', async (req, res) => {
  const { message, provider } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }
  try {
    const reply = await getAiResponse(message.trim(), provider || 'auto');
    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: 'AI service temporarily unavailable', reply: null });
  }
});

module.exports = { aiRouter };
