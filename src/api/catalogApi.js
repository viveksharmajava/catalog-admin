import { getStoredAuth } from '../auth/authStorage';

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
