import { getStoredAuth } from '../auth/authStorage';
import { handleUnauthorizedResponse } from '../auth/handleUnauthorized';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function partyRequest(path, options = {}) {
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

export function createPerson(payload) {
  return partyRequest('/party/persons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePerson(partyId, payload) {
  return partyRequest(`/party/persons/${encodeURIComponent(partyId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchPerson(partyId) {
  return partyRequest(`/party/persons/${encodeURIComponent(partyId)}`);
}

export function findPersons(payload) {
  return partyRequest('/party/persons/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMaritalStatuses() {
  return partyRequest('/party/reference/marital-statuses');
}

export function fetchRoleTypes() {
  return partyRequest('/party/reference/role-types');
}

export function fetchPartyStatuses() {
  return partyRequest('/party/reference/party-statuses');
}

export function fetchPartyCurrencies() {
  return partyRequest('/party/reference/currencies');
}

export function fetchEmploymentStatuses() {
  return partyRequest('/party/reference/employment-statuses');
}

export function fetchResidenceStatuses() {
  return partyRequest('/party/reference/residence-statuses');
}

export function findSecurityGroups(payload) {
  return partyRequest('/party/security-groups/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchSecurityGroup(groupId) {
  return partyRequest(`/party/security-groups/${encodeURIComponent(groupId)}`);
}

export function updateSecurityGroup(groupId, payload) {
  return partyRequest(`/party/security-groups/${encodeURIComponent(groupId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchSecurityGroupPermissions(groupId) {
  return partyRequest(`/party/security-groups/${encodeURIComponent(groupId)}/permissions`);
}

export function addSecurityGroupPermission(groupId, payload) {
  return partyRequest(`/party/security-groups/${encodeURIComponent(groupId)}/permissions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeSecurityGroupPermission(groupId, payload) {
  return partyRequest(`/party/security-groups/${encodeURIComponent(groupId)}/permissions`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export function findSecurityPermissions(payload) {
  return partyRequest('/party/security-permissions/find', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchAllSecurityGroups() {
  return findSecurityGroups({ page: 0, size: 500 });
}

export function fetchUserLoginSecurityGroups(userLoginId) {
  return partyRequest(`/party/user-logins/${encodeURIComponent(userLoginId)}/security-groups`);
}

export function addUserLoginSecurityGroup(userLoginId, payload) {
  return partyRequest(`/party/user-logins/${encodeURIComponent(userLoginId)}/security-groups`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeUserLoginSecurityGroup(userLoginId, payload) {
  return partyRequest(`/party/user-logins/${encodeURIComponent(userLoginId)}/security-groups`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}
