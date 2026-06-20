import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './auth/ProtectedRoute';
import RequireRoles from './auth/RequireRoles';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import ProductFormPage from './pages/ProductFormPage';
import CatalogFormPage from './pages/CatalogFormPage';
import CategoryFormPage from './pages/CategoryFormPage';
import FindProductPage from './pages/FindProductPage';
import FindCatalogPage from './pages/FindCatalogPage';
import FindCategoryPage from './pages/FindCategoryPage';
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
              <ProductFormPage />
            </RequireRoles>
          }
        />
        <Route
          path="products/edit/:productId"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <ProductFormPage />
            </RequireRoles>
          }
        />
        <Route path="catalog/find" element={<FindCatalogPage />} />
        <Route
          path="catalog/create"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <CatalogFormPage />
            </RequireRoles>
          }
        />
        <Route
          path="catalog/edit/:prodCatalogId"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <CatalogFormPage />
            </RequireRoles>
          }
        />
        <Route path="catalog" element={<Navigate to="/catalog/find" replace />} />
        <Route path="category/find" element={<FindCategoryPage />} />
        <Route
          path="category/create"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <CategoryFormPage />
            </RequireRoles>
          }
        />
        <Route
          path="category/edit/:productCategoryId"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <CategoryFormPage />
            </RequireRoles>
          }
        />
        <Route path="category" element={<Navigate to="/category/find" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
