import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { fetchProdCatalog } from '../api/catalogApi';
import CatalogSubNav from './CatalogSubNav';

export default function CatalogScopeLayout() {
  const { prodCatalogId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setLoadError('');

    fetchProdCatalog(prodCatalogId)
      .then((catalog) => {
        if (!cancelled) setSummary(catalog);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load catalog');
      });

    return () => {
      cancelled = true;
    };
  }, [prodCatalogId]);

  return (
    <div className="catalog-section">
      <CatalogSubNav />
      <div className="product-scope-banner screenlet">
        <div className="screenlet-body product-scope-banner-body">
          <div>
            <p className="product-scope-label">Selected catalog</p>
            {loadError ? (
              <p className="alert alert-error">{loadError}</p>
            ) : summary ? (
              <p className="product-scope-summary">
                <strong>{summary.prodCatalogId}</strong>
                {summary.catalogName ? ` — ${summary.catalogName}` : ''}
              </p>
            ) : (
              <p className="product-scope-summary">Loading catalog {prodCatalogId}…</p>
            )}
          </div>
          <Link to="/catalog/find" className="btn-secondary product-scope-back">
            Back to Find Catalog
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
