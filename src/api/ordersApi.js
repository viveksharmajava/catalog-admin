import { getStoredAuth } from '../auth/authStorage';
import { handleUnauthorizedResponse } from '../auth/handleUnauthorized';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function ordersRequest(path, options = {}) {
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

  if (response.status === 401) {
    handleUnauthorizedResponse();
    const error = new Error('Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (response.status === 403) {
    let message = 'You do not have permission for this action.';
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    const error = new Error(message);
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

export function findOrders(payload) {
  return ordersRequest('/orders/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getOrder(orderId) {
  return ordersRequest(`/orders/${encodeURIComponent(orderId)}`);
}

export function createOrder(payload) {
  return ordersRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelOrder(orderId, payload = {}) {
  return ordersRequest(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function findQuotes(payload) {
  return ordersRequest('/orders/quotes/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getQuote(quoteId) {
  return ordersRequest(`/orders/quotes/${encodeURIComponent(quoteId)}`);
}

export function createQuote(payload) {
  return ordersRequest('/orders/quotes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchOrderTypes() {
  return ordersRequest('/orders/reference/order-types');
}

export function fetchOrderStatuses() {
  return ordersRequest('/orders/reference/order-statuses');
}

export function fetchQuoteTypes() {
  return ordersRequest('/orders/reference/quote-types');
}

export function fetchQuoteStatuses() {
  return ordersRequest('/orders/reference/quote-statuses');
}
