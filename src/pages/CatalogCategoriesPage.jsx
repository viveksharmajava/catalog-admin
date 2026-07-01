import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addCatalogCategory,
  fetchCatalogCategories,
  fetchCategories,
  fetchProdCatalogCategoryTypes,
  removeCatalogCategory,
  updateCatalogCategory,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';
import { emptyDateTimeLocal, formatDateTimeLocal, toApiDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CatalogCategoriesPage() {
  const { prodCatalogId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [catalogTypes, setCatalogTypes] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editState, setEditState] = useState({});

  const [addForm, setAddForm] = useState({
    productCategoryId: '',
    prodCatalogCategoryTypeId: 'PCCT_BROWSE_ROOT',
    fromDate: emptyDateTimeLocal(),
    sequenceNum: '1',
  });

  useEffect(() => {
    fetchCategories().then(setCategoryOptions).catch(() => setCategoryOptions([]));
    fetchProdCatalogCategoryTypes().then(setCatalogTypes).catch(() => setCatalogTypes([]));
  }, []);

  useEffect(() => {
    loadMappings();
  }, [prodCatalogId]);

  async function loadMappings() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCatalogCategories(prodCatalogId);
      setMappings(data);
    } catch (err) {
      setError(err.message || 'Failed to load catalog categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addCatalogCategory(prodCatalogId, {
        productCategoryId: addForm.productCategoryId,
        prodCatalogCategoryTypeId: addForm.prodCatalogCategoryTypeId,
        fromDate: toApiDateTime(addForm.fromDate),
        sequenceNum: Number(addForm.sequenceNum) || 1,
      });
      setSuccess('Category associated with catalog.');
      setAddForm({
        productCategoryId: '',
        prodCatalogCategoryTypeId: 'PCCT_BROWSE_ROOT',
        fromDate: emptyDateTimeLocal(),
        sequenceNum: '1',
      });
      loadMappings();
    } catch (err) {
      setError(err.message || 'Failed to add category');
    }
  }

  async function handleUpdate(row) {
    const key = `${row.productCategoryId}|${row.prodCatalogCategoryTypeId}|${row.fromDate}`;
    const edit = editState[key] || {};
    setError('');
    try {
      await updateCatalogCategory(prodCatalogId, {
        productCategoryId: row.productCategoryId,
        prodCatalogCategoryTypeId: row.prodCatalogCategoryTypeId,
        fromDate: row.fromDate,
        thruDate: edit._thruDate ? toApiDateTime(edit._thruDate) : null,
        sequenceNum: edit._sequenceNum != null ? Number(edit._sequenceNum) : row.sequenceNum,
      });
      setSuccess('Category mapping updated.');
      loadMappings();
    } catch (err) {
      setError(err.message || 'Failed to update category mapping');
    }
  }

  async function handleRemove(row) {
    if (!window.confirm('Remove this category association?')) return;
    setError('');
    try {
      await removeCatalogCategory(prodCatalogId, {
        productCategoryId: row.productCategoryId,
        prodCatalogCategoryTypeId: row.prodCatalogCategoryTypeId,
        fromDate: row.fromDate,
      });
      setSuccess('Category association removed.');
      loadMappings();
    } catch (err) {
      setError(err.message || 'Failed to remove category association');
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Loading category mappings…</p>
      ) : (
        <>
          <div className="screenlet">
            <div className="screenlet-title">Catalog Categories</div>
            <div className="screenlet-body">
              <p>
                Categories linked to this catalog (ProdCatalogCategory). A catalog can be associated
                with many categories; catalogs are not linked to other catalogs.
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
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
                          No categories associated with this catalog.
                        </td>
                      </tr>
                    ) : (
                      mappings.map((row) => {
                        const key = `${row.productCategoryId}|${row.prodCatalogCategoryTypeId}|${row.fromDate}`;
                        const edit = editState[key] || {
                          _thruDate: formatDateTimeLocal(row.thruDate),
                          _sequenceNum: row.sequenceNum ?? '',
                        };
                        return (
                          <tr key={key}>
                            <td>
                              <Link
                                to={`/category/${encodeURIComponent(row.productCategoryId)}/category`}
                                className="entity-link"
                              >
                                {row.categoryName || row.productCategoryId} [{row.productCategoryId}]
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
                                <button type="button" className="btn-secondary" onClick={() => handleUpdate(row)}>
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
          </div>

          {canWrite && (
            <div className="screenlet">
              <div className="screenlet-title">Add Category to Catalog</div>
              <div className="screenlet-body">
                <form onSubmit={handleAdd} className="inline-add-form">
                  <FormField label="Category">
                    <select
                      required
                      value={addForm.productCategoryId}
                      onChange={(e) => setAddForm((p) => ({ ...p, productCategoryId: e.target.value }))}
                    >
                      <option value="">— Select —</option>
                      {categoryOptions.map((c) => (
                        <option key={c.productCategoryId} value={c.productCategoryId}>
                          {c.categoryName} [{c.productCategoryId}]
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
                    Add Category
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
