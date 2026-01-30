/**
 * Chart Components
 *
 * Built with Recharts following shadcn patterns.
 */

import * as React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { cn } from '@/lib/utils';

// ============================================
// Chart Container
// ============================================

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ChartContainer({ className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Pie Chart
// ============================================

interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
  formatValue?: (value: number) => string;
}

const DEFAULT_COLORS = [
  '#0d9488', // teal-600
  '#0891b2', // cyan-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#c026d3', // fuchsia-600
  '#e11d48', // rose-600
  '#ea580c', // orange-600
  '#65a30d', // lime-600
];

export function PieChart({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
  innerRadius = 60,
  outerRadius = 100,
  colors = DEFAULT_COLORS,
  formatValue,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="rounded-lg border bg-card p-2 shadow-md">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatValue ? formatValue(item.value) : item.value.toLocaleString()} ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: { payload?: Array<{ value: string; color?: string }> }) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color ?? '#888' }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend content={renderLegend as never} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// Area Chart (for timeline/trends)
// ============================================

interface AreaChartDataItem {
  label: string;
  [key: string]: string | number;
}

interface AreaChartSeries {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
}

interface AreaChartProps {
  data: AreaChartDataItem[];
  series: AreaChartSeries[];
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  xAxisDataKey?: string;
}

export function AreaChart({
  data,
  series,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  formatValue,
  xAxisDataKey = 'label',
}: AreaChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-md">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {formatValue ? formatValue(entry.value) : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: { payload?: Array<{ value: string; color?: string }> }) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color ?? '#888' }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            dataKey={xAxisDataKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (formatValue ? formatValue(value) : value.toLocaleString())}
            className="text-muted-foreground"
            width={60}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend content={renderLegend as never} />}
          {series.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              fill={s.color}
              fillOpacity={s.fillOpacity ?? 0.2}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { Pie, Cell, ResponsiveContainer, Legend, Tooltip, Area, XAxis, YAxis, CartesianGrid };
