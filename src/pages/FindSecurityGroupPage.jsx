import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findSecurityGroups } from '../api/partyApi';

export default function FindSecurityGroupPage() {
  const [groupId, setGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function runSearch(targetPage = 0, pageSize = size) {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await findSecurityGroups({
        groupId: groupId.trim() || undefined,
        description: description.trim() || undefined,
        page: targetPage,
        size: Number(pageSize) || 20,
      });
      setResults(response);
      setPage(response.number ?? targetPage);
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

  const totalPages = results?.totalPages ?? 0;
  const totalElements = results?.totalElements ?? 0;
  const rows = results?.content ?? [];

  return (
    <div>
      <div className="page-header">
        <h2>Find Security Group</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="screenlet">
        <div className="screenlet-title">Search</div>
        <div className="screenlet-body">
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Security Group ID
              <input value={groupId} onChange={(e) => setGroupId(e.target.value)} />
            </label>
            <label>
              Description
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
              Page Size
              <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
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
        <div className="screenlet-title">Security Groups</div>
        <div className="screenlet-body">
          {searched && (
            <div className="results-pagination">
              <span>{totalElements} group(s) found</span>
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
                  <th>Security Group ID</th>
                  <th>Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {!searched ? (
                  <tr>
                    <td colSpan={3} className="empty-row">Run search to list security groups.</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-row">No security groups found.</td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.groupId}>
                      <td>
                        <Link
                          to={`/party/security-group/edit/${encodeURIComponent(row.groupId)}`}
                          className="entity-link"
                        >
                          {row.groupId}
                        </Link>
                      </td>
                      <td>{row.groupName || '—'}</td>
                      <td>{row.description || '—'}</td>
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
