import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock3, FileStack, Layers, ShieldAlert, Zap } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import SectionHeader from '../components/common/SectionHeader';
import AIInsightsPanel from '../components/insights/AIInsightsPanel';
import TaskBoard from '../components/tasks/TaskBoard';
import ActivityHeatmap from '../components/heatmap/ActivityHeatmap';
import VoiceCommandIndicator from '../components/voice/VoiceCommandIndicator';
import GravityZone from '../components/gravity/GravityZone';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { formatPercentage } from '../utils/formatters';

const fallbackHeatmap = Array.from({ length: 14 }).map((_, index) => ({
  date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
  focus: ['Frontend', 'Backend', 'Docs', 'Tests'][index % 4],
  value: 20 + Math.random() * 70,
  risk: Math.random() > 0.8,
}));

const Dashboard = () => {
  const { analysis, setAnalysis, setLastVoiceText } = useAnalysis();
  const [tasks, setTasks] = useState(analysis?.recommendedTasks || []);
  const [isGravityEnabled, setIsGravityEnabled] = useState(false);

  useEffect(() => {
    if (analysis?.recommendedTasks) {
      setTasks(analysis.recommendedTasks);
    }
  }, [analysis]);
  const { speak, stop, isSpeaking, supported } = useVoiceFeedback({ rate: 1.05, pitch: 1.02 });

  const { isListening, supported: commandSupported, lastCommand } = useVoiceCommands({
    enabled: Boolean(analysis),
    onCommand: (slot) => {
      if (!analysis) return;
      if (slot === 'tasks') {
        triggerVoicePlayback(
          `You have ${tasks.length} tracked tasks. ${tasks
            .slice(0, 3)
            .map((task) => `${task.title} marked ${task.status || 'todo'}`)
            .join('. ')}`,
        );
      }
      if (slot === 'overview' || slot === 'overview dashboard') {
        triggerVoicePlayback(buildVoiceSummary());
      }
    },
  });

  const triggerVoicePlayback = (text) => {
    if (!supported || !text) return;
    if (isSpeaking) {
      stop();
      return;
    }
    speak(text);
    setLastVoiceText(text);
  };

  const buildVoiceSummary = () => {
    if (!analysis) return '';
    const completion = formatPercentage(analysis.completion ?? 0);
    const missing = analysis.missingComponents?.slice(0, 2).join(', ') || 'no critical modules missing';
    const risk = analysis.risks?.[0] || 'no major risks detected';
    return `Project ${analysis.projectName || 'Krimson build'} is ${completion} complete. Missing modules: ${missing}. Primary risk: ${risk}. Timeline estimate: ${analysis.timelineEstimate || 'not available'}.`;
  };

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    triggerVoicePlayback(buildVoiceSummary());
  };

  const handleTasksChange = (next) => {
    setTasks(next);
    if (analysis) {
      setAnalysis({ ...analysis, recommendedTasks: next });
    }
  };

  const metrics = useMemo(
    () => [
      {
        label: 'Completion',
        value: formatPercentage(analysis?.completion ?? 0),
        detail: 'LLM confidence model',
        icon: CheckCircle2,
      },
      {
        label: 'Detected files',
        value: analysis?.insights?.totalFiles || 0,
        detail: 'Structural index',
        icon: FileStack,
      },
      {
        label: 'Missing modules',
        value: analysis?.missingComponents?.length || 0,
        detail: 'Critical coverage',
        icon: Layers,
      },
      {
        label: 'Active risks',
        value: analysis?.risks?.length || 0,
        detail: 'Severity ranked',
        icon: ShieldAlert,
      },
    ],
    [analysis],
  );

  const timelineHighlight = analysis?.timelineEstimate || 'Awaiting AI estimate';
  const heatmapData = analysis?.activityHeatmap?.length ? analysis.activityHeatmap : fallbackHeatmap;

  return (
    <GravityZone enabled={isGravityEnabled} className="flex flex-col gap-10 min-h-screen">
      <section className="card-surface overflow-hidden p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div data-physics="true">
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Krimson Overview</p>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Project Intelligence Dashboard</h1>
            <p className="text-text-muted">
              Automated structure parsing, completion telemetry, and AI-generated execution plans in a premium dark-tech shell.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-crimson-soft"
            >
              Re-analyze Project
            </Link>
            <button
              type="button"
              onClick={() => setIsGravityEnabled(!isGravityEnabled)}
              className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition-colors ${isGravityEnabled ? 'border-primary bg-primary text-white' : 'border-white/10 text-text-muted hover:text-white'
                }`}
            >
              {isGravityEnabled ? 'Gravity On' : 'Gravity Off'}
            </button>
            <button
              type="button"
              onClick={handleVoiceToggle}
              className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-text-muted hover:text-white"
            >
              {isSpeaking ? 'Stop Voice' : 'Play Voice Summary'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon }) => (
            <div key={label} data-physics="true" className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{label}</p>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
              <p className="text-xs text-text-muted">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {!analysis && (
        <section className="card-surface flex flex-col gap-4 p-8 text-center text-text-muted" data-physics="true">
          <p className="text-xs uppercase tracking-[0.4em]">Awaiting upload</p>
          <h2 className="text-2xl font-semibold text-white">No analysis yet</h2>
          <p>Upload a repo on the Upload page to activate full AI analytics.</p>
          <Link to="/upload" className="mx-auto rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-crimson-soft">
            Upload now
          </Link>
        </section>
      )}

      {analysis && (
        <>
          <div data-physics="true">
            <AIInsightsPanel analysis={analysis} onVoiceToggle={handleVoiceToggle} isSpeaking={isSpeaking} />
          </div>

          <section className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2" data-physics="true">
              <TaskBoard tasks={tasks} onTasksChange={handleTasksChange} />
            </div>
            <div className="space-y-6">
              <div className="card-surface space-y-4 p-6" data-physics="true">
                <SectionHeader title="Timeline signal" subtitle="Estimated delivery horizon" />
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-3 text-white">
                    <Clock3 className="h-5 w-5" />
                    <span>{timelineHighlight}</span>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    Derived from completion heuristics, TODO density, and missing module count.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-3 text-white">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <span>Top risks</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-text-muted">
                    {(analysis.risks || []).slice(0, 3).map((risk) => (
                      <li key={risk} className="flex items-start gap-2">
                        <span className="mt-1 h-1 w-1 rounded-full bg-warning" />
                        {risk}
                      </li>
                    ))}
                    {!analysis.risks?.length && <li>No critical risks flagged.</li>}
                  </ul>
                </div>
                <VoiceCommandIndicator active={isListening} supported={commandSupported} lastCommand={lastCommand} />
              </div>
            </div>
          </section>

          <div data-physics="true">
            <ActivityHeatmap data={heatmapData} />
          </div>
        </>
      )}
    </GravityZone>
  );
};

export default Dashboard;
