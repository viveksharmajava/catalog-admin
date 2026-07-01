export const initialCatalogForm = {
  prodCatalogId: '',
  catalogName: '',
  useQuickAdd: 'Y',
  isCartEnabled: true,
  styleSheet: '',
  headerLogo: '',
  contentPathPrefix: '',
  templatePathPrefix: '',
  viewAllowPermReqd: 'N',
  purchaseAllowPermReqd: 'N',
};

export function catalogDtoToForm(dto) {
  return {
    prodCatalogId: dto.prodCatalogId || '',
    catalogName: dto.catalogName || '',
    useQuickAdd: dto.useQuickAdd || 'Y',
    isCartEnabled: dto.isCartEnabled !== false,
    styleSheet: dto.styleSheet || '',
    headerLogo: dto.headerLogo || '',
    contentPathPrefix: dto.contentPathPrefix || '',
    templatePathPrefix: dto.templatePathPrefix || '',
    viewAllowPermReqd: dto.viewAllowPermReqd || 'N',
    purchaseAllowPermReqd: dto.purchaseAllowPermReqd || 'N',
  };
}

export function catalogFormToPayload(form, isEdit = false) {
  const payload = {
    catalogName: form.catalogName.trim(),
    useQuickAdd: form.useQuickAdd,
    isCartEnabled: form.isCartEnabled === true || form.isCartEnabled === 'true',
    styleSheet: form.styleSheet.trim() || undefined,
    headerLogo: form.headerLogo.trim() || undefined,
    contentPathPrefix: form.contentPathPrefix.trim() || undefined,
    templatePathPrefix: form.templatePathPrefix.trim() || undefined,
    viewAllowPermReqd: form.viewAllowPermReqd,
    purchaseAllowPermReqd: form.purchaseAllowPermReqd,
  };

  if (!isEdit) {
    payload.prodCatalogId = form.prodCatalogId.trim() || undefined;
  }

  return payload;
}
