const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analysisRoutes = require('./routes/analysisRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_, res) => res.json({ status: 'Server is running' }));
app.use('/api/analysis', analysisRoutes);
app.use('/api/activity', activityRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
