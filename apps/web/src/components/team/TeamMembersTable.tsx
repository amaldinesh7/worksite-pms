/**
 * Team Members Table
 *
 * Displays team members in a table with:
 * - Name and email
 * - Phone number
 * - Role
 * - Balance with project split-up popover
 * - Actions (edit/delete)
 */

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TypographySmall, TypographyMuted } from '@/components/ui/typography';
import { MoreVertical, Pencil, Trash2, Phone } from 'lucide-react';
import { useMemberTotalBalancesBatch } from '@/lib/hooks/useMemberAdvances';
import { MemberBalancePopover } from './MemberBalancePopover';
import type { TeamMember } from '@/lib/api/team';
import type { Role } from '@/lib/api/roles';

// ============================================
// Types
// ============================================

interface TeamMembersTableProps {
  members: TeamMember[];
  roles: Role[];
  onEditMember: (member: TeamMember) => void;
  onDeleteMember: (member: TeamMember) => void;
}

// ============================================
// Helper Components
// ============================================

/**
 * Cell component that displays member balance (receives balance as prop to avoid N+1)
 */
function BalanceCell({
  memberId,
  balance,
  isLoading,
}: {
  memberId: string;
  balance: number | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-4 w-16 bg-muted animate-pulse rounded" />;
  }

  return <MemberBalancePopover memberId={memberId} totalBalance={balance ?? 0} />;
}

// ============================================
// Helper Functions
// ============================================

function getInitials(name: string): string {
  if (!name?.trim()) return '';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0] ?? '')
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '—';
  // Simple formatting - you can enhance this based on your needs
  return phone;
}

// ============================================
// Component
// ============================================

export function TeamMembersTable({
  members,
  roles: _roles,
  onEditMember,
  onDeleteMember,
}: TeamMembersTableProps) {
  // Fetch all member balances in a single batch query (fixes N+1)
  const memberIds = useMemo(() => members.map((m) => m.membership.id), [members]);
  const { data: balances, isLoading: isBalancesLoading } = useMemberTotalBalancesBatch(memberIds);

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: 'name',
      header: 'MEMBER',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
              {getInitials(member.name)}
            </div>
            <div>
              <TypographySmall className="font-medium">{member.name}</TypographySmall>
              <TypographyMuted className="text-xs">{member.email || '—'}</TypographyMuted>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'PHONE',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-2">
            {member.phone ? (
              <>
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{formatPhoneNumber(member.phone)}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'ROLE',
      cell: ({ row }) => {
        const member = row.original;
        const roleName = member.membership?.role?.name || 'Unknown';
        return (
          <Badge variant="secondary" className="rounded-md font-normal">
            {roleName}
          </Badge>
        );
      },
    },
    {
      id: 'balance',
      header: 'BALANCE',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <BalanceCell
            memberId={member.membership.id}
            balance={balances?.[member.membership.id]}
            isLoading={isBalancesLoading}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditMember(member)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteMember(member)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/30">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
