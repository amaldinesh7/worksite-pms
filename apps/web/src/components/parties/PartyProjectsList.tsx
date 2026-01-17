/**
 * Party Projects List Component
 *
 * Left panel that displays the list of projects associated with a party.
 * Shows project name and credit amount, with selection highlighting.
 * Uses the reusable ListPanel component.
 */

import { ListPanel } from '@/components/ui/list-panel';
import { cn } from '@/lib/utils';
import type { PartyProject } from '@/lib/api/parties';

// ============================================
// Types
// ============================================

interface PartyProjectsListProps {
  /** List of projects */
  projects: PartyProject[];
  /** Currently selected project ID */
  selectedProjectId: string | null;
  /** Callback when a project is selected */
  onSelectProject: (projectId: string | null) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Total amount across all projects */
  totalAmount?: number;
}

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// Component
// ============================================

export function PartyProjectsList({
  projects,
  selectedProjectId,
  onSelectProject,
  isLoading = false,
  totalAmount = 0,
}: PartyProjectsListProps) {
  return (
    <ListPanel>
      <ListPanel.Header
        title="Projects"
        rightContent={formatCurrency(totalAmount)}
      />
      <ListPanel.Content>
        {isLoading ? (
          <ListPanel.Loading count={5} />
        ) : projects.length === 0 ? (
          <ListPanel.Empty>No projects found</ListPanel.Empty>
        ) : (
          <div className="py-1">
            {projects.map((project) => {
              const isSelected = selectedProjectId === project.id;
              return (
                <ListPanel.Item
                  key={project.id}
                  isSelected={isSelected}
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        'text-sm truncate',
                        isSelected ? 'text-neutral-900 font-medium' : 'text-neutral-700'
                      )}
                    >
                      {project.name}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium shrink-0',
                        isSelected ? 'text-neutral-900' : 'text-neutral-600'
                      )}
                    >
                      {formatCurrency(project.credit)}
                    </span>
                  </div>
                </ListPanel.Item>
              );
            })}
          </div>
        )}
      </ListPanel.Content>
    </ListPanel>
  );
}

export default PartyProjectsList;
