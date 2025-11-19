import CompletionGauge from './CompletionGauge';
import VoiceFeedbackButton from '../voice/VoiceFeedbackButton';
import { formatTimeline } from '../../utils/formatters';

const AIInsightsPanel = ({ analysis, onVoiceToggle, isSpeaking }) => {
  const progressEntries = Object.entries(analysis?.progressByDiscipline || {});
  const risks = analysis?.risks || [];
  const techStack = analysis?.techStack || [];

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-col gap-8 p-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">AI Summary</p>
            <h2 className="text-3xl font-semibold text-white">Krimson Intelligence Pulse</h2>
            <p className="text-text-muted">{analysis?.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-primary-dark/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Timeline</p>
              <p className="text-lg text-white">{formatTimeline(analysis?.timelineEstimate)}</p>
              <p className="text-sm text-text-muted">Based on detected blockers and missing modules.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-primary-dark/40 p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Tech Stack</p>
              <p className="text-lg text-white">{techStack.length ? techStack.join(' · ') : 'Not detected'}</p>
              <p className="text-sm text-text-muted">Auto-classified from file signatures.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Risks & blockers</p>
            <ul className="mt-3 space-y-2">
              {risks.slice(0, 4).map((risk) => (
                <li key={risk} className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-danger" />
                  {risk}
                </li>
              ))}
              {!risks.length && <li className="text-sm text-text-muted">No critical risks detected.</li>}
            </ul>
          </div>

          <VoiceFeedbackButton isPlaying={isSpeaking} onClick={onVoiceToggle} label="Play voice feedback" />
        </div>

        <div className="flex flex-col items-center gap-8 rounded-2xl border border-white/5 bg-white/5 p-8 lg:w-96">
          <CompletionGauge value={analysis?.completion} />
          <div className="w-full space-y-6">
            {progressEntries.map(([discipline, value]) => (
              <div key={discipline}>
                <div className="flex justify-between text-sm uppercase tracking-[0.25em] text-text-muted mb-2">
                  <span>{discipline}</span>
                  <span className="font-semibold">{Math.round(value)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;

