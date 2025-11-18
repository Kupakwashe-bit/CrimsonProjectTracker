const express = require('express');

const router = express.Router();
const activityLogs = [];

router.get('/logs', (_, res) => {
  res.json({ logs: activityLogs });
});

router.post('/logs', (req, res) => {
  const { message, level } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    message,
    level: ['info', 'warn', 'error'].includes(level) ? level : 'info',
    timestamp: new Date().toISOString(),
  };

  activityLogs.unshift(entry);
  if (activityLogs.length > 200) {
    activityLogs.length = 200;
  }

  res.status(201).json({ log: entry });
});

module.exports = router;

