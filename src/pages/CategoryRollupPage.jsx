import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addChildRollup,
  addParentRollup,
  fetchCategories,
  fetchChildRollups,
  fetchParentRollups,
  removeRollup,
  updateRollup,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import { useCategoryScopeId } from '../components/CategoryScopePicker';
import FormField from '../components/FormField';
import { emptyDateTimeLocal, formatDateTimeLocal, toApiDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CategoryRollupPage() {
  const categoryId = useCategoryScopeId();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [addParentForm, setAddParentForm] = useState({
    parentProductCategoryId: '',
    fromDate: emptyDateTimeLocal(),
    sequenceNum: '1',
  });
  const [addChildForm, setAddChildForm] = useState({
    productCategoryId: '',
    fromDate: emptyDateTimeLocal(),
    sequenceNum: '1',
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setError('');
    setSuccess('');
    setAddParentForm({ parentProductCategoryId: '', fromDate: emptyDateTimeLocal(), sequenceNum: '1' });
    setAddChildForm({ productCategoryId: '', fromDate: emptyDateTimeLocal(), sequenceNum: '1' });
    if (!categoryId) {
      setParents([]);
      setChildren([]);
      return;
    }
    loadRollups(categoryId);
  }, [categoryId]);

  async function loadRollups(id) {
    setLoading(true);
    setError('');
    try {
      const [p, c] = await Promise.all([fetchParentRollups(id), fetchChildRollups(id)]);
      setParents(p);
      setChildren(c);
    } catch (err) {
      setError(err.message || 'Failed to load rollups');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddParent(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addParentRollup(categoryId, {
        parentProductCategoryId: addParentForm.parentProductCategoryId,
        fromDate: toApiDateTime(addParentForm.fromDate),
        sequenceNum: Number(addParentForm.sequenceNum) || 1,
      });
      setSuccess('Parent category added.');
      setAddParentForm({ parentProductCategoryId: '', fromDate: emptyDateTimeLocal(), sequenceNum: '1' });
      loadRollups(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to add parent');
    }
  }

  async function handleAddChild(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addChildRollup(categoryId, {
        productCategoryId: addChildForm.productCategoryId,
        fromDate: toApiDateTime(addChildForm.fromDate),
        sequenceNum: Number(addChildForm.sequenceNum) || 1,
      });
      setSuccess('Child category added.');
      setAddChildForm({ productCategoryId: '', fromDate: emptyDateTimeLocal(), sequenceNum: '1' });
      loadRollups(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to add child');
    }
  }

  async function handleUpdate(row) {
    setError('');
    try {
      await updateRollup({
        productCategoryId: row.productCategoryId,
        parentProductCategoryId: row.parentProductCategoryId,
        fromDate: row.fromDate,
        thruDate: row._thruDate ? toApiDateTime(row._thruDate) : null,
        sequenceNum: row._sequenceNum != null ? Number(row._sequenceNum) : row.sequenceNum,
      });
      setSuccess('Rollup updated.');
      loadRollups(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to update rollup');
    }
  }

  async function handleRemove(row) {
    if (!window.confirm('Remove this rollup association?')) return;
    setError('');
    try {
      await removeRollup({
        productCategoryId: row.productCategoryId,
        parentProductCategoryId: row.parentProductCategoryId,
        fromDate: row.fromDate,
      });
      setSuccess('Rollup removed.');
      loadRollups(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to remove rollup');
    }
  }

  const parentOptions = categories.filter((c) => c.productCategoryId !== categoryId);
  const childOptions = categories.filter((c) => c.productCategoryId !== categoryId);

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <p>Loading rollups…</p>
      ) : (
        <>
          <RollupTable
            title="Parent Categories"
            emptyMessage="No parent categories found."
            rows={parents}
            idLabel="Parent Category"
            nameField="parentCategoryName"
            idField="parentProductCategoryId"
            canWrite={canWrite}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
          {canWrite && (
            <div className="screenlet">
              <div className="screenlet-title">Add Parent Category</div>
              <div className="screenlet-body">
                <form onSubmit={handleAddParent} className="inline-add-form">
                  <FormField label="Parent Category">
                    <select
                      required
                      value={addParentForm.parentProductCategoryId}
                      onChange={(e) =>
                        setAddParentForm((p) => ({ ...p, parentProductCategoryId: e.target.value }))
                      }
                    >
                      <option value="">— Select —</option>
                      {parentOptions.map((c) => (
                        <option key={c.productCategoryId} value={c.productCategoryId}>
                          {c.categoryName} [{c.productCategoryId}]
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="From Date">
                    <input
                      type="datetime-local"
                      value={addParentForm.fromDate}
                      onChange={(e) => setAddParentForm((p) => ({ ...p, fromDate: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Sequence">
                    <input
                      type="number"
                      value={addParentForm.sequenceNum}
                      onChange={(e) => setAddParentForm((p) => ({ ...p, sequenceNum: e.target.value }))}
                    />
                  </FormField>
                  <button className="btn-primary" type="submit">
                    Add Parent
                  </button>
                </form>
              </div>
            </div>
          )}

          <RollupTable
            title="Child Categories"
            emptyMessage="No child categories found."
            rows={children}
            idLabel="Child Category"
            nameField="categoryName"
            idField="productCategoryId"
            canWrite={canWrite}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
          />
          {canWrite && (
            <div className="screenlet">
              <div className="screenlet-title">Add Child Category</div>
              <div className="screenlet-body">
                <form onSubmit={handleAddChild} className="inline-add-form">
                  <FormField label="Child Category">
                    <select
                      required
                      value={addChildForm.productCategoryId}
                      onChange={(e) =>
                        setAddChildForm((p) => ({ ...p, productCategoryId: e.target.value }))
                      }
                    >
                      <option value="">— Select —</option>
                      {childOptions.map((c) => (
                        <option key={c.productCategoryId} value={c.productCategoryId}>
                          {c.categoryName} [{c.productCategoryId}]
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="From Date">
                    <input
                      type="datetime-local"
                      value={addChildForm.fromDate}
                      onChange={(e) => setAddChildForm((p) => ({ ...p, fromDate: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Sequence">
                    <input
                      type="number"
                      value={addChildForm.sequenceNum}
                      onChange={(e) => setAddChildForm((p) => ({ ...p, sequenceNum: e.target.value }))}
                    />
                  </FormField>
                  <button className="btn-primary" type="submit">
                    Add Child
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

function RollupTable({ title, emptyMessage, rows, idLabel, nameField, idField, canWrite, onUpdate, onRemove }) {
  const [editState, setEditState] = useState({});

  return (
    <div className="screenlet">
      <div className="screenlet-title">{title}</div>
      <div className="screenlet-body table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>{idLabel}</th>
              <th>From Date</th>
              <th>Thru Date</th>
              <th>Sequence</th>
              {canWrite && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="empty-row">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const key = `${row.productCategoryId}|${row.parentProductCategoryId}|${row.fromDate}`;
                const edit = editState[key] || {
                  _thruDate: formatDateTimeLocal(row.thruDate),
                  _sequenceNum: row.sequenceNum ?? '',
                };
                return (
                  <tr key={key}>
                    <td>
                      <Link
                        to={`/category/${encodeURIComponent(row[idField])}/category`}
                        className="entity-link"
                      >
                        {row[nameField] || row[idField]} [{row[idField]}]
                      </Link>
                    </td>
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
                          onClick={() => onUpdate({ ...row, ...edit })}
                        >
                          Update
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => onRemove(row)}>
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
  );
}
