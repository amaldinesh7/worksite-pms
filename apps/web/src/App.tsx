import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from './stores/auth.store';
import { Layout } from '@/components/layout';
import PhoneInput from './pages/auth/PhoneInput';
import VerifyOtp from './pages/auth/VerifyOtp';
import Onboarding from './pages/auth/Onboarding';
import CategoriesPage from './pages/settings/CategoriesPage';
import PartiesPage from './pages/parties/PartiesPage';
import PartyDetailPage from './pages/parties/PartyDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TeamDirectoryPage from './pages/team/TeamDirectoryPage';
import ClientsPage from './pages/clients/ClientsPage';
import RolesPage from './pages/settings/RolesPage';
import RoleDetailPage from './pages/settings/RoleDetailPage';
import { OverviewPage } from './pages/overview';

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
          <Route index element={<OverviewPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="parties" element={<PartiesPage />} />
          <Route path="parties/:id" element={<PartyDetailPage />} />
          <Route path="team" element={<TeamDirectoryPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="settings/roles" element={<RolesPage />} />
          <Route path="settings/roles/:id" element={<RoleDetailPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
