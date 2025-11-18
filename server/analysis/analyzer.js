const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const createAnalysisRecord = require('../models/analysisModel');

const geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const TEXT_EXTENSIONS = /\.(js|ts|jsx|tsx|py|rb|java|cs|json|md|txt|html|css|scss|sass|less|yaml|yml)$/i;

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const synthesizeActivity = () =>
  Array.from({ length: 14 }).map((_, index) => ({
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    focus: ['Frontend', 'Backend', 'Documentation', 'Testing'][index % 4],
    value: randomBetween(15, 95),
    risk: Math.random() > 0.85,
  }));

const detectStackFromName = (filename = '') => {
  const lowercase = filename.toLowerCase();
  if (lowercase.includes('react') || lowercase.endsWith('.jsx') || lowercase.endsWith('.tsx')) {
    return ['React', 'JavaScript'];
  }
  if (lowercase.includes('next')) return ['Next.js', 'TypeScript'];
  if (lowercase.includes('py') || lowercase.endsWith('.py')) return ['Python', 'FastAPI'];
  if (lowercase.includes('api') || lowercase.endsWith('.ts')) return ['TypeScript', 'Node.js'];
  return ['Unknown'];
};

const STATUS_VALUES = new Set(['todo', 'in-progress', 'blocked', 'done']);
const PRIORITY_VALUES = new Set(['high', 'medium', 'low']);

const normalizeTasks = (tasks = []) =>
  tasks
    .filter(Boolean)
    .map((task, index) => {
      const rawStatus = (task.status || task.state || 'todo').toString().toLowerCase();
      const status = STATUS_VALUES.has(rawStatus) ? rawStatus : 'todo';
      const rawPriority = (task.priority || 'medium').toString().toLowerCase();
      const priority = PRIORITY_VALUES.has(rawPriority) ? rawPriority : 'medium';

      return {
        id: task.id || task.taskId || `llm-task-${Date.now()}-${index}`,
        title: task.title || task.task || `Task ${index + 1}`,
        status,
        priority,
        detail: task.detail || task.description || '',
      };
    });
const sanitizeProgress = (progress = {}) => {
  const normalized = {};
  Object.entries(progress).forEach(([key, value]) => {
    if (!key) return;
    normalized[key.toLowerCase()] = clampPercentage(value);
  });

  const keys = ['frontend', 'backend', 'testing', 'documentation', 'ops'];
  return keys.reduce((acc, key) => {
    acc[key] = normalized[key] ?? 0;
    return acc;
  }, {});
};

const sanitizeHeatmap = (heatmap = []) =>
  heatmap.slice(0, 30).map((entry, index) => ({
    date: entry.date || new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    focus: entry.focus || entry.area || 'Frontend',
    value: clampPercentage(entry.value ?? entry.intensity ?? 0),
    risk: Boolean(entry.risk ?? entry.isRisk ?? false),
  }));


const clampPercentage = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

const toNumberOrNull = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const extractJson = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (innerError) {
      return null;
    }
  }
};

const readTextPreview = (filePath, limit = 16_000) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('utf8', 0, limit);
  } catch (error) {
    return null;
  }
};

const buildZipContext = (filePath) => {
  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    const manifest = entries.slice(0, 80).map((entry) => `${entry.entryName}${entry.isDirectory ? '/' : ''}`);
    const sampleFiles = entries
      .filter(
        (entry) =>
          !entry.isDirectory &&
          TEXT_EXTENSIONS.test(entry.entryName) &&
          entry.header.size > 0 &&
          entry.header.size < 1024 * 200,
      )
      .slice(0, 5)
      .map((entry) => {
        const data = entry.getData();
        const snippet = data.toString('utf8', 0, 800);
        return `File: ${entry.entryName}\n${snippet}`;
      });

    return {
      context: `Project manifest:\n${manifest.join('\n')}\n\nSample files:\n${sampleFiles.join('\n----\n')}`,
      stats: { files: entries.length },
    };
  } catch (error) {
    return { context: 'Unable to inspect archive contents.', stats: {} };
  }
};

const buildFileContext = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.zip') {
    return buildZipContext(file.path);
  }

  if (TEXT_EXTENSIONS.test(ext)) {
    return {
      context: `Primary file preview:\n${readTextPreview(file.path) || 'No readable content available.'}`,
      stats: { files: 1 },
    };
  }

  return {
    context: `Uploaded file ${file.originalname} (${file.mimetype}, ${file.size} bytes).`,
    stats: { files: 1 },
  };
};

const buildPrompt = ({ projectName, contextSnippet }) => `You are Krimson Project Tracker, a senior AI systems analyst.
You will receive snippets of a repository (structure manifest plus highlighted files). Infer the tech stack, completeness, missing deliverables, risks, blockers, and execution plan.

ONLY respond with minified JSON that EXACTLY follows this schema (no backticks, no prose):
{
  "projectName": "${projectName}",
  "completion": 0-100,
  "summary": "string",
  "missingComponents": ["string"],
  "recommendedTasks": [
    {"title":"string","status":"todo|in-progress|blocked|done","priority":"high|medium|low","detail":"string"}
  ],
  "risks": ["string"],
  "timelineEstimate": "string",
  "techStack": ["string"],
  "progressByDiscipline": {
    "frontend": 0-100,
    "backend": 0-100,
    "testing": 0-100,
    "documentation": 0-100,
    "ops": 0-100
  },
  "insights": {
    "totalFiles": number,
    "todoCount": number,
    "documentation": "incomplete|partial|complete",
    "detectedLanguage": "string"
  },
  "activityHeatmap": [
    {"date":"YYYY-MM-DD","focus":"Frontend|Backend|Testing|Documentation|Ops","value":0-100,"risk":true|false}
  ],
  "securityConcerns": ["string"],
  "performanceIssues": ["string"]
}

Context to analyze:
${contextSnippet}`;

