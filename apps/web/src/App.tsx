import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './stores/auth.store';
import { Layout, PageContent, Header } from '@/components/layout';
import PhoneInput from './pages/auth/PhoneInput';
import VerifyOtp from './pages/auth/VerifyOtp';

// Protected Route wrapper - requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Auth Route wrapper - redirects to home if already logged in
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Main Application Layout (after login)
function MainApp() {
  const { user } = useAuthStore();

  return (
    <Layout>
      <Header
        title="Dashboard Overview"
        subtitle={`Welcome back, ${user?.name || 'User'}`}
        searchPlaceholder="Search projects..."
        primaryActionLabel="New Project"
        onPrimaryAction={() => console.log('New project clicked')}
      />
      <PageContent>
        {/* Dashboard content goes here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
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

        {/* Protected Routes - require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
