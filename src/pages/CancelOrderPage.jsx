import { useState } from 'react';
import { cancelOrder, getOrder } from '../api/ordersApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';
import { formatShortDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CancelOrderPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLookup(event) {
    event.preventDefault();
    if (!orderId.trim()) {
      setError('Enter an order ID.');
      return;
    }
    setError('');
    setSuccess('');
    setOrder(null);
    setLoadingOrder(true);
    try {
      const result = await getOrder(orderId.trim());
      setOrder(result);
    } catch (err) {
      setError(err.message || 'Order not found');
    } finally {
      setLoadingOrder(false);
    }
  }

  async function handleCancel() {
    if (!canWrite || !orderId.trim()) return;
    if (!window.confirm(`Cancel order ${orderId.trim()}?`)) return;
    setError('');
    setSuccess('');
    setCancelling(true);
    try {
      const result = await cancelOrder(orderId.trim());
      setSuccess(`Order ${orderId.trim()} cancelled.`);
      setOrder(result || { ...order, statusId: 'ORDER_CANCELLED' });
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  }

  if (!canWrite) {
    return <div className="alert alert-error">You do not have permission to cancel orders.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Cancel Order</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="screenlet">
        <div className="screenlet-title">Order Lookup</div>
        <div className="screenlet-body">
          <form onSubmit={handleLookup} className="form-grid">
            <FormField label="Order ID" required>
              <input value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
            </FormField>
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loadingOrder}>
                {loadingOrder ? 'Loading…' : 'Look Up'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {order && (
        <div className="screenlet">
          <div className="screenlet-title">Order Details</div>
          <div className="screenlet-body">
            <div className="form-grid">
              <div>
                <strong>Order ID:</strong> {order.orderId}
              </div>
              <div>
                <strong>Party ID:</strong> {order.partyId || '—'}
              </div>
              <div>
                <strong>Type:</strong> {order.orderTypeId || '—'}
              </div>
              <div>
                <strong>Status:</strong> {order.statusId || '—'}
              </div>
              <div>
                <strong>Order Date:</strong> {formatShortDateTime(order.orderDate)}
              </div>
              <div>
                <strong>Grand Total:</strong> {order.grandTotal != null ? order.grandTotal : '—'}
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={handleCancel}
                disabled={cancelling || order.statusId === 'ORDER_CANCELLED'}
              >
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
