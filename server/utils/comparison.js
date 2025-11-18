const diffPercent = (next = 0, previous = 0) => Math.round((next - previous) * 10) / 10;

const buildProgressChanges = (a = {}, b = {}) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const deltas = {};
  keys.forEach((key) => {
    const delta = (b[key] || 0) - (a[key] || 0);
    if (delta !== 0) {
      deltas[key] = Math.round(delta);
    }
  });
  return deltas;
};

const compareAnalyses = (first, second) => {
  if (!first || !second) {
    return null;
  }

  return {
    comparisonId: `cmp-${Date.now()}`,
    baseline: {
      id: first.analysisId,
      completion: first.completion,
      timestamp: first.uploadedAt,
    },
    target: {
      id: second.analysisId,
      completion: second.completion,
      timestamp: second.uploadedAt,
    },
    delta: {
      completion: diffPercent(second.completion, first.completion),
      risksResolved: (first.risks || []).filter((risk) => !(second.risks || []).includes(risk)),
      newRisks: (second.risks || []).filter((risk) => !(first.risks || []).includes(risk)),
      progressByDiscipline: buildProgressChanges(first.progressByDiscipline, second.progressByDiscipline),
    },
  };
};

module.exports = compareAnalyses;

