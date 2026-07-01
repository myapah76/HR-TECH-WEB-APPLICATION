import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
