import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 
        rounded-2xl 
        border border-slate-200 dark:border-slate-700
        shadow-sm hover:shadow-md transition-shadow duration-300
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'rose' | 'amber';
}

const colorStyles = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
};

export function StatCard({ title, value, icon, trend, trendUp, color = 'indigo' }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <Card className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-2.5">
              <span className={`
                flex items-center text-xs font-semibold px-2 py-0.5 rounded-full
                ${trendUp 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
              `}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
              <span className="ml-2 text-xs text-slate-400">vs mois dernier</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${styles.bg} ${styles.text} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function CardHeader({ children, className = '', action }: { children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between ${className}`}>
      <div>
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-bold text-slate-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}
