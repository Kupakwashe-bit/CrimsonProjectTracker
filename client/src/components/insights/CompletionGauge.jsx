import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';

const CompletionGauge = ({ value = 0 }) => {
  const data = [{ name: 'completion', value: Math.min(100, Math.max(0, value)), fill: '#F5E6DE' }];

  return (
    <div className="relative mx-auto h-56 w-56">
      <RadialBarChart
        width={220}
        height={220}
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={10}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar background clockWise dataKey="value" cornerRadius={10} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Completion</p>
        <p className="text-4xl font-semibold text-white">{Math.round(value)}%</p>
        <p className="text-sm text-text-muted">Confidence model v2.4</p>
      </div>
    </div>
  );
};

export default CompletionGauge;

