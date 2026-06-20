import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addProductAttribute, fetchProduct } from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

const emptyForm = {
  attrName: '',
  attrValue: '',
  attrType: '',
  attrDescription: '',
};

export default function ProductAttributesPage() {
  const { productId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [attributes, setAttributes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAttributes();
  }, [productId]);

  async function loadAttributes() {
    setLoading(true);
    setError('');
    try {
      const product = await fetchProduct(productId);
      setAttributes(product.attributes || []);
    } catch (err) {
      setError(err.message || 'Failed to load attributes');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.attrName.trim()) {
      setError('Attribute name is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await addProductAttribute(productId, {
        attrName: form.attrName.trim(),
        attrValue: form.attrValue || undefined,
        attrType: form.attrType || undefined,
        attrDescription: form.attrDescription || undefined,
      });
      setSuccess('Attribute added.');
      setForm(emptyForm);
      await loadAttributes();
    } catch (err) {
      setError(err.message || 'Failed to add attribute');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screenlet">
      <div className="screenlet-title">Product Attributes</div>
      <div className="screenlet-body">
        <p>Extended attributes stored on ProductAttribute.</p>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {canWrite && (
          <form className="form-grid attribute-add-form" onSubmit={handleAdd}>
            <FormField label="Attribute Name *">
              <input
                value={form.attrName}
                onChange={(e) => setForm((prev) => ({ ...prev, attrName: e.target.value }))}
                maxLength={60}
                required
              />
            </FormField>
            <FormField label="Value">
              <input
                value={form.attrValue}
                onChange={(e) => setForm((prev) => ({ ...prev, attrValue: e.target.value }))}
              />
            </FormField>
            <FormField label="Type">
              <input
                value={form.attrType}
                onChange={(e) => setForm((prev) => ({ ...prev, attrType: e.target.value }))}
                maxLength={20}
              />
            </FormField>
            <FormField label="Description" className="full-width">
              <input
                value={form.attrDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, attrDescription: e.target.value }))}
                maxLength={255}
              />
            </FormField>
            <div className="form-actions full-width">
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Attribute'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading attributes…</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {attributes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      No attributes defined for this product.
                    </td>
                  </tr>
                ) : (
                  attributes.map((row) => (
                    <tr key={row.attrName}>
                      <td>{row.attrName}</td>
                      <td>{row.attrValue}</td>
                      <td>{row.attrType}</td>
                      <td>{row.attrDescription}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
