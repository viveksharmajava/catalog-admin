export const ADDRESS_TYPES = {
  BILLING: 'BILLING',
  SHIPPING: 'SHIPPING',
};

export function emptyAddressForm(addressType = ADDRESS_TYPES.SHIPPING) {
  return {
    addressType,
    toName: '',
    attnName: '',
    address1: '',
    address2: '',
    city: '',
    stateProvinceGeoId: '',
    postalCode: '',
    countryGeoId: 'IND',
    phone: '',
    defaultShipping: false,
  };
}

export function addressDtoToForm(dto) {
  return {
    addressType: dto.addressType || ADDRESS_TYPES.SHIPPING,
    toName: dto.toName || '',
    attnName: dto.attnName || '',
    address1: dto.address1 || '',
    address2: dto.address2 || '',
    city: dto.city || '',
    stateProvinceGeoId: dto.stateProvinceGeoId || '',
    postalCode: dto.postalCode || '',
    countryGeoId: dto.countryGeoId || 'IND',
    phone: dto.phone || '',
    defaultShipping: Boolean(dto.defaultShipping),
  };
}

export function addressFormToPayload(form) {
  return {
    addressType: form.addressType,
    toName: form.toName.trim() || undefined,
    attnName: form.attnName.trim() || undefined,
    address1: form.address1.trim(),
    address2: form.address2.trim() || undefined,
    city: form.city.trim(),
    stateProvinceGeoId: form.stateProvinceGeoId.trim() || undefined,
    postalCode: form.postalCode.trim() || undefined,
    countryGeoId: form.countryGeoId.trim() || undefined,
    phone: form.phone.trim() || undefined,
    defaultShipping: form.addressType === ADDRESS_TYPES.SHIPPING && form.defaultShipping,
  };
}

export function formatAddressLine(addr) {
  const parts = [
    addr.address1,
    addr.address2,
    addr.city,
    addr.stateProvinceGeoId,
    addr.postalCode,
    addr.countryGeoId,
  ].filter(Boolean);
  return parts.join(', ');
}
