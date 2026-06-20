import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addCategoryProduct,
  fetchCategories,
  fetchCategoryProducts,
  listAllProducts,
  removeCategoryProduct,
  updateCategoryProduct,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import CategoryScopePicker, { useCategoryScopeId } from '../components/CategoryScopePicker';
import FormField from '../components/FormField';
import { emptyDateTimeLocal, formatDateTimeLocal, toApiDateTime } from '../utils/dateTime';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function CategoryProductsPage() {
  const categoryId = useCategoryScopeId();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editState, setEditState] = useState({});

  const [addForm, setAddForm] = useState({
    productId: '',
    fromDate: emptyDateTimeLocal(),
    sequenceNum: '1',
    quantity: '',
    comments: '',
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
    listAllProducts()
      .then((res) => setProductOptions(res.content || []))
      .catch(() => setProductOptions([]));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setMembers([]);
      return;
    }
    loadMembers(categoryId);
  }, [categoryId]);

  async function loadMembers(id) {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategoryProducts(id);
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to load category products');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await addCategoryProduct(categoryId, {
        productId: addForm.productId,
        fromDate: toApiDateTime(addForm.fromDate),
        sequenceNum: Number(addForm.sequenceNum) || 1,
        quantity: addForm.quantity ? Number(addForm.quantity) : undefined,
        comments: addForm.comments || undefined,
      });
      setSuccess('Product added to category.');
      setAddForm({
        productId: '',
        fromDate: emptyDateTimeLocal(),
        sequenceNum: '1',
        quantity: '',
        comments: '',
      });
      loadMembers(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to add product');
    }
  }

  async function handleUpdate(row) {
    const key = `${row.productId}|${row.fromDate}`;
    const edit = editState[key] || {};
    setError('');
    try {
      await updateCategoryProduct({
        productCategoryId: row.productCategoryId,
        productId: row.productId,
        fromDate: row.fromDate,
        thruDate: edit._thruDate ? toApiDateTime(edit._thruDate) : null,
        sequenceNum: edit._sequenceNum != null ? Number(edit._sequenceNum) : row.sequenceNum,
        quantity: edit._quantity != null && edit._quantity !== '' ? Number(edit._quantity) : row.quantity,
        comments: edit._comments ?? row.comments,
      });
      setSuccess('Product membership updated.');
      loadMembers(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to update product membership');
    }
  }

  async function handleRemove(row) {
    if (!window.confirm('Remove this product from the category?')) return;
    setError('');
    try {
      await removeCategoryProduct({
        productCategoryId: row.productCategoryId,
        productId: row.productId,
        fromDate: row.fromDate,
      });
      setSuccess('Product removed from category.');
      loadMembers(categoryId);
    } catch (err) {
      setError(err.message || 'Failed to remove product');
    }
  }

  return (
    <div>
      <CategoryScopePicker categories={categories} />
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!categoryId ? (
        <div className="screenlet">
          <div className="screenlet-body">
            <p>Select a category above to view and manage product associations.</p>
          </div>
        </div>
      ) : loading ? (
        <p>Loading products…</p>
      ) : (
        <>
          <div className="screenlet">
            <div className="screenlet-title">Category Products</div>
            <div className="screenlet-body table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>From Date</th>
                    <th>Thru Date</th>
                    <th>Sequence</th>
                    <th>Quantity</th>
                    <th>Comments</th>
                    {canWrite && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={canWrite ? 7 : 6} className="empty-row">
                        No products associated with this category.
                      </td>
                    </tr>
                  ) : (
                    members.map((row) => {
                      const key = `${row.productId}|${row.fromDate}`;
                      const edit = editState[key] || {
                        _thruDate: formatDateTimeLocal(row.thruDate),
                        _sequenceNum: row.sequenceNum ?? '',
                        _quantity: row.quantity ?? '',
                        _comments: row.comments ?? '',
                      };
                      return (
                        <tr key={key}>
                          <td>
                            <Link
                              to={`/products/${encodeURIComponent(row.productId)}/product`}
                              className="entity-link"
                            >
                              {row.internalName || row.productName || row.productId} [{row.productId}]
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
                          <td>
                            {canWrite ? (
                              <input
                                type="number"
                                step="0.000001"
                                value={edit._quantity}
                                onChange={(e) =>
                                  setEditState((s) => ({
                                    ...s,
                                    [key]: { ...edit, _quantity: e.target.value },
                                  }))
                                }
                              />
                            ) : (
                              row.quantity ?? '—'
                            )}
                          </td>
                          <td>
                            {canWrite ? (
                              <input
                                type="text"
                                value={edit._comments}
                                onChange={(e) =>
                                  setEditState((s) => ({
                                    ...s,
                                    [key]: { ...edit, _comments: e.target.value },
                                  }))
                                }
                              />
                            ) : (
                              row.comments || '—'
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
              <div className="screenlet-title">Add Product to Category</div>
              <div className="screenlet-body">
                <form onSubmit={handleAdd} className="inline-add-form">
                  <FormField label="Product">
                    <select
                      required
                      value={addForm.productId}
                      onChange={(e) => setAddForm((p) => ({ ...p, productId: e.target.value }))}
                    >
                      <option value="">— Select —</option>
                      {productOptions.map((p) => (
                        <option key={p.productId} value={p.productId}>
                          {p.internalName || p.productName} [{p.productId}]
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
                  <FormField label="Quantity">
                    <input
                      type="number"
                      step="0.000001"
                      value={addForm.quantity}
                      onChange={(e) => setAddForm((p) => ({ ...p, quantity: e.target.value }))}
                    />
                  </FormField>
                  <FormField label="Comments">
                    <input
                      type="text"
                      value={addForm.comments}
                      onChange={(e) => setAddForm((p) => ({ ...p, comments: e.target.value }))}
                    />
                  </FormField>
                  <button className="btn-primary" type="submit">
                    Add Product
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
