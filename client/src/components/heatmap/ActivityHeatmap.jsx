import { formatDate } from '../../utils/formatters';

const getCellColor = (value = 0) => {
  if (value > 75) return 'bg-primary';
  if (value > 50) return 'bg-primary/80';
  if (value > 25) return 'bg-primary/60';
  return 'bg-white/10';
};

const ActivityHeatmap = ({ data = [] }) => (
  <div className="card-surface p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Activity</p>
        <h2 className="text-2xl font-semibold text-white">Execution heatmap</h2>
        <p className="text-sm text-text-muted">Daily work focus & predicted risk spikes.</p>
      </div>
      <div className="text-sm text-text-muted">
        <span className="text-white">{data.filter((item) => item.value > 60).length}</span> high-output days
      </div>
    </div>

    <div className="mt-6 grid grid-cols-7 gap-3">
      {data.map((item) => (
        <div key={item.date} className="space-y-2 rounded-xl border border-white/5 bg-white/5 p-3">
          <div className={`h-12 rounded-lg ${getCellColor(item.value)} relative overflow-hidden`}>
            {item.risk && (
              <span className="absolute -right-8 top-2 rotate-45 rounded-full bg-danger/70 px-6 py-0.5 text-[10px] uppercase tracking-[0.4em] text-white">
                risk
              </span>
            )}
          </div>
          <div className="text-xs">
            <p className="text-white">{formatDate(item.date)}</p>
            <p className="text-text-muted">{item.focus}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ActivityHeatmap;

