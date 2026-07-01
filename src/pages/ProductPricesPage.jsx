import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPricePurposes, fetchPriceTypes } from '../api/catalogApi';
import {
  createProductPrice,
  deleteProductPrice,
  fetchProductPrices,
  updateProductPrice,
} from '../api/pricingApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';
import { emptyDateTimeLocal, formatDateTimeLocal, formatShortDateTime, toApiDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD'];

const emptyAddForm = {
  productPriceTypeId: '',
  productPricePurposeId: '',
  currencyUomId: 'INR',
  productStoreGroupId: '_NA_',
  fromDate: emptyDateTimeLocal(),
  thruDate: '',
  price: '',
  taxPercentage: '18',
  taxInPrice: 'N',
  termUomId: '',
  taxAuthPartyId: '',
  taxAuthGeoId: '',
};

function defaultAddForm(types, purposes, existingPrices = []) {
  const productPricePurposeId = purposes.some((p) => p.id === 'PURCHASE')
    ? 'PURCHASE'
    : purposes[0]?.id || '';
  const currencyUomId = 'INR';
  const productStoreGroupId = '_NA_';

  const usedTypeIds = new Set(
    existingPrices
      .filter(
        (row) =>
          row.productPricePurposeId === productPricePurposeId &&
          row.currencyUomId === currencyUomId &&
          row.productStoreGroupId === productStoreGroupId,
      )
      .map((row) => row.productPriceTypeId),
  );

  const preferredOrder = ['MAXIMUM_PRICE', 'LIST_PRICE', 'DEFAULT_PRICE', 'AVERAGE_COST'];
  const productPriceTypeId =
    preferredOrder.find((id) => types.some((t) => t.id === id) && !usedTypeIds.has(id)) ||
    types.find((t) => !usedTypeIds.has(t.id))?.id ||
    (types.some((t) => t.id === 'DEFAULT_PRICE') ? 'DEFAULT_PRICE' : types[0]?.id || '');

  return {
    ...emptyAddForm,
    productPriceTypeId,
    productPricePurposeId,
    currencyUomId,
    productStoreGroupId,
    fromDate: emptyDateTimeLocal(),
  };
}

function priceKey(row) {
  return `${row.productPriceTypeId}|${row.productPricePurposeId}|${row.currencyUomId}|${row.productStoreGroupId}|${row.fromDate}`;
}

function referenceLabel(label) {
  if (!label) return '';
  return label.replace(/\s*\[[^\]]+\]$/, '');
}

