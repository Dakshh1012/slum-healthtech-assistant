
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'accepted' | 'rejected';
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    accepted: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    rejected: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      className: 'bg-rose-50 border-rose-200 text-rose-700',
    },
  };

  const { icon, className: statusClassName } = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2.5 py-1 gap-1.5 animate-fade-in', 
        statusClassName, 
        className
      )}
    >
      {icon}
      <span className="capitalize font-medium">{status}</span>
    </Badge>
  );
};

export const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => {
  const priorityConfig = {
    low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    high: 'bg-rose-50 border-rose-200 text-rose-700',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2.5 py-1 gap-1.5 animate-fade-in', 
        priorityConfig[priority]
      )}
    >
      <AlertTriangle className="w-3 h-3" />
      <span className="capitalize font-medium">{priority}</span>
    </Badge>
  );
};