import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findOrders } from '../api/ordersApi';
import { useAuth } from '../auth/AuthContext';
import OrdersMatchField from '../components/OrdersMatchField';
import { formatShortDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

function buildSearchPayload(form, page, size) {
  const payload = { page, size: Number(size) || 20 };
  if (form.partyId.trim()) {
    payload.partyId = form.partyId.trim();
    payload.partyIdMatch = form.partyIdMatch;
  }
  if (form.orderId.trim()) {
    payload.orderId = form.orderId.trim();
    payload.orderIdMatch = form.orderIdMatch;
  }
  if (form.productId.trim()) {
    payload.productId = form.productId.trim();
    payload.productIdMatch = form.productIdMatch;
  }
  if (form.minDate) payload.minDate = form.minDate;
  if (form.maxDate) payload.maxDate = form.maxDate;
  return payload;
}

export default function FindOrdersPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [partyId, setPartyId] = useState('');
  const [partyIdMatch, setPartyIdMatch] = useState('CONTAINS');
  const [orderId, setOrderId] = useState('');
  const [orderIdMatch, setOrderIdMatch] = useState('CONTAINS');
  const [productId, setProductId] = useState('');
  const [productIdMatch, setProductIdMatch] = useState('CONTAINS');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [size, setSize] = useState(20);
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const form = { partyId, partyIdMatch, orderId, orderIdMatch, productId, productIdMatch, minDate, maxDate };

  async function runSearch(targetPage = 0, pageSize = size) {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await findOrders(buildSearchPayload(form, targetPage, pageSize));
      setResults(response);
      setPage(response.number ?? response.page ?? targetPage);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    runSearch(0);
  }

  const rows = results?.content ?? [];
  const totalPages = results?.totalPages ?? 0;
  const totalElements = results?.totalElements ?? 0;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Find Orders</span>
          {canWrite && (
            <Link to="/orders/order/create" className="add-product-link">
              <span className="add-product-icon" aria-hidden="true">
                +
              </span>
              Create Order
            </Link>
          )}
        </div>
        <div className="screenlet-body">
          <form onSubmit={handleSubmit}>
            <div className="find-form-grid">
              <OrdersMatchField
                label="Party ID"
                value={partyId}
                matchMode={partyIdMatch}
                onValueChange={setPartyId}
                onMatchModeChange={setPartyIdMatch}
              />
              <OrdersMatchField
                label="Order ID"
                value={orderId}
                matchMode={orderIdMatch}
                onValueChange={setOrderId}
                onMatchModeChange={setOrderIdMatch}
              />
              <OrdersMatchField
                label="Product ID"
                value={productId}
                matchMode={productIdMatch}
                onValueChange={setProductId}
                onMatchModeChange={setProductIdMatch}
              />
            </div>
            <div className="form-grid">
              <label>
                Order Date From
                <input type="date" value={minDate} onChange={(e) => setMinDate(e.target.value)} />
              </label>
              <label>
                Order Date To
                <input type="date" value={maxDate} onChange={(e) => setMaxDate(e.target.value)} />
              </label>
              <label>
                Page Size
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="screenlet">
        <div className="screenlet-title">Results</div>
        <div className="screenlet-body">
          {searched && (
            <div className="results-pagination">
              <span>{totalElements} order(s) found</span>
              <div>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page <= 0 || loading}
                  onClick={() => runSearch(page - 1)}
                >
                  Previous
                </button>
                <span style={{ margin: '0 0.75rem' }}>
                  Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page + 1 >= totalPages || loading}
                  onClick={() => runSearch(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Party ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {!searched ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      Enter criteria and search.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.orderId}>
                      <td>{row.orderId}</td>
                      <td>{row.partyId || '—'}</td>
                      <td>{row.orderTypeId || '—'}</td>
                      <td>{row.statusId || '—'}</td>
                      <td>{formatShortDateTime(row.orderDate)}</td>
                      <td>{row.grandTotal != null ? row.grandTotal : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
