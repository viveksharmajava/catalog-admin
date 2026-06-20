export const initialCategoryForm = {
  productCategoryId: '',
  productCategoryTypeId: 'CATALOG_CATEGORY',
  primaryParentCategoryId: '',
  categoryName: '',
  description: '',
  longDescription: '',
  categoryImageUrl: '',
  showInSelect: true,
};

export function categoryDtoToForm(dto) {
  return {
    productCategoryId: dto.productCategoryId || '',
    productCategoryTypeId: dto.productCategoryTypeId || 'CATALOG_CATEGORY',
    primaryParentCategoryId: dto.primaryParentCategoryId || '',
    categoryName: dto.categoryName || '',
    description: dto.description || '',
    longDescription: dto.longDescription || '',
    categoryImageUrl: dto.categoryImageUrl || '',
    showInSelect: dto.showInSelect !== false,
  };
}

export function categoryFormToPayload(form, isEdit = false) {
  const payload = {
    productCategoryTypeId: form.productCategoryTypeId,
    primaryParentCategoryId: form.primaryParentCategoryId.trim() || undefined,
    categoryName: form.categoryName.trim(),
    description: form.description.trim() || undefined,
    longDescription: form.longDescription.trim() || undefined,
    categoryImageUrl: form.categoryImageUrl.trim() || undefined,
    showInSelect: form.showInSelect,
  };

  if (!isEdit) {
    payload.productCategoryId = form.productCategoryId.trim() || undefined;
  }

  return payload;
}
