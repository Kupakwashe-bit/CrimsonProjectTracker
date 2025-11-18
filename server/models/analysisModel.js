const createAnalysisRecord = (payload = {}) => {
  const timestamp = new Date().toISOString();
  const projectId = payload.projectId || payload.projectName || `proj-${Date.now()}`;

  return {
    projectId,
    analysisId: payload.analysisId || `${projectId}-${Date.now()}`,
    uploadedAt: payload.uploadedAt || timestamp,
    projectName: payload.projectName || projectId,
    completion: payload.completion ?? 0,
    summary: payload.summary || '',
    missingComponents: payload.missingComponents || [],
    recommendedTasks: payload.recommendedTasks || [],
    risks: payload.risks || [],
    timelineEstimate: payload.timelineEstimate || '',
    techStack: payload.techStack || [],
    progressByDiscipline: payload.progressByDiscipline || {},
    insights: payload.insights || {},
    activityHeatmap: payload.activityHeatmap || [],
    securityConcerns: payload.securityConcerns || [],
    performanceIssues: payload.performanceIssues || [],
  };
};

module.exports = createAnalysisRecord;

