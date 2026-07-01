import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createProdCatalog,
  fetchProdCatalog,
  updateProdCatalog,
  uploadCatalogImage,
} from '../api/catalogApi';
import FormField from '../components/FormField';
import EntityImageUpload from '../components/EntityImageUpload';
import {
  catalogDtoToForm,
  catalogFormToPayload,
  initialCatalogForm,
} from '../utils/catalogForm';

export default function CatalogFormPage() {
  const { prodCatalogId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(prodCatalogId);

  const [form, setForm] = useState(initialCatalogForm);
  const [loadingCatalog, setLoadingCatalog] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit || !prodCatalogId) return;

    async function loadCatalog() {
      setLoadingCatalog(true);
      setError('');
      try {
        const catalog = await fetchProdCatalog(prodCatalogId);
        setForm(catalogDtoToForm(catalog));
      } catch (err) {
        setError(err.message || 'Failed to load catalog');
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, [isEdit, prodCatalogId]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadImageIfNeeded(prodCatalogId) {
    if (!imageFile || !prodCatalogId) return;
    const result = await uploadCatalogImage(prodCatalogId, imageFile);
    setForm((prev) => ({ ...prev, headerLogo: result.url || '' }));
    setImageFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.catalogName.trim()) {
      setError('Catalog name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updateProdCatalog(prodCatalogId, catalogFormToPayload(form, true));
        await uploadImageIfNeeded(updated.prodCatalogId);
        setSuccess(`Catalog "${updated.catalogName}" (${updated.prodCatalogId}) updated successfully.`);
      } else {
        const created = await createProdCatalog(catalogFormToPayload(form, false));
        await uploadImageIfNeeded(created.prodCatalogId);
        setSuccess(`Catalog "${created.catalogName}" (${created.prodCatalogId}) created successfully.`);
        setTimeout(() => navigate(`/catalog/${encodeURIComponent(created.prodCatalogId)}/catalog`), 1200);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} catalog`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>{isEdit ? 'Edit Product Catalog' : 'New Product Catalog'}</span>
          <Link to="/catalog/find" className="add-product-link">
            Back to Find Catalog
          </Link>
        </div>
        <div className="screenlet-body">
          <p>
            {isEdit
              ? 'Update catalog details. Catalog ID cannot be changed.'
              : 'OFBiz EditProdCatalog — create a new product catalog.'}
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {loadingCatalog ? (
            <p>Loading catalog…</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <FormField
                  label="Catalog ID"
                  hint={isEdit ? 'Read-only identifier.' : 'Auto-generated if left blank.'}
                >
                  <input
                    type="text"
                    maxLength={20}
                    value={form.prodCatalogId}
                    onChange={(e) => updateField('prodCatalogId', e.target.value)}
                    placeholder="Auto-generated if left blank"
                    readOnly={isEdit}
                    disabled={isEdit}
                    className={isEdit ? 'readonly-field' : undefined}
                  />
                </FormField>
                <FormField label="Catalog Name *">
                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={form.catalogName}
                    onChange={(e) => updateField('catalogName', e.target.value)}
                  />
                </FormField>
                <FormField
                  label="Cart Enabled (eCart)"
                  hint="When true, this catalog appears in the eCart storefront navigation."
                >
                  <select
                    value={form.isCartEnabled ? 'true' : 'false'}
                    onChange={(e) => updateField('isCartEnabled', e.target.value === 'true')}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </FormField>
                <FormField label="Use Quick Add">
                  <select value={form.useQuickAdd} onChange={(e) => updateField('useQuickAdd', e.target.value)}>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </FormField>
                <FormField label="Style Sheet">
                  <input
                    type="text"
                    maxLength={250}
                    value={form.styleSheet}
                    onChange={(e) => updateField('styleSheet', e.target.value)}
                  />
                </FormField>
                <EntityImageUpload
                  entityId={isEdit ? prodCatalogId : undefined}
                  imageUrl={form.headerLogo}
                  onImageUrlChange={(url) => updateField('headerLogo', url)}
                  uploadImage={uploadCatalogImage}
                  pendingFile={imageFile}
                  onPendingFileChange={setImageFile}
                  uploadOnSubmit={!isEdit}
                  label="Catalog Image (Header Logo)"
                  hint="Upload catalog logo or banner. On create, the image uploads when you save."
                />
                <FormField label="Content Path Prefix">
                  <input
                    type="text"
                    maxLength={255}
                    value={form.contentPathPrefix}
                    onChange={(e) => updateField('contentPathPrefix', e.target.value)}
                  />
                </FormField>
                <FormField label="Template Path Prefix">
                  <input
                    type="text"
                    maxLength={255}
                    value={form.templatePathPrefix}
                    onChange={(e) => updateField('templatePathPrefix', e.target.value)}
                  />
                </FormField>
                <FormField label="View Allow Permission Required">
                  <select
                    value={form.viewAllowPermReqd}
                    onChange={(e) => updateField('viewAllowPermReqd', e.target.value)}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </FormField>
                <FormField label="Purchase Allow Permission Required">
                  <select
                    value={form.purchaseAllowPermReqd}
                    onChange={(e) => updateField('purchaseAllowPermReqd', e.target.value)}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </FormField>
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting
                    ? isEdit
                      ? 'Updating…'
                      : 'Creating…'
                    : isEdit
                      ? 'Update Catalog'
                      : 'Create Catalog'}
                </button>
                <Link to="/catalog/find" className="btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
