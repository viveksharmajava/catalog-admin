import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  addStoreCatalog,
  createProductStore,
  fetchProductStore,
  fetchStoreCatalogs,
  listAllProdCatalogs,
  removeStoreCatalog,
  updateProductStore,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import CollapsibleSection from '../components/CollapsibleSection';
import FormField from '../components/FormField';
import {
  initialStoreForm,
  storeDtoToForm,
  storeFormToPayload,
} from '../utils/storeForm';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

function YesNoSelect({ value, onChange, disabled }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value="Y">Yes</option>
      <option value="N">No</option>
    </select>
  );
}

export default function StoreFormPage() {
  const { productStoreId } = useParams();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);
  const isEdit = Boolean(productStoreId);

  const [form, setForm] = useState(initialStoreForm);
  const [catalogOptions, setCatalogOptions] = useState([]);
  const [storeCatalogs, setStoreCatalogs] = useState([]);
  const [catalogToAdd, setCatalogToAdd] = useState('');
  const [loadingStore, setLoadingStore] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    listAllProdCatalogs()
      .then((res) => setCatalogOptions(res.content || []))
      .catch(() => setCatalogOptions([]));
  }, []);

  useEffect(() => {
    if (!isEdit || !productStoreId) return;

    async function loadStore() {
      setLoadingStore(true);
      setError('');
      try {
        const store = await fetchProductStore(productStoreId);
        setForm(storeDtoToForm(store));
        const catalogs = await fetchStoreCatalogs(productStoreId);
        setStoreCatalogs(catalogs);
      } catch (err) {
        setError(err.message || 'Failed to load product store');
      } finally {
        setLoadingStore(false);
      }
    }
    loadStore();
  }, [isEdit, productStoreId]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setError('');
    setSuccess('');

    if (!form.storeName.trim()) {
      setError('Store name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updateProductStore(productStoreId, storeFormToPayload(form, true));
        setSuccess(`Store updated: ${updated.storeName} (${updated.productStoreId})`);
      } else {
        const created = await createProductStore(storeFormToPayload(form, false));
        setSuccess(`Store created: ${created.storeName} (${created.productStoreId})`);
        setTimeout(() => navigate(`/stores/edit/${encodeURIComponent(created.productStoreId)}`), 1000);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} store`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddCatalog(e) {
    e.preventDefault();
    if (!catalogToAdd) return;
    setError('');
    setSuccess('');
    try {
      await addStoreCatalog(productStoreId, { prodCatalogId: catalogToAdd });
      setSuccess('Catalog linked to store.');
      setCatalogToAdd('');
      const catalogs = await fetchStoreCatalogs(productStoreId);
      setStoreCatalogs(catalogs);
    } catch (err) {
      setError(err.message || 'Failed to link catalog');
    }
  }

  async function handleRemoveCatalog(row) {
    if (!window.confirm(`Remove catalog ${row.prodCatalogId} from this store?`)) return;
    setError('');
    setSuccess('');
    try {
      await removeStoreCatalog(productStoreId, row.prodCatalogId, row.fromDate);
      setSuccess('Catalog removed from store.');
      const catalogs = await fetchStoreCatalogs(productStoreId);
      setStoreCatalogs(catalogs);
    } catch (err) {
      setError(err.message || 'Failed to remove catalog link');
    }
  }

  const linkedCatalogIds = new Set(storeCatalogs.map((c) => c.prodCatalogId));
  const availableCatalogs = catalogOptions.filter((c) => !linkedCatalogIds.has(c.prodCatalogId));

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>{isEdit ? 'Edit Product Store' : 'Create Product Store'}</span>
          <Link to="/stores" className="add-product-link">
            Back to Stores
          </Link>
        </div>
        <div className="screenlet-body">
          <p>
            {isEdit
              ? 'Update product store configuration (OFBiz EditProductStore).'
              : 'Create a new product store with channel, inventory, and financial settings.'}
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {loadingStore ? (
            <p>Loading store…</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <fieldset disabled={!canWrite} className={!canWrite ? 'readonly-form' : undefined}>
                <CollapsibleSection title="Product Store" defaultOpen>
                  <div className="form-grid">
                    <FormField
                      label="Store ID"
                      hint={isEdit ? 'Read-only identifier.' : 'Auto-generated if left blank.'}
                    >
                      <input
                        value={form.productStoreId}
                        onChange={(e) => updateField('productStoreId', e.target.value)}
                        readOnly={isEdit}
                        disabled={isEdit}
                        className={isEdit ? 'readonly-field' : undefined}
                      />
                    </FormField>
                    <FormField label="Store Name *">
                      <input
                        value={form.storeName}
                        onChange={(e) => updateField('storeName', e.target.value)}
                        required
                      />
                    </FormField>
                    <FormField label="Company Name">
                      <input
                        value={form.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Title">
                      <input value={form.title} onChange={(e) => updateField('title', e.target.value)} />
                    </FormField>
                    <FormField label="Subtitle" className="full-width">
                      <input
                        value={form.subtitle}
                        onChange={(e) => updateField('subtitle', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Primary Store Group ID">
                      <input
                        value={form.primaryStoreGroupId}
                        onChange={(e) => updateField('primaryStoreGroupId', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Pay To Party ID">
                      <input
                        value={form.payToPartyId}
                        onChange={(e) => updateField('payToPartyId', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Visual Theme ID">
                      <input
                        value={form.visualThemeId}
                        onChange={(e) => updateField('visualThemeId', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Demo Store">
                      <YesNoSelect
                        value={form.isDemoStore}
                        onChange={(v) => updateField('isDemoStore', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Inventory" defaultOpen={false}>
                  <div className="form-grid">
                    <FormField label="Inventory Facility ID">
                      <input
                        value={form.inventoryFacilityId}
                        onChange={(e) => updateField('inventoryFacilityId', e.target.value)}
                      />
                    </FormField>
                    <FormField label="One Inventory Facility">
                      <YesNoSelect
                        value={form.oneInventoryFacility}
                        onChange={(v) => updateField('oneInventoryFacility', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Check Inventory">
                      <YesNoSelect
                        value={form.checkInventory}
                        onChange={(v) => updateField('checkInventory', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Reserve Inventory">
                      <YesNoSelect
                        value={form.reserveInventory}
                        onChange={(v) => updateField('reserveInventory', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Require Inventory">
                      <YesNoSelect
                        value={form.requireInventory}
                        onChange={(v) => updateField('requireInventory', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Show Out Of Stock Products">
                      <YesNoSelect
                        value={form.showOutOfStockProducts}
                        onChange={(v) => updateField('showOutOfStockProducts', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Immediately Fulfilled">
                      <YesNoSelect
                        value={form.isImmediatelyFulfilled}
                        onChange={(v) => updateField('isImmediatelyFulfilled', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Localisation & Financial" defaultOpen={false}>
                  <div className="form-grid">
                    <FormField label="Default Locale">
                      <input
                        value={form.defaultLocaleString}
                        onChange={(e) => updateField('defaultLocaleString', e.target.value)}
                        placeholder="en_US"
                      />
                    </FormField>
                    <FormField label="Default Currency UOM">
                      <input
                        value={form.defaultCurrencyUomId}
                        onChange={(e) => updateField('defaultCurrencyUomId', e.target.value)}
                        placeholder="USD"
                      />
                    </FormField>
                    <FormField label="Default Time Zone">
                      <input
                        value={form.defaultTimeZoneString}
                        onChange={(e) => updateField('defaultTimeZoneString', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Show Prices With VAT Tax">
                      <YesNoSelect
                        value={form.showPricesWithVatTax}
                        onChange={(v) => updateField('showPricesWithVatTax', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Orders" defaultOpen={false}>
                  <div className="form-grid">
                    <FormField label="Order Number Prefix">
                      <input
                        value={form.orderNumberPrefix}
                        onChange={(e) => updateField('orderNumberPrefix', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Default Sales Channel Enum ID">
                      <input
                        value={form.defaultSalesChannelEnumId}
                        onChange={(e) => updateField('defaultSalesChannelEnumId', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Auto Approve Order">
                      <YesNoSelect
                        value={form.autoApproveOrder}
                        onChange={(v) => updateField('autoApproveOrder', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Auto Approve Invoice">
                      <YesNoSelect
                        value={form.autoApproveInvoice}
                        onChange={(v) => updateField('autoApproveInvoice', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Days To Cancel Non-Pay">
                      <input
                        type="number"
                        value={form.daysToCancelNonPay}
                        onChange={(e) => updateField('daysToCancelNonPay', e.target.value)}
                      />
                    </FormField>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Shopping Cart & Shipping" defaultOpen={false}>
                  <div className="form-grid">
                    <FormField label="View Cart On Add">
                      <YesNoSelect
                        value={form.viewCartOnAdd}
                        onChange={(v) => updateField('viewCartOnAdd', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Auto Save Cart">
                      <YesNoSelect
                        value={form.autoSaveCart}
                        onChange={(v) => updateField('autoSaveCart', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Prorate Shipping">
                      <YesNoSelect
                        value={form.prorateShipping}
                        onChange={(v) => updateField('prorateShipping', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Prorate Taxes">
                      <YesNoSelect
                        value={form.prorateTaxes}
                        onChange={(v) => updateField('prorateTaxes', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Exclude Variants In Search">
                      <YesNoSelect
                        value={form.prodSearchExcludeVariants}
                        onChange={(v) => updateField('prodSearchExcludeVariants', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Payments & Visitors" defaultOpen={false}>
                  <div className="form-grid">
                    <FormField label="Manual Auth Is Capture">
                      <YesNoSelect
                        value={form.manualAuthIsCapture}
                        onChange={(v) => updateField('manualAuthIsCapture', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Retry Failed Auths">
                      <YesNoSelect
                        value={form.retryFailedAuths}
                        onChange={(v) => updateField('retryFailedAuths', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Allow Password">
                      <YesNoSelect
                        value={form.allowPassword}
                        onChange={(v) => updateField('allowPassword', v)}
                        disabled={!canWrite}
                      />
                    </FormField>
                    <FormField label="Default Password">
                      <input
                        value={form.defaultPassword}
                        onChange={(e) => updateField('defaultPassword', e.target.value)}
                      />
                    </FormField>
                  </div>
                </CollapsibleSection>
              </fieldset>

              {canWrite && (
                <div className="form-actions">
                  <button className="btn-primary" type="submit" disabled={submitting}>
                    {submitting ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update Store' : 'Create Store'}
                  </button>
                </div>
              )}
            </form>
          )}

          {isEdit && canWrite && (
            <div className="screenlet nested-screenlet">
              <div className="screenlet-title">Catalog Linking</div>
              <div className="screenlet-body">
                <p>Link product catalogs to this store (ProductStoreCatalog).</p>
                <form className="inline-add-form" onSubmit={handleAddCatalog}>
                  <FormField label="Add Catalog">
                    <select value={catalogToAdd} onChange={(e) => setCatalogToAdd(e.target.value)} required>
                      <option value="">— Select catalog —</option>
                      {availableCatalogs.map((c) => (
                        <option key={c.prodCatalogId} value={c.prodCatalogId}>
                          {c.catalogName} [{c.prodCatalogId}]
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <button className="btn-primary" type="submit" disabled={!catalogToAdd}>
                    Link Catalog
                  </button>
                </form>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Catalog ID</th>
                        <th>Catalog Name</th>
                        <th>From Date</th>
                        <th>Sequence</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeCatalogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-row">
                            No catalogs linked to this store.
                          </td>
                        </tr>
                      ) : (
                        storeCatalogs.map((row) => (
                          <tr key={`${row.prodCatalogId}-${row.fromDate}`}>
                            <td>{row.prodCatalogId}</td>
                            <td>{row.catalogName}</td>
                            <td>{row.fromDate}</td>
                            <td>{row.sequenceNum}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-link-danger"
                                onClick={() => handleRemoveCatalog(row)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
