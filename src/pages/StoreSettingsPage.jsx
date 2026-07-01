import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStoreSettings, updateStoreSettings } from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

const PAGE_FIELDS = [
  {
    key: 'contactUsContent',
    label: 'Contact Us',
    hint: 'Shown on the eCart Contact Us page (/contact).',
  },
  {
    key: 'aboutUsContent',
    label: 'About Us',
    hint: 'Shown on /pages/about-us.',
  },
  {
    key: 'shippingPolicyContent',
    label: 'Shipping Policy',
    hint: 'Shown on /pages/shipping-policy.',
  },
  {
    key: 'returnsContent',
    label: 'Returns',
    hint: 'Shown on /pages/refund-policy.',
  },
  {
    key: 'privacyPolicyContent',
    label: 'Privacy Policy',
    hint: 'Shown on /pages/privacy-policy.',
  },
  {
    key: 'termsAndConditionsContent',
    label: 'Terms and Conditions',
    hint: 'Shown on /pages/terms-and-conditions.',
  },
];

const emptyForm = {
  defaultStore: false,
  contactUsContent: '',
  aboutUsContent: '',
  shippingPolicyContent: '',
  returnsContent: '',
  privacyPolicyContent: '',
  termsAndConditionsContent: '',
};

export default function StoreSettingsPage() {
  const { productStoreId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchStoreSettings(productStoreId)
      .then((data) => {
        setForm({
          defaultStore: Boolean(data.defaultStore),
          contactUsContent: data.contactUsContent || '',
          aboutUsContent: data.aboutUsContent || '',
          shippingPolicyContent: data.shippingPolicyContent || '',
          returnsContent: data.returnsContent || '',
          privacyPolicyContent: data.privacyPolicyContent || '',
          termsAndConditionsContent: data.termsAndConditionsContent || '',
        });
      })
      .catch((err) => setError(err.message || 'Failed to load store settings'))
      .finally(() => setLoading(false));
  }, [productStoreId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await updateStoreSettings(productStoreId, form);
      setSuccess('Store settings saved.');
    } catch (err) {
      setError(err.message || 'Failed to save store settings');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading settings…</p>;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="screenlet">
        <div className="screenlet-title">Storefront Settings</div>
        <div className="screenlet-body">
          <p className="hint">
            Enter page content for customer-facing links on the eCart storefront. Catalogs linked on
            the Store tab are used for navigation when this store is marked as default.
          </p>

          <form onSubmit={handleSubmit} className="form-grid">
            <FormField
              label="Default storefront store"
              hint="Only one store can be default. The default store's settings and linked catalogs drive the eCart front end."
              className="full-width"
            >
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.defaultStore}
                  disabled={!canWrite}
                  onChange={(e) => setForm((f) => ({ ...f, defaultStore: e.target.checked }))}
                />
                Use this store as the default for the storefront
              </label>
            </FormField>

            {PAGE_FIELDS.map((field) => (
              <FormField key={field.key} label={field.label} hint={field.hint} className="full-width">
                <textarea
                  rows={8}
                  value={form[field.key]}
                  disabled={!canWrite}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={`Enter ${field.label} content…`}
                />
              </FormField>
            ))}

            {canWrite && (
              <div className="form-actions full-width">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