const analyzeWithGemini = async ({ projectName, contextSnippet, projectId, stats, filename }) => {
  if (!geminiClient) return null;

  const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = buildPrompt({ projectName, contextSnippet });
  const result = await model.generateContent(prompt);
  const text = result.response?.text();
  const json = extractJson(text);

  if (!json) {
    throw new Error('Unable to parse Gemini response as JSON');
  }

  const recommendedTasks = normalizeTasks(json.recommendedTasks);
  const progressByDiscipline = sanitizeProgress(json.progressByDiscipline || json.progressInsights || {});
  const activityHeatmap =
    Array.isArray(json.activityHeatmap) && json.activityHeatmap.length
      ? sanitizeHeatmap(json.activityHeatmap)
      : synthesizeActivity();

  const insights = {
    totalFiles: toNumberOrNull(json.insights?.totalFiles) ?? stats?.files ?? 0,
    todoCount: toNumberOrNull(json.insights?.todoCount ?? json.todoCount) ?? 0,
    documentation: json.insights?.documentation || json.documentation || json.documentationStatus || 'unknown',
    detectedLanguage: json.insights?.detectedLanguage || detectStackFromName(filename)[0],
  };

  return createAnalysisRecord({
    projectId,
    projectName,
    completion: clampPercentage(json.completion ?? json.completionEstimate),
    summary: json.summary || json.projectSummary || '',
    missingComponents: json.missingComponents || json.missing || [],
    recommendedTasks: recommendedTasks.length ? recommendedTasks : undefined,
    risks: json.risks || [],
    timelineEstimate: json.timelineEstimate || json.timeline || '',
    techStack: json.techStack && json.techStack.length ? json.techStack : detectStackFromName(filename),
    progressByDiscipline,
    insights,
    activityHeatmap,
    securityConcerns: json.securityConcerns || [],
    performanceIssues: json.performanceIssues || [],
  });
};

const buildMockAnalysis = (file, projectId) => {
  const projectName = path.parse(file.originalname).name;
  const completion = randomBetween(55, 92);
  const missingComponents = ['Unit tests', 'Error boundaries', 'Auth hardening'].slice(0, randomBetween(1, 3));
  const risks = [
    'Authentication flow missing token refresh',
    'Deployment config not detected',
    'API error handling incomplete',
  ].slice(0, randomBetween(1, 3));
  const recommendedTasks = [
    { id: 'ai-1', title: 'Harden API validation', status: 'todo', priority: 'high', detail: 'Validate payloads on server' },
    { id: 'ai-2', title: 'Wire up integration tests', status: 'todo', priority: 'medium', detail: 'Cover core endpoints' },
    { id: 'ai-3', title: 'Document deployment steps', status: 'in-progress', priority: 'medium' },
  ];

  return createAnalysisRecord({
    projectId,
    projectName,
    completion,
    summary: `Project ${projectName} shows ${completion}% completion. Core flows are present, but automation and hardening require attention.`,
    missingComponents,
    recommendedTasks,
    risks,
    timelineEstimate: `${randomBetween(1, 4)}-week window`,
    techStack: detectStackFromName(file.originalname),
    progressByDiscipline: {
      frontend: randomBetween(60, 95),
      backend: randomBetween(55, 90),
      testing: randomBetween(20, 60),
      documentation: randomBetween(35, 70),
      ops: randomBetween(30, 65),
    },
    insights: {
      totalFiles: randomBetween(30, 180),
      todoCount: randomBetween(2, 14),
      documentation: ['incomplete', 'partial', 'complete'][randomBetween(0, 2)],
      detectedLanguage: detectStackFromName(file.originalname)[0],
    },
    activityHeatmap: synthesizeActivity(),
    securityConcerns: ['Input sanitization', 'Rate limiting'].slice(0, randomBetween(0, 2)),
    performanceIssues: ['Bundle size optimization', 'Database indexing'].slice(0, randomBetween(0, 2)),
  });
};

const runAnalysis = async (file, { projectId }) => {
  const projectName = path.parse(file.originalname).name;
  const { context, stats } = buildFileContext(file);

  if (geminiClient) {
    try {
      const llmAnalysis = await analyzeWithGemini({
        projectName,
        contextSnippet: context,
        projectId,
        stats,
        filename: file.originalname,
      });
      if (llmAnalysis) {
        return llmAnalysis;
      }
    } catch (error) {
      console.warn('Gemini analysis failed, using mock output instead:', error.message);
    }
  }

  return buildMockAnalysis(file, projectId);
};

module.exports = {
  runAnalysis,
};

