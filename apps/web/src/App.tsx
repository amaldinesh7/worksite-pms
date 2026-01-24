import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from './stores/auth.store';
import { Layout, PageContent, Header } from '@/components/layout';
import { TypographyH2, TypographyMuted } from '@/components/ui/typography';
import PhoneInput from './pages/auth/PhoneInput';
import VerifyOtp from './pages/auth/VerifyOtp';
import Onboarding from './pages/auth/Onboarding';
import CategoriesPage from './pages/settings/CategoriesPage';
import PartiesPage from './pages/parties/PartiesPage';
import PartyDetailPage from './pages/parties/PartyDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TeamDirectoryPage from './pages/team/TeamDirectoryPage';
import RolesPage from './pages/settings/RolesPage';
import RoleDetailPage from './pages/settings/RoleDetailPage';

// Auth Route wrapper - redirects to home if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Protected Layout - wraps all authenticated routes with shared Layout
// The Layout (including Sidebar) is mounted once and shared across all child routes
function ProtectedLayout() {
  const { isAuthenticated, organization } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if user has no organization
  if (!organization) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Dashboard page content (no Layout wrapper needed)
function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <>
      <Header
        title="Dashboard Overview"
        subtitle={`Welcome back, ${user?.name || 'User'}`}
        searchPlaceholder="Search projects..."
        primaryActionLabel="New Project"
        onPrimaryAction={() => console.log('New project clicked')}
      />
      <PageContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <TypographyMuted>Active Projects</TypographyMuted>
            <TypographyH2 className="mt-2 border-none pb-0">12</TypographyH2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <TypographyMuted>Total Expenses</TypographyMuted>
            <TypographyH2 className="mt-2 border-none pb-0">₹4.2L</TypographyH2>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <TypographyMuted>Pending Payments</TypographyMuted>
            <TypographyH2 className="mt-2 border-none pb-0">8</TypographyH2>
          </div>
        </div>
      </PageContent>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - accessible when NOT logged in */}
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <PhoneInput />
            </AuthRoute>
          }
        />
        <Route
          path="/auth/verify"
          element={
            <AuthRoute>
              <VerifyOtp />
            </AuthRoute>
          }
        />
        {/* Onboarding Route - for authenticated users without organization */}
        <Route path="/auth/onboarding" element={<Onboarding />} />

        {/* Protected Routes - all share the same Layout via ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="parties" element={<PartiesPage />} />
          <Route path="parties/:id" element={<PartyDetailPage />} />
          <Route path="team" element={<TeamDirectoryPage />} />
          <Route path="settings/roles" element={<RolesPage />} />
          <Route path="settings/roles/:id" element={<RoleDetailPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
