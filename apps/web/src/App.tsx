import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IDE from './pages/IDE';
import SharePage from './pages/SharePage';
import { useEffect } from 'react';
import { authApi } from './lib/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUserStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { setUser, setLoading } = useUserStore();

  useEffect(() => {
    authApi.getMe()
      .then(user => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/share/:token" element={<SharePage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId"
        element={
          <ProtectedRoute>
            <IDE />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}