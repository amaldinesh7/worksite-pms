/**
 * Clients Page
 *
 * Main page for viewing clients.
 * Features:
 * - Search toolbar
 * - Table with client details and projects count
 * - Edit client dialog
 *
 * Note: Clients are created through the project creation flow,
 * so there's no "Add Client" button here. Deleting is also not supported.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Users } from 'lucide-react';

import { PageContent, Header } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { ClientsTable, ClientFormDialog } from '@/components/clients';
import { useClients, useUpdateClient } from '@/lib/hooks/useClients';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Client, UpdateClientInput } from '@/lib/api/clients';

// ============================================
// Constants
// ============================================

const PAGINATION_LIMIT = 10;

// ============================================
// Component
// ============================================

export default function ClientsPage() {
  // Local state
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchInput, 300);

  // Queries
  const { data: clientsData, isLoading } = useClients({
    page,
    limit: PAGINATION_LIMIT,
    search: debouncedSearch || undefined,
  });

  // Mutations
  const updateMutation = useUpdateClient();

  // Handlers
  const handleEditClient = useCallback((client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  }, []);

  const handleSubmitEdit = useCallback(
    async (data: UpdateClientInput) => {
      if (!selectedClient) return;

      try {
        await updateMutation.mutateAsync({ id: selectedClient.id, data });
        toast.success('Client updated successfully');
        setIsEditDialogOpen(false);
        setSelectedClient(null);
      } catch {
        toast.error('Failed to update client');
      }
    },
    [selectedClient, updateMutation]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Derived state
  const clients = clientsData?.items || [];
  const pagination = clientsData?.pagination || {
    page: 1,
    limit: PAGINATION_LIMIT,
    total: 0,
    pages: 0,
    hasMore: false,
  };

  return (
    <>
      <Header title="Clients" />

      <PageContent>
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Total count */}
            <span className="text-sm text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? 'client' : 'clients'}
            </span>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="rounded-lg border overflow-hidden">
              <div className="animate-pulse">
                <div className="h-11 bg-muted border-b" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 border-b last:border-0 flex items-center px-4 gap-4">
                    <div className="h-9 w-9 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : clients.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>No clients found</EmptyTitle>
                <EmptyDescription>
                  {debouncedSearch
                    ? `No clients match "${debouncedSearch}"`
                    : 'Clients are added when you create a project. Go to Projects to add your first client.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ClientsTable clients={clients} onEditClient={handleEditClient} />
          )}

          {/* Pagination */}
          {!isLoading && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {clients.length} of {pagination.total} clients
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(pagination.pages, 3) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="cursor-pointer w-9"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasMore}
                  onClick={() => handlePageChange(page + 1)}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageContent>

      {/* Edit Client Dialog */}
      <ClientFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        client={selectedClient}
        onSubmit={handleSubmitEdit}
        isSubmitting={updateMutation.isPending}
      />
    </>
  );
}
