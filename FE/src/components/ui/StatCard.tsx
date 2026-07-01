import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color?: 'blue' | 'emerald' | 'violet' | 'rose' | 'amber';
}

export default function StatCard({ icon: Icon, label, value, change, changeLabel, color = 'blue' }: StatCardProps) {
  const colorMap = {
    blue: { iconBg: 'bg-blue-50', iconText: 'text-blue-600', border: 'border-blue-100/40' },
    emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', border: 'border-emerald-100/40' },
    violet: { iconBg: 'bg-violet-50', iconText: 'text-violet-600', border: 'border-violet-100/40' },
    rose: { iconBg: 'bg-rose-50', iconText: 'text-rose-600', border: 'border-rose-100/40' },
    amber: { iconBg: 'bg-amber-50', iconText: 'text-amber-600', border: 'border-amber-100/40' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl border ${c.border} border-slate-200/60 p-5 shadow-xs hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3.5">
        <div className={`${c.iconBg} p-2.5 rounded-xl`}>
          <Icon className={`h-5 w-5 ${c.iconText}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
            change > 0 ? 'bg-emerald-50 text-emerald-600' : change < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[11px] font-bold text-slate-400 mt-1">{label}</p>
      {changeLabel && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{changeLabel}</p>}
    </div>
  );
}
