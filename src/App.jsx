import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import RequireRoles from './auth/RequireRoles';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import CreateProductPage from './pages/CreateProductPage';
import FindProductPage from './pages/FindProductPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

const READ_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER', 'VIEWER'];
const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute roles={READ_ROLES}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/products/find" replace />} />
        <Route path="products/find" element={<FindProductPage />} />
        <Route
          path="products/create"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <CreateProductPage />
            </RequireRoles>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
