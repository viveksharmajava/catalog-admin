import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function RequireRoles({ roles, children }) {
  const { canAccess } = useAuth();
  if (!canAccess(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
