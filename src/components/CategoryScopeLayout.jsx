import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { fetchCategory } from '../api/catalogApi';
import CategoryScopedSubNav from './CategoryScopedSubNav';

export default function CategoryScopeLayout() {
  const { productCategoryId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setLoadError('');

    fetchCategory(productCategoryId)
      .then((category) => {
        if (!cancelled) setSummary(category);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load category');
      });

    return () => {
      cancelled = true;
    };
  }, [productCategoryId]);

  return (
    <div>
      <CategoryScopedSubNav />
      <div className="product-scope-banner screenlet">
        <div className="screenlet-body product-scope-banner-body">
          <div>
            <p className="product-scope-label">Selected category</p>
            {loadError ? (
              <p className="alert alert-error">{loadError}</p>
            ) : summary ? (
              <p className="product-scope-summary">
                <strong>{summary.productCategoryId}</strong>
                {summary.categoryName ? ` — ${summary.categoryName}` : ''}
              </p>
            ) : (
              <p className="product-scope-summary">Loading category {productCategoryId}…</p>
            )}
          </div>
          <Link to="/category/find" className="btn-secondary product-scope-back">
            Back to Find Category
          </Link>
        </div>
      </div>
      <Outlet key={productCategoryId} />
    </div>
  );
}
