import { getStoredAuth } from '../auth/authStorage';
import { handleUnauthorizedResponse } from '../auth/handleUnauthorized';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const auth = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    if (!options.skipAuthRedirect) {
      handleUnauthorizedResponse();
    }
    const error = new Error('Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function login(username, password) {
  return request('/catalog/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuthRedirect: true,
  });
}

export function fetchProductTypes() {
  return request('/catalog/reference/product-types');
}

export function fetchCategories() {
  return request('/catalog/reference/categories');
}

export function fetchCategoryTypes() {
  return request('/catalog/reference/category-types');
}

export function fetchCategory(categoryId) {
  return request(`/catalog/categories/${encodeURIComponent(categoryId)}`);
}

export function createCategory(payload) {
  return request('/catalog/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategory(categoryId, payload) {
  return request(`/catalog/categories/${encodeURIComponent(categoryId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function findCategories(payload) {
  return request('/catalog/categories/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProductStatuses() {
  return request('/catalog/reference/product-statuses');
}

export function fetchPriceTypes() {
  return request('/catalog/reference/price-types');
}

export function fetchPricePurposes() {
  return request('/catalog/reference/price-purposes');
}

export function createProduct(payload) {
  return request('/catalog/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProduct(productId) {
  return request(`/catalog/products/${encodeURIComponent(productId)}`);
}

export function updateProduct(productId, payload) {
  return request(`/catalog/products/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function findProducts(payload) {
  return request('/catalog/products/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function downloadFile(path, defaultFilename) {
  const auth = getStoredAuth();
  const headers = {};
  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(`${API_BASE}${path}`, { headers });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedResponse();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match ? match[1] : defaultFilename;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadProductImportTemplate() {
  return downloadFile('/catalog/products/import/template', 'product_import_template.xlsx');
}

export function downloadProductExport() {
  return downloadFile('/catalog/products/export', 'products_export.xlsx');
}

export async function importProducts(file) {
  const auth = getStoredAuth();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(`${API_BASE}/catalog/products/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedResponse();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Import failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

export function downloadCategoryImportTemplate() {
  return downloadFile('/catalog/categories/import/template', 'category_import_template.xlsx');
}

export function downloadCategoryExport() {
  return downloadFile('/catalog/categories/export', 'categories_export.xlsx');
}

export async function importCategories(file) {
  const auth = getStoredAuth();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(`${API_BASE}/catalog/categories/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedResponse();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Import failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

export function downloadProdCatalogImportTemplate() {
  return downloadFile('/catalog/prod-catalogs/import/template', 'prod_catalog_import_template.xlsx');
}

export function downloadProdCatalogExport() {
  return downloadFile('/catalog/prod-catalogs/export', 'prod_catalogs_export.xlsx');
}

export async function importProdCatalogs(file) {
  const auth = getStoredAuth();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(`${API_BASE}/catalog/prod-catalogs/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedResponse();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Import failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

export function findProdCatalogs(payload) {
  return request('/catalog/prod-catalogs/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createProdCatalog(payload) {
  return request('/catalog/prod-catalogs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProdCatalog(prodCatalogId) {
  return request(`/catalog/prod-catalogs/${encodeURIComponent(prodCatalogId)}`);
}

export function updateProdCatalog(prodCatalogId, payload) {
  return request(`/catalog/prod-catalogs/${encodeURIComponent(prodCatalogId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

function catalogPath(prodCatalogId, suffix) {
  return `/catalog/prod-catalogs/${encodeURIComponent(prodCatalogId)}${suffix}`;
}

export function fetchCatalogCategories(prodCatalogId) {
  return request(catalogPath(prodCatalogId, '/categories'));
}

export function addCatalogCategory(prodCatalogId, payload) {
  return request(catalogPath(prodCatalogId, '/categories'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCatalogCategory(prodCatalogId, payload) {
  return request(catalogPath(prodCatalogId, '/categories'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeCatalogCategory(prodCatalogId, payload) {
  return request(catalogPath(prodCatalogId, '/categories'), {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export function fetchCatalogStores(prodCatalogId) {
  return request(catalogPath(prodCatalogId, '/stores'));
}

export function addCatalogStore(prodCatalogId, payload) {
  return request(catalogPath(prodCatalogId, '/stores'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeCatalogStore(prodCatalogId, productStoreId, fromDate) {
  const params = new URLSearchParams({ fromDate: String(fromDate) });
  return request(
    `${catalogPath(prodCatalogId)}/stores/${encodeURIComponent(productStoreId)}?${params.toString()}`,
    { method: 'DELETE' },
  );
}

function categoryPath(categoryId, suffix) {
  return `/catalog/categories/${encodeURIComponent(categoryId)}${suffix}`;
}

export function fetchParentRollups(categoryId) {
  return request(categoryPath(categoryId, '/rollups/parents'));
}

export function fetchChildRollups(categoryId) {
  return request(categoryPath(categoryId, '/rollups/children'));
}

export function addParentRollup(categoryId, payload) {
  return request(categoryPath(categoryId, '/rollups/parents'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function addChildRollup(categoryId, payload) {
  return request(categoryPath(categoryId, '/rollups/children'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateRollup(payload) {
  const categoryId = payload.productCategoryId;
  return request(categoryPath(categoryId, '/rollups'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeRollup(payload) {
  const categoryId = payload.productCategoryId;
  return request(categoryPath(categoryId, '/rollups'), {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export function fetchCategoryProducts(categoryId) {
  return request(categoryPath(categoryId, '/products'));
}

export function addCategoryProduct(categoryId, payload) {
  return request(categoryPath(categoryId, '/products'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategoryProduct(payload) {
  return request(categoryPath(payload.productCategoryId, '/products'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeCategoryProduct(payload) {
  return request(categoryPath(payload.productCategoryId, '/products'), {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export function fetchCategoryProdCatalogs(categoryId) {
  return request(categoryPath(categoryId, '/prod-catalogs'));
}

export function addCategoryProdCatalog(categoryId, payload) {
  return request(categoryPath(categoryId, '/prod-catalogs'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateCategoryProdCatalog(payload) {
  return request(categoryPath(payload.productCategoryId, '/prod-catalogs'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function removeCategoryProdCatalog(payload) {
  return request(categoryPath(payload.productCategoryId, '/prod-catalogs'), {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export function fetchProdCatalogCategoryTypes() {
  return request('/catalog/reference/prod-catalog-category-types');
}

export function listAllProdCatalogs() {
  return findProdCatalogs({ noConditionFind: true, page: 0, size: 100 });
}

export function listAllProducts() {
  return findProducts({ noConditionFind: true, page: 0, size: 100 });
}

function productPath(productId, suffix = '') {
  return `/catalog/products/${encodeURIComponent(productId)}${suffix}`;
}

export function fetchProductCategories(productId) {
  return request(productPath(productId, '/categories'));
}

export function addProductCategory(productId, categoryId) {
  return request(productPath(productId, `/categories/${encodeURIComponent(categoryId)}`), {
    method: 'POST',
  });
}

export function removeProductCategory(productId, categoryId) {
  return request(productPath(productId, `/categories/${encodeURIComponent(categoryId)}`), {
    method: 'DELETE',
  });
}

export function addProductAttribute(productId, payload) {
  return request(productPath(productId, '/attributes'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchProductImages(productId) {
  return request(productPath(productId, '/images'));
}

export async function uploadProductImage(productId, size, file) {
  const auth = getStoredAuth();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(
    `${API_BASE}/catalog/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(size)}`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedResponse();
    const error = new Error('Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
      else if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json();
}

/** Use Vite proxy for locally served catalog images when possible. */
export function resolveProductImageSrc(url) {
  return resolveCatalogMediaSrc(url);
}

/** Resolve category, catalog, or product image URLs for preview. */
export function resolveCatalogMediaSrc(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.origin);
    if (
      parsed.pathname.startsWith('/catalog/product-images/')
      || parsed.pathname.startsWith('/catalog/category-images/')
      || parsed.pathname.startsWith('/catalog/catalog-images/')
    ) {
      return parsed.pathname;
    }
  } catch {
    if (
      url.startsWith('/catalog/product-images/')
      || url.startsWith('/catalog/category-images/')
      || url.startsWith('/catalog/catalog-images/')
    ) {
      return url;
    }
  }
  return url;
}

async function uploadMultipart(path, file) {
  const auth = getStoredAuth();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (auth?.authHeader) {
    headers['X-User'] = auth.authHeader;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorizedResponse();
    const error = new Error('Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
      else if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json();
}

export function fetchCategoryImageInfo(categoryId) {
  return request(`/catalog/categories/${encodeURIComponent(categoryId)}/image`);
}

export function uploadCategoryImage(categoryId, file) {
  return uploadMultipart(`/catalog/categories/${encodeURIComponent(categoryId)}/image`, file);
}

export function fetchCatalogImageInfo(prodCatalogId) {
  return request(`/catalog/prod-catalogs/${encodeURIComponent(prodCatalogId)}/image`);
}

export function uploadCatalogImage(prodCatalogId, file) {
  return uploadMultipart(`/catalog/prod-catalogs/${encodeURIComponent(prodCatalogId)}/image`, file);
}

function storePath(productStoreId, suffix = '') {
  return `/catalog/product-stores/${encodeURIComponent(productStoreId)}${suffix}`;
}

export function listProductStores() {
  return request('/catalog/product-stores');
}

export function fetchProductStore(productStoreId) {
  return request(storePath(productStoreId));
}

export function createProductStore(payload) {
  return request('/catalog/product-stores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProductStore(productStoreId, payload) {
  return request(storePath(productStoreId), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchStoreCatalogs(productStoreId) {
  return request(storePath(productStoreId, '/catalogs'));
}

export function addStoreCatalog(productStoreId, payload) {
  return request(storePath(productStoreId, '/catalogs'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeStoreCatalog(productStoreId, prodCatalogId, fromDate) {
  const params = new URLSearchParams({ fromDate: String(fromDate) });
  return request(
    `${storePath(productStoreId)}/catalogs/${encodeURIComponent(prodCatalogId)}?${params.toString()}`,
    { method: 'DELETE' },
  );
}

export function fetchStoreSettings(productStoreId) {
  return request(storePath(productStoreId, '/settings'));
}

export function updateStoreSettings(productStoreId, payload) {
  return request(storePath(productStoreId, '/settings'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
