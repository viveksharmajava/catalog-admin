import { clearAuth } from './authStorage';

/**
 * On 401/403 from an API, clear the session and return to the app login page.
 * Avoids relying on the browser HTTP Basic dialog when a backend sends WWW-Authenticate.
 */
export function handleUnauthorizedResponse() {
  clearAuth();
  if (!window.location.pathname.startsWith('/login')) {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login?returnTo=${returnTo}`);
  }
}
