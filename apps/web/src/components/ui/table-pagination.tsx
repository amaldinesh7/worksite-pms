import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Total number of pages */
  pages: number;
  /** Total number of items */
  total: number;
  /** Items per page */
  limit: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Label for items (defaults to "entries") */
  itemLabel?: string;
  /** Additional className for the container */
  className?: string;
}

/**
 * Generate page numbers with ellipsis for pagination
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pageNumbers: (number | 'ellipsis')[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(currentPage - 1);
      pageNumbers.push(currentPage);
      pageNumbers.push(currentPage + 1);
      pageNumbers.push('ellipsis');
      pageNumbers.push(totalPages);
    }
  }

  return pageNumbers;
}

export function TablePagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  itemLabel = 'entries',
  className,
}: TablePaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, pages);

  const handlePageClick = (newPage: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    onPageChange(newPage);
  };

  return (
    <div className={cn('flex items-center justify-between p-3 bg-card', className)}>
      <p className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {total} {itemLabel}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={handlePageClick(page - 1)}
              className={cn(
                'cursor-pointer',
                page === 1 && 'pointer-events-none opacity-50'
              )}
              aria-disabled={page === 1}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) =>
            pageNum === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={handlePageClick(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer min-w-[36px]"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={handlePageClick(page + 1)}
              className={cn(
                'cursor-pointer',
                page === pages && 'pointer-events-none opacity-50'
              )}
              aria-disabled={page === pages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
