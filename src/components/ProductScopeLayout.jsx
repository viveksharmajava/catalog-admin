import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { fetchProduct } from '../api/catalogApi';
import ProductSubNav from './ProductSubNav';

export default function ProductScopeLayout() {
  const { productId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setLoadError('');

    fetchProduct(productId)
      .then((product) => {
        if (!cancelled) setSummary(product);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load product');
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <div className="product-section">
      <ProductSubNav />
      <div className="product-scope-banner screenlet">
        <div className="screenlet-body product-scope-banner-body">
          <div>
            <p className="product-scope-label">Selected product</p>
            {loadError ? (
              <p className="alert alert-error">{loadError}</p>
            ) : summary ? (
              <p className="product-scope-summary">
                <strong>{summary.productId}</strong>
                {summary.productName ? ` — ${summary.productName}` : ''}
                {summary.internalName && summary.internalName !== summary.productName
                  ? ` (${summary.internalName})`
                  : ''}
              </p>
            ) : (
              <p className="product-scope-summary">Loading product {productId}…</p>
            )}
          </div>
          <Link to="/products/find" className="btn-secondary product-scope-back">
            Back to Find Product
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
