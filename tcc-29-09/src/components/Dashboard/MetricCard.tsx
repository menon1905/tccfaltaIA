import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, description, color }) => {
  const [bgColor, textColor] = color.split(' ');
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{description}</p>
    </div>
  );
};
