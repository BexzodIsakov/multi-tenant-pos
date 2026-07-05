import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RequireRoleProps {
  role: 'admin' | 'cashier';
}

export function RequireRole({ role }: RequireRoleProps) {
  const { role: currentRole } = useAuth();

  if (currentRole !== role) {
    return <Navigate to="/catalog" replace />;
  }

  return <Outlet />;
}
