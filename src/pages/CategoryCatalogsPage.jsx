import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addCategoryProdCatalog,
  fetchCategoryProdCatalogs,
  fetchProdCatalogCategoryTypes,
  listAllProdCatalogs,
  removeCategoryProdCatalog,
  updateCategoryProdCatalog,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import { useCategoryScopeId } from '../components/CategoryScopePicker';
import FormField from '../components/FormField';
import { emptyDateTimeLocal, formatDateTimeLocal, toApiDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CategoryCatalogsPage() {
  const categoryId = useCategoryScopeId();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [catalogTypes, setCatalogTypes] = useState([]);
  const [catalogOptions, setCatalogOptions] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editState, setEditState] = useState({});

  const [addForm, setAddForm] = useState({
    prodCatalogId: '',
    prodCatalogCategoryTypeId: 'PCCT_BROWSE_ROOT',
    fromDate: emptyDateTimeLocal(),
    sequenceNum: '1',
  });

  useEffect(() => {
    fetchProdCatalogCategoryTypes().then(setCatalogTypes).catch(() => setCatalogTypes([]));
    listAllProdCatalogs()
      .then((res) => setCatalogOptions(res.content || []))
      .catch(() => setCatalogOptions([]));
  }, []);

  useEffect(() => {
    setError('');
    setSuccess('');
    setEditState({});
    setAddForm({
      prodCatalogId: '',
      prodCatalogCategoryTypeId: 'PCCT_BROWSE_ROOT',
      fromDate: emptyDateTimeLocal(),
      sequenceNum: '1',
    });
    if (!categoryId) {
      setMappings([]);
      return;
    }
    loadMappings(categoryId);
  }, [categoryId]);

  async function loadMappings(id) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategoryProdCatalogs(id);
      setMappings(data);
    } catch (err) {
      setError(err.message || 'Failed to load catalog mappings');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addCategoryProdCatalog(categoryId, {
        prodCatalogId: addForm.prodCatalogId,
        prodCatalogCategoryTypeId: addForm.prodCatalogCategoryTypeId,
        fromDate: toApiDateTime(addForm.fromDate),
        sequenceNum: Number(addForm.sequenceNum) || 1,
      });
      setSuccess('Catalog associated with category.');
      setAddForm({
        prodCatalogId: '',
        prodCatalogCategoryTypeId: 'PCCT_BROWSE_ROOT',
        fromDate: emptyDateTimeLocal(),
        sequenceNum: '1',
      });
      loadMappings(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to add catalog');
    }
  }

  async function handleUpdate(row) {
    const key = `${row.prodCatalogId}|${row.prodCatalogCategoryTypeId}|${row.fromDate}`;
    const edit = editState[key] || {};
    setError('');
    try {
      await updateCategoryProdCatalog({
        prodCatalogId: row.prodCatalogId,
        productCategoryId: row.productCategoryId,
        prodCatalogCategoryTypeId: row.prodCatalogCategoryTypeId,
        fromDate: row.fromDate,
        thruDate: edit._thruDate ? toApiDateTime(edit._thruDate) : null,
        sequenceNum: edit._sequenceNum != null ? Number(edit._sequenceNum) : row.sequenceNum,
      });
      setSuccess('Catalog mapping updated.');
      loadMappings(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to update catalog mapping');
    }
  }

  async function handleRemove(row) {
    if (!window.confirm('Remove this catalog association?')) return;
    setError('');
    try {
      await removeCategoryProdCatalog({
        prodCatalogId: row.prodCatalogId,
        productCategoryId: row.productCategoryId,
        prodCatalogCategoryTypeId: row.prodCatalogCategoryTypeId,
        fromDate: row.fromDate,
      });
      setSuccess('Catalog association removed.');
      loadMappings(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to remove catalog association');
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Loading catalog mappings…</p>
      ) : (
        <>
          <div className="screenlet">
            <div className="screenlet-title">Category Product Catalogs</div>
            <div className="screenlet-body table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Catalog</th>
                    <th>Type</th>
                    <th>From Date</th>
                    <th>Thru Date</th>
                    <th>Sequence</th>
                    {canWrite && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {mappings.length === 0 ? (
                    <tr>
                      <td colSpan={canWrite ? 6 : 5} className="empty-row">
                        No catalogs associated with this category.
                      </td>
                    </tr>
                  ) : (
                    mappings.map((row) => {
                      const key = `${row.prodCatalogId}|${row.prodCatalogCategoryTypeId}|${row.fromDate}`;
                      const edit = editState[key] || {
                        _thruDate: formatDateTimeLocal(row.thruDate),
                        _sequenceNum: row.sequenceNum ?? '',
                      };
                      return (
                        <tr key={key}>
                          <td>
                            <Link
                              to={`/catalog/${encodeURIComponent(row.prodCatalogId)}/categories`}
                              className="entity-link"
                            >
                              {row.catalogName || row.prodCatalogId} [{row.prodCatalogId}]
                            </Link>
                          </td>
                          <td>{row.prodCatalogCategoryTypeDescription || row.prodCatalogCategoryTypeId}</td>
                          <td>{row.fromDate}</td>
                          <td>
                            {canWrite ? (
                              <input
                                type="datetime-local"
                                value={edit._thruDate}
                                onChange={(e) =>
                                  setEditState((s) => ({
                                    ...s,
                                    [key]: { ...edit, _thruDate: e.target.value },
                                  }))
                                }
                              />
                            ) : (
                              row.thruDate || '—'
                            )}
                          </td>
                          <td>
                            {canWrite ? (
                              <input
                                type="number"
                                value={edit._sequenceNum}
                                onChange={(e) =>
                                  setEditState((s) => ({
                                    ...s,
                                    [key]: { ...edit, _sequenceNum: e.target.value },
                                  }))
                                }
                              />
                            ) : (
                              row.sequenceNum ?? '—'
                            )}
                          </td>
                          {canWrite && (
                            <td className="actions-cell">
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleUpdate(row)}
                              >
                                Update
                              </button>
                              <button type="button" className="btn-secondary" onClick={() => handleRemove(row)}>
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {canWrite && (
            <div className="screenlet">
              <div className="screenlet-title">Add Catalog to Category</div>
              <div className="screenlet-body">
                <form onSubmit={handleAdd} className="inline-add-form">
                  <FormField label="Catalog">
                    <select
                      required
                      value={addForm.prodCatalogId}
                      onChange={(e) => setAddForm((p) => ({ ...p, prodCatalogId: e.target.value }))}
                    >
                      <option value="">— Select —</option>
                      {catalogOptions.map((c) => (
                        <option key={c.prodCatalogId} value={c.prodCatalogId}>
                          {c.catalogName} [{c.prodCatalogId}]
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Association Type">
                    <select
                      value={addForm.prodCatalogCategoryTypeId}
                      onChange={(e) =>
                        setAddForm((p) => ({ ...p, prodCatalogCategoryTypeId: e.target.value }))
                      }
                    >
                      {catalogTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="From Date">
                    <input
                      type="datetime-local"
                      value={addForm.fromDate}
                      onChange={(e) => setAddForm((p) => ({ ...p, fromDate: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Sequence">
                    <input
                      type="number"
                      value={addForm.sequenceNum}
                      onChange={(e) => setAddForm((p) => ({ ...p, sequenceNum: e.target.value }))}
                    />
                  </FormField>
                  <button className="btn-primary" type="submit">
                    Add Catalog
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
