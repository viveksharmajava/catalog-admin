import { findProducts } from '../api/catalogApi';
import { findPersons } from '../api/partyApi';

function mergeByKey(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key && !map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

export async function searchPartiesForAutocomplete(query) {
  const term = query?.trim();
  if (!term) return [];

  const base = { page: 0, size: 10 };
  try {
    const [byId, byFirst, byLast] = await Promise.all([
      findPersons({ ...base, partyId: term }),
      findPersons({ ...base, firstName: term }),
      findPersons({ ...base, lastName: term }),
    ]);
    return mergeByKey(
      [...(byId.content || []), ...(byFirst.content || []), ...(byLast.content || [])],
      (person) => person.partyId,
    ).slice(0, 10);
  } catch {
    return [];
  }
}

export async function searchProductsForAutocomplete(query) {
  const term = query?.trim();
  if (!term) return [];

  const criteria = { value: term, operator: 'contains', ignoreCase: true };
  const base = { page: 0, size: 10, noConditionFind: false };
  try {
    const [byId, byName, byInternal] = await Promise.all([
      findProducts({ ...base, productId: criteria }),
      findProducts({ ...base, productName: criteria }),
      findProducts({ ...base, internalName: criteria }),
    ]);
    return mergeByKey(
      [...(byId.content || []), ...(byName.content || []), ...(byInternal.content || [])],
      (product) => product.productId,
    ).slice(0, 10);
  } catch {
    return [];
  }
}

export function formatPartyLabel(person) {
  const name = [person.firstName, person.lastName].filter(Boolean).join(' ');
  return name ? `${person.partyId} — ${name}` : person.partyId;
}

export function formatProductLabel(product) {
  const name = product.productName || product.internalName;
  return name ? `${product.productId} — ${name}` : product.productId;
}
