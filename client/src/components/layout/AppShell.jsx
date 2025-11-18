import { NavLink } from 'react-router-dom';
import { useAnalysis } from '../../context/AnalysisContext';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Upload', to: '/upload' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Activity', to: '/activity' },
];

const AppShell = ({ children }) => {
  const { analysis } = useAnalysis();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="absolute inset-0 -z-10 opacity-70">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(91,14,21,0.35),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(91,14,21,0.25),_transparent_50%)]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-background/70 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-lg font-bold text-white shadow-crimson">
              K
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-text-muted">Krimson</p>
              <p className="font-display text-lg text-text-primary">Project Tracker</p>
            </div>
          </NavLink>

          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive ? 'bg-primary text-white shadow-crimson-soft' : 'text-text-muted hover:text-text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">Last Analysis</span>
            <span className="text-sm text-text-primary">
              {analysis ? new Date(analysis.uploadedAt).toLocaleString() : 'No project analyzed'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">{children}</main>
    </div>
  );
};

export default AppShell;

