export const initialPartyForm = {
  partyId: '',
  firstName: '',
  lastName: '',
  salutation: '',
  middleName: '',
  personalTitle: '',
  suffix: '',
  nickname: '',
  gender: '',
  birthDate: '',
  maritalStatusTypeId: '',
  employmentStatusEnumId: '',
  residenceStatusEnumId: '',
  existingCustomer: '',
  preferredCurrencyUomId: 'INR',
  statusId: 'PARTY_ENABLED',
  comments: '',
  occupation: '',
  roleTypeId: 'CUSTOMER',
  userLoginId: '',
  currentPassword: '',
  passwordHint: '',
  enabled: 'Y',
};

export function personDtoToForm(dto) {
  return {
    partyId: dto.partyId || '',
    firstName: dto.firstName || '',
    lastName: dto.lastName || '',
    salutation: dto.salutation || '',
    middleName: dto.middleName || '',
    personalTitle: dto.personalTitle || '',
    suffix: dto.suffix || '',
    nickname: dto.nickname || '',
    gender: dto.gender || '',
    birthDate: dto.birthDate || '',
    maritalStatusTypeId: dto.maritalStatusTypeId || '',
    employmentStatusEnumId: dto.employmentStatusEnumId || '',
    residenceStatusEnumId: dto.residenceStatusEnumId || '',
    existingCustomer: dto.existingCustomer || '',
    preferredCurrencyUomId: dto.preferredCurrencyUomId || 'INR',
    statusId: dto.statusId || 'PARTY_ENABLED',
    comments: dto.comments || '',
    occupation: dto.occupation || '',
    roleTypeId: dto.roleTypeId || dto.roleTypeIds?.[0] || 'CUSTOMER',
    userLoginId: dto.userLoginId || '',
    currentPassword: '',
    passwordHint: dto.passwordHint || '',
    enabled: dto.enabled || 'Y',
  };
}

export function partyFormToPayload(form, isEdit) {
  const payload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    salutation: form.salutation || undefined,
    middleName: form.middleName || undefined,
    personalTitle: form.personalTitle || undefined,
    suffix: form.suffix || undefined,
    nickname: form.nickname || undefined,
    gender: form.gender || undefined,
    birthDate: form.birthDate || undefined,
    maritalStatusTypeId: form.maritalStatusTypeId || undefined,
    employmentStatusEnumId: form.employmentStatusEnumId || undefined,
    residenceStatusEnumId: form.residenceStatusEnumId || undefined,
    existingCustomer: form.existingCustomer || undefined,
    preferredCurrencyUomId: form.preferredCurrencyUomId || undefined,
    statusId: form.statusId || undefined,
    comments: form.comments || undefined,
    occupation: form.occupation || undefined,
    roleTypeId: form.roleTypeId || undefined,
    userLoginId: form.userLoginId || undefined,
    passwordHint: form.passwordHint || undefined,
    enabled: form.enabled || undefined,
  };

  if (!isEdit && form.partyId.trim()) {
    payload.partyId = form.partyId.trim();
  }

  if (form.currentPassword) {
    payload.currentPassword = form.currentPassword;
  }

  return payload;
}
