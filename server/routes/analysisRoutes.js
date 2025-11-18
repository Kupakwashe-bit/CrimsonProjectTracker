const express = require('express');
const path = require('path');
const fs = require('fs');
const upload = require('../utils/storage');
const { runAnalysis } = require('../analysis/analyzer');
const { addAnalysis, getProjectHistory, findAnalysisById } = require('../utils/historyStore');
const compareAnalyses = require('../utils/comparison');

const router = express.Router();

router.post('/upload', upload.single('project'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No project file provided' });
    }

    const projectId = req.body.projectId || path.parse(req.file.originalname).name;
    const analysis = await runAnalysis(req.file, { projectId });

    addAnalysis(projectId, analysis);

    return res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze project' });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

router.get('/history/:projectId', (req, res) => {
  const history = getProjectHistory(req.params.projectId);
  res.json({ history });
});

router.post('/compare', (req, res) => {
  const { projectId, analysisA, analysisB } = req.body || {};
  if (!projectId || !analysisA || !analysisB) {
    return res.status(400).json({ error: 'projectId, analysisA, and analysisB are required' });
  }

  const first = findAnalysisById(projectId, analysisA);
  const second = findAnalysisById(projectId, analysisB);
  if (!first || !second) {
    return res.status(404).json({ error: 'Analyses not found for comparison' });
  }

  const comparison = compareAnalyses(first, second);
  res.json(comparison);
});

module.exports = router;

