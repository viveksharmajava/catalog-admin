export const initialProductForm = {
  productId: '',
  productTypeId: 'FINISHED_GOOD',
  primaryProductCategoryId: '',
  statusId: 'DRAFT',
  internalName: '',
  brandName: '',
  productName: '',
  sku: '',
  description: '',
  longDescription: '',
  comments: '',
  introductionDate: '',
  releaseDate: '',
  salesDiscontinuationDate: '',
  virtualProduct: false,
  variant: false,
  returnable: true,
  taxable: true,
  chargeShipping: true,
  requireInventory: true,
  shippingWeight: '',
  productWeight: '',
  productHeight: '',
  productWidth: '',
  productDepth: '',
  keywords: '',
  smallImageUrl: '',
  mediumImageUrl: '',
  largeImageUrl: '',
  detailImageUrl: '',
};

function formatDateForInput(value) {
  if (!value) return '';
  return String(value).substring(0, 10);
}

export function productDtoToForm(dto) {
  return {
    productId: dto.productId || '',
    productTypeId: dto.productTypeId || 'FINISHED_GOOD',
    primaryProductCategoryId: dto.primaryProductCategoryId || '',
    statusId: dto.statusId || 'DRAFT',
    internalName: dto.internalName || '',
    brandName: dto.brandName || '',
    productName: dto.productName || '',
    sku: dto.sku || '',
    description: dto.description || '',
    longDescription: dto.longDescription || '',
    comments: dto.comments || '',
    introductionDate: formatDateForInput(dto.introductionDate),
    releaseDate: formatDateForInput(dto.releaseDate),
    salesDiscontinuationDate: formatDateForInput(dto.salesDiscontinuationDate),
    virtualProduct: Boolean(dto.virtualProduct),
    variant: Boolean(dto.variant),
    returnable: dto.returnable !== false,
    taxable: dto.taxable !== false,
    chargeShipping: dto.chargeShipping !== false,
    requireInventory: dto.requireInventory !== false,
    shippingWeight: dto.shippingWeight != null ? String(dto.shippingWeight) : '',
    productWeight: dto.productWeight != null ? String(dto.productWeight) : '',
    productHeight: dto.productHeight != null ? String(dto.productHeight) : '',
    productWidth: dto.productWidth != null ? String(dto.productWidth) : '',
    productDepth: dto.productDepth != null ? String(dto.productDepth) : '',
    keywords: (dto.keywords || []).join(', '),
    smallImageUrl: dto.smallImageUrl || '',
    mediumImageUrl: dto.mediumImageUrl || '',
    largeImageUrl: dto.largeImageUrl || '',
    detailImageUrl: dto.detailImageUrl || '',
  };
}

export function productFormToPayload(form, isEdit = false) {
  const payload = {
    productTypeId: form.productTypeId,
    primaryProductCategoryId: form.primaryProductCategoryId || undefined,
    statusId: form.statusId,
    internalName: form.internalName || form.productName,
    brandName: form.brandName || undefined,
    productName: form.productName,
    sku: form.sku || undefined,
    description: form.description || undefined,
    longDescription: form.longDescription || undefined,
    comments: form.comments || undefined,
    introductionDate: form.introductionDate ? `${form.introductionDate}T00:00:00` : undefined,
    releaseDate: form.releaseDate ? `${form.releaseDate}T00:00:00` : undefined,
    salesDiscontinuationDate: form.salesDiscontinuationDate
      ? `${form.salesDiscontinuationDate}T00:00:00`
      : undefined,
    virtualProduct: form.virtualProduct,
    variant: form.variant,
    returnable: form.returnable,
    taxable: form.taxable,
    chargeShipping: form.chargeShipping,
    requireInventory: form.requireInventory,
    shippingWeight: form.shippingWeight ? Number(form.shippingWeight) : undefined,
    productWeight: form.productWeight ? Number(form.productWeight) : undefined,
    productHeight: form.productHeight ? Number(form.productHeight) : undefined,
    productWidth: form.productWidth ? Number(form.productWidth) : undefined,
    productDepth: form.productDepth ? Number(form.productDepth) : undefined,
    keywords: form.keywords
      ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [],
    smallImageUrl: form.smallImageUrl || undefined,
    mediumImageUrl: form.mediumImageUrl || undefined,
    largeImageUrl: form.largeImageUrl || undefined,
    detailImageUrl: form.detailImageUrl || undefined,
  };

  if (!isEdit) {
    payload.productId = form.productId.trim() || undefined;
  }

  return payload;
}
