export default function MetricCard({ label, value, icon: Icon, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-500/10 text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-200',
    red: 'bg-red-500/10 text-red-200',
    blue: 'bg-sky-500/10 text-sky-200',
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20">
      <div className={`mb-4 inline-flex rounded-2xl p-3 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="text-sm text-white/55">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}