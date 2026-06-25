import { Navigate, Route, Routes, useParams } from 'react-router-dom';



import ProtectedRoute from './auth/ProtectedRoute';

import RequireRoles from './auth/RequireRoles';

import AdminLayout from './components/AdminLayout';

import CategoryLayout from './components/CategoryLayout';

import CatalogScopeLayout from './components/CatalogScopeLayout';

import ProductScopeLayout from './components/ProductScopeLayout';

import LoginPage from './pages/LoginPage';

import ProductFormPage from './pages/ProductFormPage';

import CatalogFormPage from './pages/CatalogFormPage';

import CatalogCategoriesPage from './pages/CatalogCategoriesPage';

import CatalogStoresPage from './pages/CatalogStoresPage';

import CategoryFormPage from './pages/CategoryFormPage';

import FindProductPage from './pages/FindProductPage';

import ProductImportPage from './pages/ProductImportPage';

import FindCatalogPage from './pages/FindCatalogPage';

import FindCategoryPage from './pages/FindCategoryPage';

import CategoryRollupPage from './pages/CategoryRollupPage';

import CategoryProductsPage from './pages/CategoryProductsPage';

import CategoryCatalogsPage from './pages/CategoryCatalogsPage';

import ProductCategoriesPage from './pages/ProductCategoriesPage';

import ProductAttributesPage from './pages/ProductAttributesPage';

import ProductImagesPage from './pages/ProductImagesPage';

import ProductPricesPage from './pages/ProductPricesPage';

import ListStoresPage from './pages/ListStoresPage';

import StoreFormPage from './pages/StoreFormPage';

import FindPartyPage from './pages/FindPartyPage';

import PartyFormPage from './pages/PartyFormPage';

import PartyLayout from './components/PartyLayout';

import FindSecurityGroupPage from './pages/FindSecurityGroupPage';

import SecurityGroupFormPage from './pages/SecurityGroupFormPage';

import FindPermissionPage from './pages/FindPermissionPage';

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
          path="products/import"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <ProductImportPage />
            </RequireRoles>
          }
        />

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

          element={<LegacyProductEditRedirect />}

        />

        <Route path="products/:productId" element={<ProductScopeLayout />}>

          <Route index element={<Navigate to="product" replace />} />

          <Route path="product" element={<ProductFormPage />} />

          <Route path="prices" element={<ProductPricesPage />} />

          <Route path="categories" element={<ProductCategoriesPage />} />

          <Route path="images" element={<ProductImagesPage />} />

          <Route path="attributes" element={<ProductAttributesPage />} />

        </Route>

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

          element={<LegacyCatalogEditRedirect />}

        />

        <Route path="catalog/:prodCatalogId" element={<CatalogScopeLayout />}>

          <Route index element={<Navigate to="categories" replace />} />

          <Route path="categories" element={<CatalogCategoriesPage />} />

          <Route path="stores" element={<CatalogStoresPage />} />

        </Route>

        <Route path="catalog" element={<Navigate to="/catalog/find" replace />} />

        <Route path="stores" element={<ListStoresPage />} />

        <Route
          path="stores/create"
          element={
            <RequireRoles roles={WRITE_ROLES}>
              <StoreFormPage />
            </RequireRoles>
          }
        />

        <Route path="stores/edit/:productStoreId" element={<StoreFormPage />} />

        <Route path="party/find" element={<LegacyPartyFindRedirect />} />
        <Route path="party/create" element={<LegacyPartyCreateRedirect />} />
        <Route path="party/edit/:partyId" element={<LegacyPartyEditRedirect />} />

        <Route path="party" element={<PartyLayout />}>
          <Route index element={<Navigate to="/party/person/find" replace />} />

          <Route path="person/find" element={<FindPartyPage />} />
          <Route
            path="person/create"
            element={
              <RequireRoles roles={WRITE_ROLES}>
                <PartyFormPage />
              </RequireRoles>
            }
          />
          <Route path="person/edit/:partyId" element={<PartyFormPage />} />

          <Route path="security-group/find" element={<FindSecurityGroupPage />} />
          <Route path="security-group/edit/:groupId" element={<SecurityGroupFormPage />} />

          <Route path="permission/find" element={<FindPermissionPage />} />
        </Route>

        <Route path="category" element={<CategoryLayout />}>

          <Route index element={<Navigate to="/category/find" replace />} />

          <Route path="find" element={<FindCategoryPage />} />

          <Route path="rollup" element={<CategoryRollupPage />} />

          <Route path="products" element={<CategoryProductsPage />} />

          <Route path="catalogs" element={<CategoryCatalogsPage />} />

          <Route

            path="create"

            element={

              <RequireRoles roles={WRITE_ROLES}>

                <CategoryFormPage />

              </RequireRoles>

            }

          />

          <Route

            path="edit/:productCategoryId"

            element={

              <RequireRoles roles={WRITE_ROLES}>

                <CategoryFormPage />

              </RequireRoles>

            }

          />

        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}



function LegacyProductEditRedirect() {
  const { productId } = useParams();
  return <Navigate to={`/products/${encodeURIComponent(productId)}/product`} replace />;
}

function LegacyCatalogEditRedirect() {
  const { prodCatalogId } = useParams();
  return <Navigate to={`/catalog/${encodeURIComponent(prodCatalogId)}/categories`} replace />;
}

function LegacyPartyFindRedirect() {
  return <Navigate to="/party/person/find" replace />;
}

function LegacyPartyCreateRedirect() {
  return <Navigate to="/party/person/create" replace />;
}

function LegacyPartyEditRedirect() {
  const { partyId } = useParams();
  return <Navigate to={`/party/person/edit/${encodeURIComponent(partyId)}`} replace />;
}

