import { getStoredAuth } from '../auth/authStorage';
import { handleUnauthorizedResponse } from '../auth/handleUnauthorized';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function pricingRequest(path, options = {}) {
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
    handleUnauthorizedResponse();
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
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function productPricePath(productId, suffix = '') {
  return `/pricing/products/${encodeURIComponent(productId)}${suffix}`;
}

export function fetchProductPrices(productId) {
  return pricingRequest(productPricePath(productId, '/prices'));
}

export function createProductPrice(productId, payload) {
  return pricingRequest(productPricePath(productId, '/prices'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProductPrice(productId, payload) {
  return pricingRequest(productPricePath(productId, '/prices'), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteProductPrice(productId, payload) {
  return pricingRequest(productPricePath(productId, '/prices'), {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export function fetchPriceTypes() {
  return pricingRequest('/pricing/reference/price-types');
}

export function fetchPricePurposes() {
  return pricingRequest('/pricing/reference/price-purposes');
}
