import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, RefreshCw, Send, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchActivityFeed, apiClient } from '../utils/api';

const levelStyles = {
  info: { label: 'Info', accent: 'text-white', badge: 'bg-white/10' },
  warn: { label: 'Warning', accent: 'text-warning', badge: 'bg-warning/10' },
  error: { label: 'Error', accent: 'text-danger', badge: 'bg-danger/10' },
};

const levelIcon = (level) => {
  switch (level) {
    case 'error':
      return <AlertCircle className="text-danger" size={18} />;
    case 'warn':
      return <Shield className="text-warning" size={18} />;
    default:
      return <Info className="text-white" size={18} />;
  }
};

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('info');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchActivityFeed();
      setLogs(data);
    } catch (err) {
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const addLog = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    try {
      const response = await apiClient.post('/activity/logs', { message, level });
      setLogs((prev) => [response.data.log, ...prev]);
      setMessage('');
      setLevel('info');
    } catch (err) {
      setError('Unable to record entry');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="card-surface flex flex-col gap-4 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Signal</p>
            <h1 className="text-3xl font-semibold text-white">Activity Feed</h1>
            <p className="text-text-muted">Track notable analysis events, custom alerts, and operational notes.</p>
          </div>
          <Link to="/dashboard" className="rounded-full border border-white/10 px-5 py-2 text-sm uppercase tracking-[0.3em] text-text-muted hover:text-white">
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <motion.div className="card-surface space-y-5 p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Add entry</p>
            <h2 className="text-2xl font-semibold text-white">Manual log injection</h2>
          </div>
          <form onSubmit={addLog} className="space-y-4">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the deployment, issue, or note to track…"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs uppercase tracking-[0.4em] text-text-muted">Level</label>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-crimson-soft"
              >
                <Send className="h-4 w-4" />
                Add entry
              </button>
              <button
                type="button"
                onClick={loadLogs}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-text-muted hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
          </form>
        </motion.div>

        <motion.div
          className="card-surface lg:col-span-2 p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Recent</p>
              <h2 className="text-2xl font-semibold text-white">Operational feed</h2>
            </div>
            {loading && <span className="text-xs uppercase tracking-[0.4em] text-text-muted">Fetching</span>}
          </div>

          {!logs.length && !loading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-text-muted">
              No activity recorded yet.
            </div>
          ) : (
            <ul className="mt-6 space-y-3 overflow-auto pr-1">
              {logs.map((log) => {
                const style = levelStyles[log.level] || levelStyles.info;
                return (
                  <li key={log.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <span className="rounded-2xl bg-background/60 p-2">{levelIcon(log.level)}</span>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.4em] ${style.badge} ${style.accent}`}>
                            {style.label}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(log.timestamp).toLocaleString(undefined, { hour12: false })}
                          </span>
                        </div>
                        <p className="text-sm text-white">{log.message}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default ActivityLog;
