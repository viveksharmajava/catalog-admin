import { useState } from 'react';
import { findProducts } from '../api/catalogApi';
import SearchCriteriaField from '../components/SearchCriteriaField';

const emptyCriteria = { operator: 'contains', value: '', ignoreCase: true };

const defaultForm = {
  productId: { ...emptyCriteria },
  productName: { ...emptyCriteria },
  internalName: { ...emptyCriteria },
  noConditionFind: true,
  size: 20,
  sortField: 'productId',
  sortDirection: 'asc',
};

const columns = [
  { key: 'productId', label: 'Product ID' },
  { key: 'productTypeId', label: 'Product Type' },
  { key: 'internalName', label: 'Internal Name' },
  { key: 'brandName', label: 'Brand Name' },
  { key: 'productName', label: 'Product Name' },
  { key: 'description', label: 'Description' },
];

function criteriaHasCondition(criteria) {
  if (!criteria) return false;
  const op = criteria.operator || 'contains';
  if (op === 'empty' || op === 'notEmpty') return true;
  return Boolean(criteria.value && criteria.value.trim());
}

export default function FindProductPage() {
  const [form, setForm] = useState(defaultForm);
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateCriteria(field, criteria) {
    setForm((prev) => ({ ...prev, [field]: criteria }));
  }

  function buildRequest(targetPage = 0, formState = form) {
    const payload = {
      noConditionFind: formState.noConditionFind,
      page: targetPage,
      size: Number(formState.size) || 20,
      sortField: formState.sortField,
      sortDirection: formState.sortDirection,
    };
    if (criteriaHasCondition(formState.productId)) payload.productId = formState.productId;
    if (criteriaHasCondition(formState.productName)) payload.productName = formState.productName;
    if (criteriaHasCondition(formState.internalName)) payload.internalName = formState.internalName;
    return payload;
  }

  async function runSearch(targetPage = 0, formState = form) {
    setError('');
    setLoading(true);
    try {
      const response = await findProducts(buildRequest(targetPage, formState));
      setResults(response);
      setPage(response.page);
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

  function handleSort(field) {
    const nextDirection =
      form.sortField === field && form.sortDirection === 'asc' ? 'desc' : 'asc';
    const nextForm = { ...form, sortField: field, sortDirection: nextDirection };
    setForm(nextForm);
    runSearch(page, nextForm);
  }

  function goToPage(nextPage) {
    if (!results) return;
    if (nextPage < 0 || nextPage >= results.totalPages) return;
    runSearch(nextPage);
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title">Find Product</div>
        <div className="screenlet-body">
          <p>OFBiz-style product search with field operators (equals, contains, begins with, etc.).</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="find-form-grid">
              <SearchCriteriaField
                label="Product ID"
                criteria={form.productId}
                onChange={(c) => updateCriteria('productId', c)}
              />
              <SearchCriteriaField
                label="Product Name"
                criteria={form.productName}
                onChange={(c) => updateCriteria('productName', c)}
              />
              <SearchCriteriaField
                label="Internal Name"
                criteria={form.internalName}
                onChange={(c) => updateCriteria('internalName', c)}
              />
            </div>
            <div className="form-field">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.noConditionFind}
                  onChange={(e) => setForm((prev) => ({ ...prev, noConditionFind: e.target.checked }))}
                />
                List all products when no search criteria entered (OFBiz noConditionFind)
              </label>
            </div>
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-field">
                <label>Page Size</label>
                <select
                  value={form.size}
                  onChange={(e) => setForm((prev) => ({ ...prev, size: Number(e.target.value) }))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Searching…' : 'Find'}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setForm(defaultForm);
                  setResults(null);
                  setError('');
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {results && (
        <div className="screenlet">
          <div className="screenlet-title">
            Products ({results.totalElements} found)
          </div>
          <div className="screenlet-body table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>
                      <button type="button" className="sort-button" onClick={() => handleSort(col.key)}>
                        {col.label}
                        {form.sortField === col.key ? (form.sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.content.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="empty-row">
                      No products matched your search.
                    </td>
                  </tr>
                ) : (
                  results.content.map((row) => (
                    <tr key={row.productId}>
                      <td>
                        <strong>{row.productId}</strong>
                      </td>
                      <td>{row.productTypeId}</td>
                      <td>{row.internalName}</td>
                      <td>{row.brandName}</td>
                      <td>{row.productName}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {results.totalPages > 1 && (
              <div className="pagination">
                <button type="button" className="btn-secondary" disabled={page <= 0} onClick={() => goToPage(0)}>
                  First
                </button>
                <button type="button" className="btn-secondary" disabled={page <= 0} onClick={() => goToPage(page - 1)}>
                  Previous
                </button>
                <span>
                  Page {page + 1} of {results.totalPages}
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page >= results.totalPages - 1}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={page >= results.totalPages - 1}
                  onClick={() => goToPage(results.totalPages - 1)}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
