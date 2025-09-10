import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'info';
  className?: string;
}

export default function StatsCard({ title, value, icon, change, changeType = 'neutral', className = '' }: StatsCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp size={14} />;
      case 'negative':
        return <TrendingDown size={14} />;
      default:
        return <Minus size={14} />;
    }
  };

  const cardTypeClass = changeType === 'positive' ? 'success' : changeType === 'negative' ? 'danger' : changeType === 'info' ? 'info' : '';

  return (
    <div className={`stat-card ${cardTypeClass} ${className} animate-slideInUp`}>
      <div className="flex items-center justify-between mb-4">
        <p className="stat-label">{title}</p>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${
          changeType === 'positive' ? 'from-success/20 to-success/10 text-success' :
          changeType === 'negative' ? 'from-danger/20 to-danger/10 text-danger' :
          'from-primary/20 to-primary/10 text-primary'
        } shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="stat-number">{value}</p>
        {change && (
          <div className={`stat-change ${changeType} flex items-center gap-1`}>
            {getChangeIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
