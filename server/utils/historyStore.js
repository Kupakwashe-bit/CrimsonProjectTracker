const MAX_HISTORY = 8;
const historyMap = new Map();

const addAnalysis = (projectId, analysis) => {
  if (!projectId || !analysis) return;
  const records = historyMap.get(projectId) || [];
  const updated = [analysis, ...records].slice(0, MAX_HISTORY);
  historyMap.set(projectId, updated);
};

const getProjectHistory = (projectId) => {
  if (!projectId) return [];
  return historyMap.get(projectId) || [];
};

const findAnalysisById = (projectId, analysisId) => {
  const history = getProjectHistory(projectId);
  return history.find((entry) => entry.analysisId === analysisId);
};

module.exports = {
  addAnalysis,
  getProjectHistory,
  findAnalysisById,
};

