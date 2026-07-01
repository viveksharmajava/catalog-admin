import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createOrder,
  fetchOrderStatuses,
  fetchOrderTypes,
} from '../api/ordersApi';
import { fetchProductPrices } from '../api/pricingApi';
import { useAuth } from '../auth/AuthContext';
import AutocompleteInput from '../components/AutocompleteInput';
import FormField from '../components/FormField';
import {
  formatPartyLabel,
  formatProductLabel,
  searchPartiesForAutocomplete,
  searchProductsForAutocomplete,
} from '../utils/autocompleteSearch';
import { resolveListPriceWithGst } from '../utils/orderPricing';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

function emptyLineItem() {
  return { productId: '', quantity: '1', unitPrice: '' };
}

export default function OrderFormPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [partyId, setPartyId] = useState('');
  const [partyHint, setPartyHint] = useState('');
  const [orderTypeId, setOrderTypeId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [currencyUom, setCurrencyUom] = useState('USD');
  const [productStoreId, setProductStoreId] = useState('');
  const [lineItems, setLineItems] = useState([emptyLineItem()]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPartySuggestions = useCallback((query) => searchPartiesForAutocomplete(query), []);
  const fetchProductSuggestions = useCallback((query) => searchProductsForAutocomplete(query), []);

  useEffect(() => {
    async function loadReferences() {
      try {
        const [types, statuses] = await Promise.all([fetchOrderTypes(), fetchOrderStatuses()]);
        setOrderTypes(types);
        setOrderStatuses(statuses);
        if (types.length > 0) setOrderTypeId(types[0].id || types[0].value || '');
        if (statuses.length > 0) setStatusId(statuses[0].id || statuses[0].value || '');
      } catch (err) {
        setError(err.message || 'Failed to load reference data');
      } finally {
        setLoadingRefs(false);
      }
    }
    loadReferences();
  }, []);

  function updateLineItem(index, field, value) {
    setLineItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  }

  function removeLineItem(index) {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleProductSelect(index, product) {
    const productId = product.productId;
    setLineItems((prev) => prev.map((row, i) => (i === index ? { ...row, productId } : row)));

    try {
      const prices = await fetchProductPrices(productId);
      const unitPrice = resolveListPriceWithGst(prices);
      if (unitPrice != null) {
        setLineItems((prev) =>
          prev.map((row, i) => (i === index ? { ...row, unitPrice: String(unitPrice) } : row)),
        );
      }
    } catch {
      // Keep manually entered price when pricing lookup fails.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canWrite) return;
    setError('');
    setSuccess('');

    if (!partyId.trim()) {
      setError('Party ID is required.');
      return;
    }

    const items = lineItems
      .filter((row) => row.productId.trim())
      .map((row) => ({
        productId: row.productId.trim(),
        quantity: Number(row.quantity) || 0,
        unitPrice: Number(row.unitPrice) || 0,
      }));

    if (items.length === 0) {
      setError('Add at least one line item with a product ID.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOrder({
        partyId: partyId.trim(),
        orderTypeId: orderTypeId || undefined,
        statusId: statusId || undefined,
        currencyUom: currencyUom.trim() || undefined,
        productStoreId: productStoreId.trim() || undefined,
        items,
      });
      setSuccess(`Order created: ${created.orderId}`);
      setPartyId('');
      setPartyHint('');
      setProductStoreId('');
      setLineItems([emptyLineItem()]);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  }

  if (!canWrite) {
    return (
      <div className="alert alert-error">
        You do not have permission to create orders.{' '}
        <Link to="/orders/order/find">Find Orders</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Create Order</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="screenlet">
        <div className="screenlet-title">Order Header</div>
        <div className="screenlet-body">
          <form onSubmit={handleSubmit} className="form-grid">
            <FormField
              label="Party"
              required
              hint={partyHint || 'Search by party ID, first name, or last name'}
            >
              <AutocompleteInput
                value={partyId}
                onChange={(value) => {
                  setPartyId(value);
                  setPartyHint('');
                }}
                onSelect={(person) => {
                  setPartyId(person.partyId);
                  setPartyHint(formatPartyLabel(person));
                }}
                fetchSuggestions={fetchPartySuggestions}
                getItemKey={(person) => person.partyId}
                renderItem={(person) => formatPartyLabel(person)}
                placeholder="Party ID or name"
                required
              />
            </FormField>
            <FormField label="Order Type">
              <select
                value={orderTypeId}
                onChange={(e) => setOrderTypeId(e.target.value)}
                disabled={loadingRefs}
              >
                {orderTypes.length === 0 && <option value="">—</option>}
                {orderTypes.map((item) => {
                  const id = item.id || item.value;
                  return (
                    <option key={id} value={id}>
                      {item.description || item.label || id}
                    </option>
                  );
                })}
              </select>
            </FormField>
            <FormField label="Status">
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                disabled={loadingRefs}
              >
                {orderStatuses.length === 0 && <option value="">—</option>}
                {orderStatuses.map((item) => {
                  const id = item.id || item.value;
                  return (
                    <option key={id} value={id}>
                      {item.description || item.label || id}
                    </option>
                  );
                })}
              </select>
            </FormField>
            <FormField label="Currency">
              <input value={currencyUom} onChange={(e) => setCurrencyUom(e.target.value)} />
            </FormField>
            <FormField label="Product Store ID">
              <input value={productStoreId} onChange={(e) => setProductStoreId(e.target.value)} />
            </FormField>
          </form>
        </div>
      </div>

      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Line Items</span>
          <button type="button" className="add-product-link" onClick={addLineItem}>
            <span className="add-product-icon" aria-hidden="true">
              +
            </span>
            Add Item
          </button>
        </div>
        <div className="screenlet-body table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price (incl. GST)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, index) => (
                <tr key={index}>
                  <td>
                    <AutocompleteInput
                      value={row.productId}
                      onChange={(value) => updateLineItem(index, 'productId', value)}
                      onSelect={(product) => handleProductSelect(index, product)}
                      fetchSuggestions={fetchProductSuggestions}
                      getItemKey={(product) => product.productId}
                      renderItem={(product) => formatProductLabel(product)}
                      placeholder="Product ID or name"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                      title="Filled from LIST_PRICE + GST when a product is selected"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length <= 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="form-actions">
            <button className="btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
