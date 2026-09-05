import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DevicesPage from './pages/DevicesPage';
import UsersPage from './pages/UsersPage';
import DeployPage from './pages/DeployPage';
import RemotePage from './pages/RemotePage';

function Private({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--texto-muted)',
        }}
      >
        Carregando…
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/devices"
        element={
          <Private>
            <DevicesPage />
          </Private>
        }
      />
      <Route
        path="/remote"
        element={
          <Private>
            <RemotePage />
          </Private>
        }
      />
      <Route
        path="/remote/:id"
        element={
          <Private>
            <RemotePage />
          </Private>
        }
      />
      <Route
        path="/users"
        element={
          <Private>
            <UsersPage />
          </Private>
        }
      />
      <Route
        path="/deploy"
        element={
          <Private>
            <DeployPage />
          </Private>
        }
      />
      <Route path="*" element={<Navigate to="/devices" replace />} />
    </Routes>
  );
}
