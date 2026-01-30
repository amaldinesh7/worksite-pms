/**
 * Alerts Panel Component
 * Displays budget overruns, approaching limits, overdue stages
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Alert } from '@/lib/api/overview';

interface AlertsPanelProps {
  data: Alert[];
  isLoading?: boolean;
}

interface AlertConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}

const alertConfigs: Record<string, AlertConfig> = {
  budget_overrun: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Budget Overruns',
    color: 'text-red-600',
    badgeVariant: 'destructive',
  },
  approaching_limit: {
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Approaching Limit',
    color: 'text-amber-600',
    badgeVariant: 'secondary',
  },
  overdue_stage: {
    icon: <Clock className="h-4 w-4" />,
    label: 'Overdue Stages',
    color: 'text-orange-600',
    badgeVariant: 'secondary',
  },
  pending_expense: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Pending Expenses',
    color: 'text-blue-600',
    badgeVariant: 'outline',
  },
};

export function AlertsPanel({ data, isLoading }: AlertsPanelProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleAlert = (type: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const totalAlerts = data.reduce((sum, alert) => sum + alert.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Alerts</CardTitle>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              All Clear
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-medium text-foreground">No alerts</p>
            <p className="text-sm">All projects are on track</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Alerts</CardTitle>
          <Badge variant="destructive">{totalAlerts}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((alert) => {
          const config = alertConfigs[alert.type];
          const isExpanded = expandedAlerts.has(alert.type);

          if (!config) return null;

          return (
            <div key={alert.type} className="border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                onClick={() => toggleAlert(alert.type)}
              >
                <div className="flex items-center gap-2">
                  <span className={config.color}>{config.icon}</span>
                  <span className="font-medium text-sm">{config.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.badgeVariant} className="font-normal">
                    {alert.count}
                  </Badge>
                  {alert.items.length > 0 &&
                    (isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ))}
                </div>
              </button>
              {isExpanded && alert.items.length > 0 && (
                <div className="border-t bg-muted/30">
                  {alert.items.map((item) => (
                    <AlertItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface AlertItemProps {
  item: {
    id: string;
    name: string;
    detail: string;
  };
}

function AlertItem({ item }: AlertItemProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0"
      onClick={() => navigate(`/projects/${item.id}`)}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}
