/**
 * Project Stats Chart Component
 * Displays a donut chart showing project status breakdown
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectStatusBreakdown } from '@/lib/api/overview';

interface ProjectStatsChartProps {
  data: ProjectStatusBreakdown;
  isLoading?: boolean;
}

const COLORS = {
  active: '#14b8a6', // teal-500
  onHold: '#f59e0b', // amber-500
  completed: '#6b7280', // gray-500
};

export function ProjectStatsChart({ data, isLoading }: ProjectStatsChartProps) {
  const total = data.active + data.onHold + data.completed;

  const chartData = [
    { name: 'Active', value: data.active, color: COLORS.active },
    { name: 'On Hold', value: data.onHold, color: COLORS.onHold },
    { name: 'Completed', value: data.completed, color: COLORS.completed },
  ].filter((item) => item.value > 0);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-8 border-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center text-muted-foreground">
            No projects yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Project Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* Donut Chart */}
          <div className="h-[180px] w-[180px] min-w-[180px] flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md">
                          <p className="text-sm font-medium">{data.name}</p>
                          <p className="text-lg font-bold">{data.value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">{total}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            <LegendItem
              color={COLORS.active}
              label="Active"
              value={data.active}
              percentage={Math.round((data.active / total) * 100)}
            />
            <LegendItem
              color={COLORS.onHold}
              label="On Hold"
              value={data.onHold}
              percentage={Math.round((data.onHold / total) * 100)}
            />
            <LegendItem
              color={COLORS.completed}
              label="Completed"
              value={data.completed}
              percentage={Math.round((data.completed / total) * 100)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
  value: number;
  percentage: number;
}

function LegendItem({ color, label, value, percentage }: LegendItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-semibold tabular-nums">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full mt-1 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
