const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Module</p>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default SectionHeader;

