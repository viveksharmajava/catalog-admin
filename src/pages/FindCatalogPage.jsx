import { useState } from 'react';
import { Link } from 'react-router-dom';
import { findProdCatalogs } from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import SearchCriteriaField from '../components/SearchCriteriaField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

const emptyCriteria = { operator: 'contains', value: '', ignoreCase: true };

const defaultForm = {
  prodCatalogId: { ...emptyCriteria },
  catalogName: { ...emptyCriteria },
  noConditionFind: true,
  size: 20,
  sortField: 'catalogName',
  sortDirection: 'asc',
};

const columns = [
  { key: 'prodCatalogId', label: 'Catalog ID' },
  { key: 'catalogName', label: 'Catalog Name' },
  { key: 'useQuickAdd', label: 'Use Quick Add' },
];

function criteriaHasCondition(criteria) {
  if (!criteria) return false;
  const op = criteria.operator || 'contains';
  if (op === 'empty' || op === 'notEmpty') return true;
  return Boolean(criteria.value && criteria.value.trim());
}

export default function FindCatalogPage() {
  const { canAccess } = useAuth();
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
    if (criteriaHasCondition(formState.prodCatalogId)) payload.prodCatalogId = formState.prodCatalogId;
    if (criteriaHasCondition(formState.catalogName)) payload.catalogName = formState.catalogName;
    return payload;
  }

  async function runSearch(targetPage = 0, formState = form) {
    setError('');
    setLoading(true);
    try {
      const response = await findProdCatalogs(buildRequest(targetPage, formState));
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

  function handlePageSizeChange(nextSize) {
    const nextForm = { ...form, size: Number(nextSize) };
    setForm(nextForm);
    runSearch(0, nextForm);
  }

  function ResultsPagination() {
    if (!results) return null;

    const totalPages = Math.max(results.totalPages, 1);
    const onFirstPage = page <= 0;
    const onLastPage = page >= totalPages - 1;

    return (
      <nav className="results-pagination" aria-label="Catalog search results pagination">
        <span className="results-count">
          {results.totalElements} result{results.totalElements === 1 ? '' : 's'} found
        </span>
        <ul className="pagination-nav">
          <li>
            <button type="button" className="pagination-link" disabled={onFirstPage} onClick={() => goToPage(0)}>
              First
            </button>
          </li>
          <li>
            <button
              type="button"
              className="pagination-link"
              disabled={onFirstPage}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </button>
          </li>
          <li className="pagination-status">
            Page {page + 1} of {totalPages}
          </li>
          <li>
            <button
              type="button"
              className="pagination-link"
              disabled={onLastPage}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </button>
          </li>
          <li>
            <button
              type="button"
              className="pagination-link"
              disabled={onLastPage}
              onClick={() => goToPage(totalPages - 1)}
            >
              Last
            </button>
          </li>
          <li className="pagination-pagesize">
            <label htmlFor="catalog-results-page-size">View</label>
            <select
              id="catalog-results-page-size"
              value={form.size}
              onChange={(e) => handlePageSizeChange(e.target.value)}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>Find Catalog</span>
          {canAccess(WRITE_ROLES) && (
            <Link to="/catalog/create" className="add-product-link">
              <span className="add-product-icon" aria-hidden="true">
                +
              </span>
              Add Catalog
            </Link>
          )}
        </div>
        <div className="screenlet-body">
          <p>Search product catalogs by catalog ID or catalog name (OFBiz FindCatalog).</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="find-form-grid">
              <SearchCriteriaField
                label="Catalog ID"
                criteria={form.prodCatalogId}
                onChange={(c) => updateCriteria('prodCatalogId', c)}
              />
              <SearchCriteriaField
                label="Catalog Name"
                criteria={form.catalogName}
                onChange={(c) => updateCriteria('catalogName', c)}
              />
            </div>
            <div className="form-field">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.noConditionFind}
                  onChange={(e) => setForm((prev) => ({ ...prev, noConditionFind: e.target.checked }))}
                />
                List all catalogs when no search criteria entered (OFBiz noConditionFind)
              </label>
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
          <div className="screenlet-title">Catalogs</div>
          <div className="screenlet-body table-scroll">
            <ResultsPagination />
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
                      No catalogs matched your search.
                    </td>
                  </tr>
                ) : (
                  results.content.map((row) => (
                    <tr key={row.prodCatalogId}>
                      <td>
                        {canAccess(WRITE_ROLES) ? (
                          <Link
                            to={`/catalog/edit/${encodeURIComponent(row.prodCatalogId)}`}
                            className="entity-link"
                          >
                            {row.prodCatalogId}
                          </Link>
                        ) : (
                          <strong>{row.prodCatalogId}</strong>
                        )}
                      </td>
                      <td>{row.catalogName}</td>
                      <td>{row.useQuickAdd === 'Y' ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <ResultsPagination />
          </div>
        </div>
      )}
    </div>
  );
}
