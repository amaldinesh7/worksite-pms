import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from './stores/auth.store';
import { Layout, PageContent, Header } from '@/components/layout';
import PhoneInput from './pages/auth/PhoneInput';
import VerifyOtp from './pages/auth/VerifyOtp';
import CategoriesPage from './pages/settings/CategoriesPage';
import PartiesPage from './pages/parties/PartiesPage';
import PartyDetailPage from './pages/parties/PartyDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';

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
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
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
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-medium text-neutral-500">Active Projects</h3>
            <p className="text-3xl font-semibold text-neutral-800 mt-2">12</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-medium text-neutral-500">Total Expenses</h3>
            <p className="text-3xl font-semibold text-neutral-800 mt-2">₹4.2L</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-medium text-neutral-500">Pending Payments</h3>
            <p className="text-3xl font-semibold text-neutral-800 mt-2">8</p>
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

        {/* Protected Routes - all share the same Layout via ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="parties" element={<PartiesPage />} />
          <Route path="parties/:id" element={<PartyDetailPage />} />
          {/* Add more protected routes here as needed */}
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
