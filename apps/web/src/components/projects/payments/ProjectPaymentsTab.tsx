/**
 * Project Payments Tab
 *
 * Main container for payments with sub-tabs:
 * - Client Payments (type = IN)
 * - Party Payments (type = OUT)
 * - Team Member Payments (advances)
 *
 * Supports URL-based filter persistence via props.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientPaymentsTab } from './ClientPaymentsTab';
import { PartyPaymentsTab } from './PartyPaymentsTab';
import { TeamMemberPaymentsTab } from './TeamMemberPaymentsTab';

// ============================================
// Types
// ============================================

interface ProjectPaymentsTabProps {
  projectId: string;
  /** Initial sub-tab from URL (client | party | team) */
  initialPaymentTab?: string;
  /** Initial member ID filter from URL (for team payments) */
  initialMemberId?: string;
  /** Callback when payment sub-tab changes */
  onPaymentTabChange?: (tab: string) => void;
  /** Callback when member filter changes */
  onMemberIdChange?: (memberId: string | undefined) => void;
}

// ============================================
// Component
// ============================================

export function ProjectPaymentsTab({
  projectId,
  initialPaymentTab = 'client',
  initialMemberId,
  onPaymentTabChange,
  onMemberIdChange,
}: ProjectPaymentsTabProps) {
  const handleTabChange = (value: string) => {
    onPaymentTabChange?.(value);
  };

  return (
    <Tabs
      defaultValue={initialPaymentTab}
      value={initialPaymentTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="mb-4">
        <TabsTrigger value="client" className="cursor-pointer">
          Client Payments
        </TabsTrigger>
        <TabsTrigger value="party" className="cursor-pointer">
          Party Payments
        </TabsTrigger>
        <TabsTrigger value="team" className="cursor-pointer">
          Team Member Payments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="client">
        <ClientPaymentsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="party">
        <PartyPaymentsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="team">
        <TeamMemberPaymentsTab
          projectId={projectId}
          initialMemberId={initialMemberId}
          onMemberIdChange={onMemberIdChange}
        />
      </TabsContent>
    </Tabs>
  );
}
