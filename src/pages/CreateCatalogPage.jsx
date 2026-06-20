import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProdCatalog } from '../api/catalogApi';
import FormField from '../components/FormField';

const initialForm = {
  prodCatalogId: '',
  catalogName: '',
  useQuickAdd: 'Y',
  styleSheet: '',
  headerLogo: '',
  contentPathPrefix: '',
  templatePathPrefix: '',
  viewAllowPermReqd: 'N',
  purchaseAllowPermReqd: 'N',
};

function toPayload(form) {
  return {
    prodCatalogId: form.prodCatalogId.trim() || undefined,
    catalogName: form.catalogName.trim(),
    useQuickAdd: form.useQuickAdd,
    styleSheet: form.styleSheet.trim() || undefined,
    headerLogo: form.headerLogo.trim() || undefined,
    contentPathPrefix: form.contentPathPrefix.trim() || undefined,
    templatePathPrefix: form.templatePathPrefix.trim() || undefined,
    viewAllowPermReqd: form.viewAllowPermReqd,
    purchaseAllowPermReqd: form.purchaseAllowPermReqd,
  };
}

export default function CreateCatalogPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.catalogName.trim()) {
      setError('Catalog name is required.');
      return;
    }

    setLoading(true);
    try {
      const created = await createProdCatalog(toPayload(form));
      setSuccess(`Catalog "${created.catalogName}" (${created.prodCatalogId}) created successfully.`);
      setTimeout(() => navigate('/catalog/find'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to create catalog');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>New Product Catalog</span>
          <Link to="/catalog/find" className="add-product-link">
            Back to Find Catalog
          </Link>
        </div>
        <div className="screenlet-body">
          <p>OFBiz EditProdCatalog — create a new product catalog.</p>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField label="Catalog ID">
                <input
                  type="text"
                  maxLength={20}
                  value={form.prodCatalogId}
                  onChange={(e) => updateField('prodCatalogId', e.target.value)}
                  placeholder="Auto-generated if left blank"
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
              <FormField label="Header Logo">
                <input
                  type="text"
                  maxLength={250}
                  value={form.headerLogo}
                  onChange={(e) => updateField('headerLogo', e.target.value)}
                />
              </FormField>
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
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create Catalog'}
              </button>
              <Link to="/catalog/find" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
