import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useMatch } from 'react-router-dom';
import CollapsibleSection from '../components/CollapsibleSection';
import FormField from '../components/FormField';
import { useAuth } from '../auth/AuthContext';
import {
  createProduct,
  fetchCategories,
  fetchProduct,
  fetchProductStatuses,
  fetchProductTypes,
  updateProduct,
} from '../api/catalogApi';
import {
  initialProductForm,
  productDtoToForm,
  productFormToPayload,
} from '../utils/productForm';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function ProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const inProductScope = Boolean(useMatch('/products/:productId/product'));
  const canWrite = canAccess(WRITE_ROLES);
  const isEdit = Boolean(productId);

  const [form, setForm] = useState(initialProductForm);
  const [productTypes, setProductTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [types, cats, sts] = await Promise.all([
          fetchProductTypes(),
          fetchCategories(),
          fetchProductStatuses(),
        ]);
        setProductTypes(types);
        setCategories(cats);
        setStatuses(sts);
      } catch (err) {
        setError(err.message || 'Failed to load reference data');
      } finally {
        setLoadingRefs(false);
      }
    }
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (!isEdit || !productId) return;

    async function loadProduct() {
      setLoadingProduct(true);
      setError('');
      try {
        const product = await fetchProduct(productId);
        setForm(productDtoToForm(product));
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoadingProduct(false);
      }
    }
    loadProduct();
  }, [isEdit, productId]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isEdit && !canWrite) return;
    setError('');
    setSuccess('');

    if (!form.productName.trim()) {
      setError('Product Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updateProduct(productId, productFormToPayload(form, true));
        setSuccess(`Product updated: ${updated.productId} (${updated.productName})`);
      } else {
        const created = await createProduct(productFormToPayload(form, false));
        setSuccess(`Product created: ${created.productId} (${created.productName})`);
        navigate(`/products/${encodeURIComponent(created.productId)}/product`);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = loadingRefs || loadingProduct;

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>{isEdit ? 'Edit Product' : 'Create Product'}</span>
          {!inProductScope && (
            <Link to="/products/find" className="add-product-link">
              Back to Find Product
            </Link>
          )}
        </div>
        <div className="screenlet-body">
          <p>
            {isEdit
              ? canWrite
                ? 'Update product details. Product ID cannot be changed.'
                : 'View product details (read-only).'
              : 'OFBiz-inspired product create form for the catalog microservice.'}
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {loading ? (
            <p>{loadingProduct ? 'Loading product…' : 'Loading reference data…'}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <fieldset disabled={isEdit && !canWrite} className={isEdit && !canWrite ? 'readonly-form' : undefined}>
              <CollapsibleSection title="Identification" defaultOpen>
                <div className="form-grid">
                  <FormField
                    label="Product ID"
                    hint={isEdit ? 'Read-only identifier.' : 'Optional. Auto-generated if blank.'}
                  >
                    <input
                      value={form.productId}
                      onChange={(e) => updateField('productId', e.target.value)}
                      maxLength={20}
                      placeholder="PROD-..."
                      readOnly={isEdit}
                      disabled={isEdit}
                      className={isEdit ? 'readonly-field' : undefined}
                    />
                  </FormField>
                  <FormField label="SKU">
                    <input
                      value={form.sku}
                      onChange={(e) => updateField('sku', e.target.value)}
                      placeholder="SKU-001"
                    />
                  </FormField>
                  <FormField label="Product Type *">
                    <select
                      value={form.productTypeId}
                      onChange={(e) => updateField('productTypeId', e.target.value)}
                      required
                    >
                      {productTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Primary Category">
                    <select
                      value={form.primaryProductCategoryId}
                      onChange={(e) => updateField('primaryProductCategoryId', e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {categories.map((c) => (
                        <option key={c.productCategoryId} value={c.productCategoryId}>
                          {c.categoryName} [{c.productCategoryId}]
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select
                      value={form.statusId}
                      onChange={(e) => updateField('statusId', e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Virtual Product" className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.virtualProduct}
                      onChange={(e) => updateField('virtualProduct', e.target.checked)}
                    />
                  </FormField>
                  <FormField label="Variant Product" className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.variant}
                      onChange={(e) => updateField('variant', e.target.checked)}
                    />
                  </FormField>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Names & Descriptions" defaultOpen>
                <div className="form-grid">
                  <FormField label="Internal Name *" hint="Required in OFBiz; defaults to product name.">
                    <input
                      value={form.internalName}
                      onChange={(e) => updateField('internalName', e.target.value)}
                      maxLength={255}
                    />
                  </FormField>
                  <FormField label="Brand Name">
                    <input
                      value={form.brandName}
                      onChange={(e) => updateField('brandName', e.target.value)}
                      maxLength={100}
                    />
                  </FormField>
                  <FormField label="Product Name *" className="full-width">
                    <input
                      value={form.productName}
                      onChange={(e) => updateField('productName', e.target.value)}
                      maxLength={100}
                      required
                    />
                  </FormField>
                  <FormField label="Description" className="full-width">
                    <textarea
                      value={form.description}
                      onChange={(e) => updateField('description', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Long Description" className="full-width">
                    <textarea
                      value={form.longDescription}
                      onChange={(e) => updateField('longDescription', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Comments" className="full-width">
                    <textarea
                      value={form.comments}
                      onChange={(e) => updateField('comments', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Keywords" hint="Comma-separated search keywords." className="full-width">
                    <input
                      value={form.keywords}
                      onChange={(e) => updateField('keywords', e.target.value)}
                      placeholder="electronics, sample"
                    />
                  </FormField>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Dates" defaultOpen={false}>
                <div className="form-grid">
                  <FormField label="Introduction Date">
                    <input
                      type="date"
                      value={form.introductionDate}
                      onChange={(e) => updateField('introductionDate', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Release Date">
                    <input
                      type="date"
                      value={form.releaseDate}
                      onChange={(e) => updateField('releaseDate', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Sales Discontinuation Date">
                    <input
                      type="date"
                      value={form.salesDiscontinuationDate}
                      onChange={(e) => updateField('salesDiscontinuationDate', e.target.value)}
                    />
                  </FormField>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Physical / Shipping" defaultOpen={false}>
                <div className="form-grid">
                  <FormField label="Product Weight">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.productWeight}
                      onChange={(e) => updateField('productWeight', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Shipping Weight">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.shippingWeight}
                      onChange={(e) => updateField('shippingWeight', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Height">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.productHeight}
                      onChange={(e) => updateField('productHeight', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Width">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.productWidth}
                      onChange={(e) => updateField('productWidth', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Depth">
                    <input
                      type="number"
                      step="0.000001"
                      value={form.productDepth}
                      onChange={(e) => updateField('productDepth', e.target.value)}
                    />
                  </FormField>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Miscellaneous" defaultOpen={false}>
                <div className="form-grid">
                  <FormField label="Returnable" className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.returnable}
                      onChange={(e) => updateField('returnable', e.target.checked)}
                    />
                  </FormField>
                  <FormField label="Taxable" className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.taxable}
                      onChange={(e) => updateField('taxable', e.target.checked)}
                    />
                  </FormField>
                  <FormField label="Charge Shipping" className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.chargeShipping}
                      onChange={(e) => updateField('chargeShipping', e.target.checked)}
                    />
                  </FormField>
                  <FormField label="Require Inventory" className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.requireInventory}
                      onChange={(e) => updateField('requireInventory', e.target.checked)}
                    />
                  </FormField>
                </div>
              </CollapsibleSection>

              </fieldset>

              <div className="form-actions">
                {(!isEdit || canWrite) && (
                  <button className="btn-primary" type="submit" disabled={submitting}>
                    {submitting ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update Product' : 'Create Product'}
                  </button>
                )}
                {!inProductScope && isEdit && canWrite ? (
                  <button className="btn-secondary" type="button" onClick={() => navigate('/products/find')}>
                    Cancel
                  </button>
                ) : !isEdit ? (
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => {
                      setForm(initialProductForm);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