export default function ProductPricesPage() {
  const { productId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [priceTypes, setPriceTypes] = useState([]);
  const [pricePurposes, setPricePurposes] = useState([]);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [editState, setEditState] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReferences() {
      setReferencesLoading(true);
      try {
        const [types, purposes] = await Promise.all([
          fetchPriceTypes(),
          fetchPricePurposes(),
        ]);
        setPriceTypes(types);
        setPricePurposes(purposes);
        setAddForm(defaultAddForm(types, purposes));
      } catch (err) {
        setError(err.message || 'Failed to load price type and purpose options');
      } finally {
        setReferencesLoading(false);
      }
    }
    loadReferences();
  }, []);

  useEffect(() => {
    loadPrices();
  }, [productId]);

  async function loadPrices() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProductPrices(productId);
      setPrices(data);
    } catch (err) {
      setError(err.message || 'Failed to load product prices');
    } finally {
      setLoading(false);
    }
  }

  function buildPayload(form, rowKeyFields) {
    return {
      ...rowKeyFields,
      thruDate: form.thruDate ? toApiDateTime(form.thruDate) : null,
      price: form.price !== '' ? Number(form.price) : undefined,
      taxPercentage: form.taxPercentage !== '' ? Number(form.taxPercentage) : undefined,
      taxInPrice: form.taxInPrice || 'N',
      termUomId: form.termUomId || undefined,
      taxAuthPartyId: form.taxAuthPartyId || undefined,
      taxAuthGeoId: form.taxAuthGeoId || undefined,
    };
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await createProductPrice(productId, buildPayload(addForm, {
        productPriceTypeId: addForm.productPriceTypeId,
        productPricePurposeId: addForm.productPricePurposeId,
        currencyUomId: addForm.currencyUomId,
        productStoreGroupId: addForm.productStoreGroupId || '_NA_',
        fromDate: toApiDateTime(addForm.fromDate),
      }));
      setSuccess('Product price created.');
      setAddForm(
        defaultAddForm(priceTypes, pricePurposes, [
          ...prices,
          {
            productPriceTypeId: addForm.productPriceTypeId,
            productPricePurposeId: addForm.productPricePurposeId,
            currencyUomId: addForm.currencyUomId,
            productStoreGroupId: addForm.productStoreGroupId || '_NA_',
          },
        ]),
      );
      loadPrices();
    } catch (err) {
      setError(err.message || 'Failed to create price');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(row) {
    const key = priceKey(row);
    const edit = editState[key] || {};
    setError('');
    setSuccess('');
    try {
      await updateProductPrice(productId, buildPayload(edit, {
        productPriceTypeId: row.productPriceTypeId,
        productPricePurposeId: row.productPricePurposeId,
        currencyUomId: row.currencyUomId,
        productStoreGroupId: row.productStoreGroupId,
        fromDate: row.fromDate,
      }));
      setSuccess('Product price updated.');
      loadPrices();
    } catch (err) {
      setError(err.message || 'Failed to update price');
    }
  }

  async function handleDelete(row) {
    if (!window.confirm('Delete this product price?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteProductPrice(productId, {
        productPriceTypeId: row.productPriceTypeId,
        productPricePurposeId: row.productPricePurposeId,
        currencyUomId: row.currencyUomId,
        productStoreGroupId: row.productStoreGroupId,
        fromDate: row.fromDate,
      });
      setSuccess('Product price deleted.');
      loadPrices();
    } catch (err) {
      setError(err.message || 'Failed to delete price');
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Loading prices…</p>
      ) : (
        <>
          <div className="screenlet product-prices-screenlet">
            <div className="screenlet-title">Product Prices</div>
            <div className="screenlet-body">
              <p>
                OFBiz ProductPrice — multiple price types per product with GST/tax percentage.
                Prices are stored in the pricing service.
              </p>
              <div className="product-prices-table-wrap">
                <table className="data-table product-prices-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Purpose</th>
                      <th>Curr.</th>
                      <th>Store</th>
                      <th>From</th>
                      <th>Thru</th>
                      <th>Price</th>
                      <th>Tax %</th>
                      <th>Excl.</th>
                      <th>Incl.</th>
                      <th>Tax</th>
                      {canWrite && <th className="col-actions">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {prices.length === 0 ? (
                      <tr>
                        <td colSpan={canWrite ? 12 : 11} className="empty-row">
                          No prices defined for this product.
                        </td>
                      </tr>
                    ) : (
                      prices.map((row) => {
                        const key = priceKey(row);
                        const edit = editState[key] || {
                          thruDate: formatDateTimeLocal(row.thruDate),
                          price: row.price != null ? String(row.price) : '',
                          taxPercentage: row.taxPercentage != null ? String(row.taxPercentage) : '',
                          taxInPrice: row.taxInPrice || 'N',
                        };
                        return (
                          <tr key={key}>
                            <td className="col-type">{row.productPriceTypeDescription || row.productPriceTypeId}</td>
                            <td className="col-purpose">{row.productPricePurposeDescription || row.productPricePurposeId}</td>
                            <td>{row.currencyUomId}</td>
                            <td>{row.productStoreGroupId}</td>
                            <td className="col-date">{formatShortDateTime(row.fromDate)}</td>
                            <td className="col-thru">
                              {canWrite ? (
                                <input
                                  className="input-compact input-datetime"
                                  type="datetime-local"
                                  value={edit.thruDate}
                                  onChange={(e) =>
                                    setEditState((s) => ({
                                      ...s,
                                      [key]: { ...edit, thruDate: e.target.value },
                                    }))
                                  }
                                />
                              ) : (
                                formatShortDateTime(row.thruDate)
                              )}
                            </td>
                            <td className="col-price">
                              {canWrite ? (
                                <input
                                  className="input-compact input-number"
                                  type="number"
                                  step="0.001"
                                  value={edit.price}
                                  onChange={(e) =>
                                    setEditState((s) => ({
                                      ...s,
                                      [key]: { ...edit, price: e.target.value },
                                    }))
                                  }
                                />
                              ) : (
                                row.price
                              )}
                            </td>
                            <td className="col-tax">
                              {canWrite ? (
                                <input
                                  className="input-compact input-number"
                                  type="number"
                                  step="0.01"
                                  value={edit.taxPercentage}
                                  onChange={(e) =>
                                    setEditState((s) => ({
                                      ...s,
                                      [key]: { ...edit, taxPercentage: e.target.value },
                                    }))
                                  }
                                />
                              ) : (
                                row.taxPercentage ?? '—'
                              )}
                            </td>
                            <td className="col-amount">{row.priceWithoutTax ?? '—'}</td>
                            <td className="col-amount">{row.priceWithTax ?? '—'}</td>
                            <td className="col-amount">{row.taxAmount ?? '—'}</td>
                            {canWrite && (
                              <td className="actions-cell col-actions">
                                <button type="button" className="btn-secondary btn-compact" onClick={() => handleUpdate(row)}>
                                  Update
                                </button>
                                <button type="button" className="btn-secondary btn-compact" onClick={() => handleDelete(row)}>
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="screenlet">
              <div className="screenlet-title">Add Product Price</div>
              <div className="screenlet-body">
                <form onSubmit={handleAdd} className="form-grid">
                  <FormField label="Price Type *">
                    <select
                      required
                      disabled={referencesLoading || priceTypes.length === 0}
                      value={addForm.productPriceTypeId}
                      onChange={(e) => setAddForm((p) => ({ ...p, productPriceTypeId: e.target.value }))}
                    >
                      {referencesLoading ? (
                        <option value="">Loading price types…</option>
                      ) : priceTypes.length === 0 ? (
                        <option value="">No price types available</option>
                      ) : (
                        priceTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {referenceLabel(t.label)}
                          </option>
                        ))
                      )}
                    </select>
                  </FormField>
                  <FormField label="Purpose *">
                    <select
                      required
                      disabled={referencesLoading || pricePurposes.length === 0}
                      value={addForm.productPricePurposeId}
                      onChange={(e) => setAddForm((p) => ({ ...p, productPricePurposeId: e.target.value }))}
                    >
                      {referencesLoading ? (
                        <option value="">Loading purposes…</option>
                      ) : pricePurposes.length === 0 ? (
                        <option value="">No purposes available</option>
                      ) : (
                        pricePurposes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {referenceLabel(p.label)}
                          </option>
                        ))
                      )}
                    </select>
                  </FormField>
                  <FormField label="Currency *">
                    <select
                      value={addForm.currencyUomId}
                      onChange={(e) => setAddForm((p) => ({ ...p, currencyUomId: e.target.value }))}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Store Group" hint="Default _NA_ for all store groups.">
                    <input
                      value={addForm.productStoreGroupId}
                      onChange={(e) => setAddForm((p) => ({ ...p, productStoreGroupId: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="From Date *">
                    <input
                      type="datetime-local"
                      required
                      value={addForm.fromDate}
                      onChange={(e) => setAddForm((p) => ({ ...p, fromDate: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Thru Date">
                    <input
                      type="datetime-local"
                      value={addForm.thruDate}
                      onChange={(e) => setAddForm((p) => ({ ...p, thruDate: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Price *">
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={addForm.price}
                      onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="GST / Tax %">
                    <input
                      type="number"
                      step="0.01"
                      value={addForm.taxPercentage}
                      onChange={(e) => setAddForm((p) => ({ ...p, taxPercentage: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Tax Included in Price">
                    <select
                      value={addForm.taxInPrice}
                      onChange={(e) => setAddForm((p) => ({ ...p, taxInPrice: e.target.value }))}
                    >
                      <option value="N">No</option>
                      <option value="Y">Yes</option>
                    </select>
                  </FormField>
                  <FormField label="Term UOM">
                    <input
                      value={addForm.termUomId}
                      onChange={(e) => setAddForm((p) => ({ ...p, termUomId: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Tax Auth Party ID">
                    <input
                      value={addForm.taxAuthPartyId}
                      onChange={(e) => setAddForm((p) => ({ ...p, taxAuthPartyId: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Tax Auth Geo ID">
                    <input
                      value={addForm.taxAuthGeoId}
                      onChange={(e) => setAddForm((p) => ({ ...p, taxAuthGeoId: e.target.value }))}
                    />
                  </FormField>
                  <div className="form-actions full-width">
                    <button
                      className="btn-primary"
                      type="submit"
                      disabled={submitting || referencesLoading || !addForm.productPriceTypeId || !addForm.productPricePurposeId}
                    >
                      {submitting ? 'Creating…' : 'Add Price'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
