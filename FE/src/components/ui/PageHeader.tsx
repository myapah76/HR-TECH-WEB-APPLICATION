import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
  if (!actions) return null;
  return (
    <div className="flex justify-end mb-6">
      <div className="flex items-center gap-2.5">{actions}</div>
    </div>
  );
}
