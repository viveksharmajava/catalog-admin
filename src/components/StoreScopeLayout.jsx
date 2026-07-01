import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { fetchProductStore } from '../api/catalogApi';
import StoreScopedSubNav from './StoreScopedSubNav';

export default function StoreScopeLayout() {
  const { productStoreId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setLoadError('');

    fetchProductStore(productStoreId)
      .then((store) => {
        if (!cancelled) setSummary(store);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load store');
      });

    return () => {
      cancelled = true;
    };
  }, [productStoreId]);

  return (
    <div>
      <StoreScopedSubNav />
      <div className="product-scope-banner screenlet">
        <div className="screenlet-body product-scope-banner-body">
          <div>
            <p className="product-scope-label">Selected store</p>
            {loadError ? (
              <p className="alert alert-error">{loadError}</p>
            ) : summary ? (
              <p className="product-scope-summary">
                <strong>{summary.productStoreId}</strong>
                {summary.storeName ? ` — ${summary.storeName}` : ''}
              </p>
            ) : (
              <p className="product-scope-summary">Loading store {productStoreId}…</p>
            )}
          </div>
          <Link to="/stores" className="btn-secondary product-scope-back">
            Back to Stores
          </Link>
        </div>
      </div>
      <Outlet key={productStoreId} />
    </div>
  );
}
