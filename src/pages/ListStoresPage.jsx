import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProductStores } from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

const columns = [
  { key: 'productStoreId', label: 'Store ID' },
  { key: 'storeName', label: 'Store Name' },
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'companyName', label: 'Company' },
  { key: 'isDemoStore', label: 'Demo Store' },
];

export default function ListStoresPage() {
  const { canAccess } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    setLoading(true);
    setError('');
    try {
      const data = await listProductStores();
      setStores(data);
    } catch (err) {
      setError(err.message || 'Failed to load product stores');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Product Stores</span>
          {canAccess(WRITE_ROLES) && (
            <Link to="/stores/create" className="add-product-link">
              <span className="add-product-icon" aria-hidden="true">
                +
              </span>
              Create Store
            </Link>
          )}
        </div>
        <div className="screenlet-body">
          <p>
            Product stores define business rules and settings for sales channels (e-commerce, POS,
            wholesale). OFBiz ListProductStore.
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <p>Loading stores…</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="empty-row">
                        No product stores found.
                      </td>
                    </tr>
                  ) : (
                    stores.map((row) => (
                      <tr key={row.productStoreId}>
                        <td>
                          <Link
                            to={`/stores/edit/${encodeURIComponent(row.productStoreId)}`}
                            className="entity-link"
                          >
                            {row.productStoreId}
                          </Link>
                        </td>
                        <td>{row.storeName}</td>
                        <td>{row.title}</td>
                        <td>{row.subtitle}</td>
                        <td>{row.companyName}</td>
                        <td>{row.isDemoStore}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
