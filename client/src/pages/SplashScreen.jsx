import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  { title: 'AI Blueprint Parsing', detail: 'Automatic stack detection, module mapping, and dependency tracing the second you upload.' },
  { title: 'Voice-native reporting', detail: 'Web Speech powered summaries, blockers, and sprint status on demand.' },
  { title: 'Risk telemetry', detail: 'Heatmaps, risk deltas, and completion confidence powered by LLM heuristics.' },
];

const SplashScreen = () => (
  <div className="flex flex-col gap-10 py-10">
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="card-surface overflow-hidden p-10"
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Krimson technologies</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">Krimson Project Tracker – Intelligence Meets Progress.</h1>
          <p className="text-lg text-text-muted">
            Ingest any repository, map the architecture, trace TODO debt, predict delivery timelines, and narrate the plan in a voice built
            for elite delivery teams.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-crimson-soft transition hover:-translate-y-1"
            >
              Upload Project
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-text-muted hover:text-white"
            >
              View Dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Live intelligence panel</p>
          <div className="mt-6 space-y-6">
            {features.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/5 bg-background/60 p-5">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="text-sm text-text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  </div>
);

export default SplashScreen;
