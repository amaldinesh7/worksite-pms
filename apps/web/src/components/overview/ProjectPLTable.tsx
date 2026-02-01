/**
 * Project P/L Table Component
 * Displays project profit/loss data with health progress bars
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ProjectPL } from '@/lib/api/overview';

interface ProjectPLTableProps {
  data: ProjectPL[];
  isLoading?: boolean;
}

type SortField = 'name' | 'budget' | 'healthPercent' | 'status';
type SortOrder = 'asc' | 'desc';

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getHealthColor(percent: number): string {
  if (percent >= 100) return 'bg-red-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'ON_HOLD':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_HOLD':
      return 'On Hold';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
}

export function ProjectPLTable({ data, isLoading }: ProjectPLTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('healthPercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'budget':
        return multiplier * (a.budget - b.budget);
      case 'healthPercent':
        return multiplier * (a.healthPercent - b.healthPercent);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Project P/L Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Project P/L Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No projects to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Project P/L Overview</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Project
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => handleSort('budget')}
                >
                  Budget
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="w-[20%]">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => handleSort('healthPercent')}
                >
                  Health
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.slice(0, 10).map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {project.isOverdue && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      {project.clientName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {project.clientName}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatCurrency(project.budget)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(project.spent)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right tabular-nums',
                    project.remaining < 0 && 'text-red-600 font-medium'
                  )}
                >
                  {project.remaining < 0 && '-'}
                  {formatCurrency(Math.abs(project.remaining))}
                </TableCell>
                <TableCell>
                  <HealthBar percent={project.healthPercent} />
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

interface HealthBarProps {
  percent: number;
}

function HealthBar({ percent }: HealthBarProps) {
  const displayPercent = Math.min(percent, 150);
  const barWidth = Math.min(percent, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getHealthColor(percent))}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span
        className={cn(
          'text-xs font-medium tabular-nums w-10 text-right',
          percent >= 100 && 'text-red-600',
          percent >= 80 && percent < 100 && 'text-amber-600'
        )}
      >
        {displayPercent}%
      </span>
    </div>
  );
}
