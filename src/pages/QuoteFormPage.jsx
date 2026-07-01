import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createQuote,
  fetchQuoteStatuses,
  fetchQuoteTypes,
} from '../api/ordersApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

function emptyLineItem() {
  return { productId: '', quantity: '1', unitPrice: '' };
}

export default function QuoteFormPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [partyId, setPartyId] = useState('');
  const [quoteTypeId, setQuoteTypeId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [currencyUom, setCurrencyUom] = useState('USD');
  const [productStoreId, setProductStoreId] = useState('');
  const [lineItems, setLineItems] = useState([emptyLineItem()]);
  const [quoteTypes, setQuoteTypes] = useState([]);
  const [quoteStatuses, setQuoteStatuses] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReferences() {
      try {
        const [types, statuses] = await Promise.all([fetchQuoteTypes(), fetchQuoteStatuses()]);
        setQuoteTypes(types);
        setQuoteStatuses(statuses);
        if (types.length > 0) setQuoteTypeId(types[0].id || types[0].value || '');
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
      const created = await createQuote({
        partyId: partyId.trim(),
        quoteTypeId: quoteTypeId || undefined,
        statusId: statusId || undefined,
        currencyUom: currencyUom.trim() || undefined,
        productStoreId: productStoreId.trim() || undefined,
        items,
      });
      setSuccess(`Quote created: ${created.quoteId}`);
      setPartyId('');
      setProductStoreId('');
      setLineItems([emptyLineItem()]);
    } catch (err) {
      setError(err.message || 'Failed to create quote');
    } finally {
      setSubmitting(false);
    }
  }

  if (!canWrite) {
    return (
      <div className="alert alert-error">
        You do not have permission to create quotes.{' '}
        <Link to="/orders/quote/find">Find Quote</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Create Quote</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="screenlet">
        <div className="screenlet-title">Quote Header</div>
        <div className="screenlet-body">
          <form onSubmit={handleSubmit} className="form-grid">
            <FormField label="Party ID" required>
              <input value={partyId} onChange={(e) => setPartyId(e.target.value)} required />
            </FormField>
            <FormField label="Quote Type">
              <select
                value={quoteTypeId}
                onChange={(e) => setQuoteTypeId(e.target.value)}
                disabled={loadingRefs}
              >
                {quoteTypes.length === 0 && <option value="">—</option>}
                {quoteTypes.map((item) => {
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
                {quoteStatuses.length === 0 && <option value="">—</option>}
                {quoteStatuses.map((item) => {
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
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      value={row.productId}
                      onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                      placeholder="Product ID"
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
              {submitting ? 'Creating…' : 'Create Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
