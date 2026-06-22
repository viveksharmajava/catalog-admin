import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addCatalogStore,
  fetchCatalogStores,
  listProductStores,
  removeCatalogStore,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CatalogStoresPage() {
  const { prodCatalogId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [storeOptions, setStoreOptions] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [storeToAdd, setStoreToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    listProductStores().then(setStoreOptions).catch(() => setStoreOptions([]));
  }, []);

  useEffect(() => {
    loadMappings();
  }, [prodCatalogId]);

  async function loadMappings() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCatalogStores(prodCatalogId);
      setMappings(data);
    } catch (err) {
      setError(err.message || 'Failed to load catalog stores');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!storeToAdd) return;
    setError('');
    setSuccess('');
    try {
      await addCatalogStore(prodCatalogId, { productStoreId: storeToAdd });
      setSuccess('Store linked to catalog.');
      setStoreToAdd('');
      loadMappings();
    } catch (err) {
      setError(err.message || 'Failed to link store');
    }
  }

  async function handleRemove(row) {
    if (!window.confirm(`Remove store ${row.productStoreId} from this catalog?`)) return;
    setError('');
    setSuccess('');
    try {
      await removeCatalogStore(prodCatalogId, row.productStoreId, row.fromDate);
      setSuccess('Store removed from catalog.');
      loadMappings();
    } catch (err) {
      setError(err.message || 'Failed to remove store link');
    }
  }

  const linkedStoreIds = new Set(mappings.map((m) => m.productStoreId));
  const availableStores = storeOptions.filter((s) => !linkedStoreIds.has(s.productStoreId));

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Loading store mappings…</p>
      ) : (
        <>
          <div className="screenlet">
            <div className="screenlet-title">Catalog Stores</div>
            <div className="screenlet-body">
              <p>
                Product stores linked to this catalog (ProductStoreCatalog). A catalog can be
                associated with many stores.
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Store</th>
                      <th>From Date</th>
                      <th>Sequence</th>
                      {canWrite && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.length === 0 ? (
                      <tr>
                        <td colSpan={canWrite ? 4 : 3} className="empty-row">
                          No stores linked to this catalog.
                        </td>
                      </tr>
                    ) : (
                      mappings.map((row) => (
                        <tr key={`${row.productStoreId}-${row.fromDate}`}>
                          <td>
                            <Link
                              to={`/stores/edit/${encodeURIComponent(row.productStoreId)}`}
                              className="entity-link"
                            >
                              {row.storeName || row.productStoreId} [{row.productStoreId}]
                            </Link>
                          </td>
                          <td>{row.fromDate}</td>
                          <td>{row.sequenceNum ?? '—'}</td>
                          {canWrite && (
                            <td>
                              <button
                                type="button"
                                className="btn-link-danger"
                                onClick={() => handleRemove(row)}
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="screenlet">
              <div className="screenlet-title">Link Store to Catalog</div>
              <div className="screenlet-body">
                <form className="inline-add-form" onSubmit={handleAdd}>
                  <FormField label="Product Store">
                    <select value={storeToAdd} onChange={(e) => setStoreToAdd(e.target.value)} required>
                      <option value="">— Select store —</option>
                      {availableStores.map((s) => (
                        <option key={s.productStoreId} value={s.productStoreId}>
                          {s.storeName} [{s.productStoreId}]
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <button className="btn-primary" type="submit" disabled={!storeToAdd}>
                    Link Store
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
