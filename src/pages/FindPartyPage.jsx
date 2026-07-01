import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findPersons } from '../api/partyApi';
import { useAuth } from '../auth/AuthContext';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function FindPartyPage() {
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [partyId, setPartyId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const page = await findPersons({
        partyId: partyId.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        page: 0,
        size: 50,
      });
      setResults(page.content || []);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Search Person</span>
          {canWrite && (
            <Link to="/party/person/create" className="add-product-link">
              <span className="add-product-icon" aria-hidden="true">
                +
              </span>
              Add Person
            </Link>
          )}
        </div>
        <div className="screenlet-body">
          <form onSubmit={handleSearch} className="form-grid">
            <label>
              Party ID
              <input value={partyId} onChange={(e) => setPartyId(e.target.value)} />
            </label>
            <label>
              First Name
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
              Last Name
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
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
        <div className="screenlet-body table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Party ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>User Login</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {!searched ? (
                <tr>
                  <td colSpan={5} className="empty-row">Enter criteria and search.</td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">No parties found.</td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr key={row.partyId}>
                    <td>
                      <Link to={`/party/person/${encodeURIComponent(row.partyId)}/person`} className="entity-link">
                        {row.partyId}
                      </Link>
                    </td>
                    <td>{[row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ')}</td>
                    <td>{row.statusId}</td>
                    <td>{row.userLoginId || '—'}</td>
                    <td>{row.roleTypeId || row.roleTypeIds?.[0] || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
