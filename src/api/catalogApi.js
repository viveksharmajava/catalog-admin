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

export function fetchProductStatuses() {
  return request('/catalog/reference/product-statuses');
}

export function createProduct(payload) {
  return request('/catalog/products', {
    method: 'POST',
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
