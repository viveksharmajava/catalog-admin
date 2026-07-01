import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { fetchPerson } from '../api/partyApi';
import PartyScopedSubNav from './PartyScopedSubNav';

export default function PartyScopeLayout() {
  const { partyId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setLoadError('');

    fetchPerson(partyId)
      .then((person) => {
        if (!cancelled) setSummary(person);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load party');
      });

    return () => {
      cancelled = true;
    };
  }, [partyId]);

  const displayName = summary
    ? [summary.firstName, summary.middleName, summary.lastName].filter(Boolean).join(' ')
    : '';

  return (
    <div>
      <PartyScopedSubNav />
      <div className="product-scope-banner screenlet">
        <div className="screenlet-body product-scope-banner-body">
          <div>
            <p className="product-scope-label">Selected party</p>
            {loadError ? (
              <p className="alert alert-error">{loadError}</p>
            ) : summary ? (
              <p className="product-scope-summary">
                <strong>{summary.partyId}</strong>
                {displayName ? ` — ${displayName}` : ''}
              </p>
            ) : (
              <p className="product-scope-summary">Loading party {partyId}…</p>
            )}
          </div>
          <Link to="/party/person/find" className="btn-secondary product-scope-back">
            Back to Find Party
          </Link>
        </div>
      </div>
      <Outlet key={partyId} />
    </div>
  );
}
