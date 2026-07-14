import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color?: 'blue' | 'emerald' | 'violet' | 'rose' | 'amber';
  isLoading?: boolean;
  href?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  color = 'blue',
  isLoading = false,
  href,
}: StatCardProps) {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30',
      iconText: 'text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40 hover:shadow-blue-500/5',
      glow: 'bg-blue-500/10',
      accent: 'bg-blue-500',
    },
    emerald: {
      iconBg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30',
      iconText: 'text-emerald-600 dark:text-emerald-450',
      borderHover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
      glow: 'bg-emerald-500/10',
      accent: 'bg-emerald-500',
    },
    violet: {
      iconBg: 'bg-violet-50/80 dark:bg-violet-950/30 border border-violet-100/50 dark:border-violet-900/30',
      iconText: 'text-violet-600 dark:text-violet-400',
      borderHover: 'hover:border-violet-500/40 hover:shadow-violet-500/5',
      glow: 'bg-violet-500/10',
      accent: 'bg-violet-500',
    },
    rose: {
      iconBg: 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/30',
      iconText: 'text-rose-600 dark:text-rose-400',
      borderHover: 'hover:border-rose-500/40 hover:shadow-rose-500/5',
      glow: 'bg-rose-500/10',
      accent: 'bg-rose-500',
    },
    amber: {
      iconBg: 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/30',
      iconText: 'text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
      glow: 'bg-amber-500/10',
      accent: 'bg-amber-500',
    },
  };
  const c = colorMap[color] || colorMap.blue;

  const content = (
    <>
      {/* Soft gradient background glow on hover */}
      <div className={`absolute -right-10 -top-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${c.glow}`} />
      
      {/* Vertical accent indicator line */}
      <div className={`absolute left-0 top-5 bottom-5 w-1 rounded-r-full transition-all duration-300 ${c.accent} opacity-40 group-hover:opacity-100`} />

      {/* Watermark Icon chìm ở góc dưới bên phải */}
      <Icon className="absolute -right-6 -bottom-6 h-28 w-28 text-slate-100 dark:text-slate-800/10 pointer-events-none group-hover:scale-110 transition-transform duration-500 -z-0" />

      {/* Arrow indicator on hover */}
      {href && (
        <ArrowUpRight className="absolute right-4 top-4 h-4.5 w-4.5 text-slate-300 dark:text-slate-650 opacity-0 group-hover:opacity-100 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-all duration-300 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 z-20" />
      )}

      <div className="space-y-4 pl-1 relative z-10">
        {/* Row 1: Icon and Number side-by-side */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${c.iconBg}`}>
              <Icon className={`h-5 w-5 transition-transform duration-300 ${c.iconText}`} />
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200/80 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2.5xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
          </div>

          {change !== undefined && (
            <div className={`flex items-center gap-0.5 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
              change > 0 ? 'bg-emerald-50/80 text-emerald-600 border border-emerald-100/30' : change < 0 ? 'bg-rose-50/80 text-rose-600 border border-rose-100/30' : 'bg-slate-50 text-slate-500'
            }`}>
              {change > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : change < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>

        {/* Row 2: Description below */}
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
            {label}
          </p>
          {changeLabel && <p className="text-[10px] font-semibold text-slate-400/80 dark:text-slate-500/80 mt-0.5 truncate">{changeLabel}</p>}
        </div>
      </div>
    </>
  );

  const className = `group relative block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] ${c.borderHover} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left w-full`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
