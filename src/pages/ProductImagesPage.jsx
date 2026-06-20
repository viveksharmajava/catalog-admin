import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProduct, updateProduct } from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';
import { productDtoToForm, productFormToPayload } from '../utils/productForm';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

const imageFields = [
  { key: 'smallImageUrl', label: 'Small Image URL' },
  { key: 'mediumImageUrl', label: 'Medium Image URL' },
  { key: 'largeImageUrl', label: 'Large Image URL' },
  { key: 'detailImageUrl', label: 'Detail Image URL' },
];

export default function ProductImagesPage() {
  const { productId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [form, setForm] = useState({
    smallImageUrl: '',
    mediumImageUrl: '',
    largeImageUrl: '',
    detailImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    setLoading(true);
    setError('');
    try {
      const product = await fetchProduct(productId);
      setForm({
        smallImageUrl: product.smallImageUrl || '',
        mediumImageUrl: product.mediumImageUrl || '',
        largeImageUrl: product.largeImageUrl || '',
        detailImageUrl: product.detailImageUrl || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load product images');
    } finally {
      setLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const current = await fetchProduct(productId);
      const merged = {
        ...productDtoToForm(current),
        ...form,
      };
      await updateProduct(productId, productFormToPayload(merged, true));
      setSuccess('Image URLs updated.');
    } catch (err) {
      setError(err.message || 'Failed to update images');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screenlet">
      <div className="screenlet-title">Product Images</div>
      <div className="screenlet-body">
        <p>Image URLs stored on the product record (OFBiz small / medium / large / detail).</p>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p>Loading images…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid product-images-grid">
              {imageFields.map(({ key, label }) => (
                <FormField key={key} label={label} className="full-width">
                  <input
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    placeholder="https://…"
                    readOnly={!canWrite}
                    disabled={!canWrite}
                    className={!canWrite ? 'readonly-field' : undefined}
                  />
                  {form[key] && (
                    <a href={form[key]} target="_blank" rel="noreferrer" className="image-preview-link">
                      Preview
                    </a>
                  )}
                </FormField>
              ))}
            </div>
            {canWrite && (
              <div className="form-actions">
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Images'}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
