/**
 * Clients Table
 *
 * Displays clients in a table with:
 * - Name
 * - Phone number
 * - Location
 * - Projects count with popover
 * - Actions (edit only, no delete per requirement)
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
import { Typography } from '@/components/ui/typography';
import { MoreVertical, Pencil, Phone, MapPin } from 'lucide-react';
import { ClientProjectsPopover } from './ClientProjectsPopover';
import type { Client } from '@/lib/api/clients';

// ============================================
// Types
// ============================================

interface ClientsTableProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
}

// ============================================
// Helper Functions
// ============================================

function getInitials(name: string): string {
  if (!name?.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '-';
  return phone;
}

// ============================================
// Component
// ============================================

export function ClientsTable({ clients, onEditClient }: ClientsTableProps) {
  const columns: ColumnDef<Client>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'NAME',
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                {getInitials(client.name)}
              </div>
              <div className="min-w-0">
                <Typography variant="paragraph-small" className="font-medium truncate">
                  {client.name}
                </Typography>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'PHONE',
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="text-sm">{formatPhoneNumber(client.phone)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'LOCATION',
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate max-w-[200px]">{client.location}</span>
            </div>
          );
        },
      },
      {
        id: 'projects',
        header: 'PROJECTS',
        cell: ({ row }) => {
          const client = row.original;
          const projectsCount = client._count?.projectsAsClient ?? 0;
          return <ClientProjectsPopover clientId={client.id} projectsCount={projectsCount} />;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const client = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="iconSm" className="cursor-pointer">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditClient(client)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEditClient]
  );

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-medium text-muted-foreground">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No clients found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
