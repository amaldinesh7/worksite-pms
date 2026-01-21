import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
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
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/ui/table-pagination';
import { TypographySmall, TypographyMuted } from '@/components/ui/typography';
import { MoreHorizontal, Search, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import type { Party, PartyType } from '@/lib/api/parties';

interface PartiesTableProps {
  parties: Party[];
  isLoading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onAddParty: () => void;
  onViewParty: (party: Party) => void;
  onEditParty: (party: Party) => void;
  onDeleteParty: (party: Party) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  activeTab: PartyType;
}

export function PartiesTable({
  parties,
  isLoading,
  search,
  onSearchChange,
  onAddParty,
  onViewParty,
  onEditParty,
  onDeleteParty,
  pagination,
  onPageChange,
  activeTab,
}: PartiesTableProps) {
  const [searchInput, setSearchInput] = useState(search);

  // Sync searchInput with search prop when it changes externally
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAddButtonLabel = (): string => {
    switch (activeTab) {
      case 'VENDOR':
        return 'Add Vendor';
      case 'LABOUR':
        return 'Add Labour';
      case 'SUBCONTRACTOR':
        return 'Add Sub Contractor';
    }
  };

  const getSearchPlaceholder = (): string => {
    switch (activeTab) {
      case 'VENDOR':
        return 'Search vendors...';
      case 'LABOUR':
        return 'Search labours...';
      case 'SUBCONTRACTOR':
        return 'Search subcontractors...';
      default:
        return 'Search parties...';
    }
  };

  const columns: ColumnDef<Party>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const party = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <TypographySmall className="font-medium">{party.name}</TypographySmall>
              <TypographyMuted className="text-xs">{party.location || '—'}</TypographyMuted>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'credit',
      header: 'Credit',
      cell: () => {
        // Credit calculation will be 0 for now as per plan
        return (
          formatCurrency(0)
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.original.phone;
        return (
          <TypographySmall className="text-muted-foreground font-normal">
            {phone || '—'}
          </TypographySmall>
        );
      },
    },
    // {
    //   accessorKey: 'projects',
    //   header: 'Projects',
    //   cell: () => {
    //     // Projects count not in current schema, showing 0 for now
    //     return (
    //       <Badge variant="secondary" className="rounded-md">
    //         0 Projects
    //       </Badge>
    //     );
    //   },
    // },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const party = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onViewParty(party)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEditParty(party)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteParty(party)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: parties,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.pages,
  });

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Search and Add Button */}
      <div className="flex items-center justify-between gap-4 bg-white  p-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={getSearchPlaceholder()}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
        <Button onClick={onAddParty} className="cursor-pointer" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {getAddButtonLabel()}
        </Button>
      </div>

      {/* Table */}
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-sm font-medium text-primary">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
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
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <TypographyMuted>No parties found</TypographyMuted>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddParty}
                      className="mt-2 cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {getAddButtonLabel()}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && pagination.total > 0 && (
        <TablePagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={onPageChange}
          className='border-t'
        />
      )}
    </div>
  );
}
