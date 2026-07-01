import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addProductCategory,
  fetchCategories,
  fetchProductCategories,
  removeProductCategory,
} from '../api/catalogApi';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';

const WRITE_ROLES = ['ADMIN', 'CATALOG_MANAGER', 'MERCHANDISER'];

export default function ProductCategoriesPage() {
  const { productId } = useParams();
  const { canAccess } = useAuth();
  const canWrite = canAccess(WRITE_ROLES);

  const [allCategories, setAllCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [categoryToAdd, setCategoryToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories().then(setAllCategories).catch(() => setAllCategories([]));
  }, []);

  useEffect(() => {
    loadCategories();
  }, [productId]);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProductCategories(productId);
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to load product categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!categoryToAdd) return;
    setError('');
    setSuccess('');
    try {
      await addProductCategory(productId, categoryToAdd);
      setSuccess('Category added to product.');
      setCategoryToAdd('');
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to add category');
    }
  }

  async function handleRemove(categoryId) {
    if (!window.confirm(`Remove category ${categoryId} from this product?`)) return;
    setError('');
    setSuccess('');
    try {
      await removeProductCategory(productId, categoryId);
      setSuccess('Category removed from product.');
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to remove category');
    }
  }

  const assignedIds = new Set(members.map((m) => m.productCategoryId));
  const availableCategories = allCategories.filter((c) => !assignedIds.has(c.productCategoryId));

  return (
    <div className="screenlet">
      <div className="screenlet-title">Product Categories</div>
      <div className="screenlet-body">
        <p>Categories this product belongs to (ProductCategoryMember associations).</p>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {canWrite && (
          <form className="inline-add-form" onSubmit={handleAdd}>
            <FormField label="Add Category">
              <select
                value={categoryToAdd}
                onChange={(e) => setCategoryToAdd(e.target.value)}
                required
              >
                <option value="">— Select category —</option>
                {availableCategories.map((c) => (
                  <option key={c.productCategoryId} value={c.productCategoryId}>
                    {c.categoryName} [{c.productCategoryId}]
                  </option>
                ))}
              </select>
            </FormField>
            <button className="btn-primary" type="submit" disabled={!categoryToAdd}>
              Add
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading categories…</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Type</th>
                  {canWrite && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={canWrite ? 4 : 3} className="empty-row">
                      No categories assigned to this product.
                    </td>
                  </tr>
                ) : (
                  members.map((row) => (
                    <tr key={row.productCategoryId}>
                      <td>
                        <Link
                          to={`/category/${encodeURIComponent(row.productCategoryId)}/category`}
                          className="entity-link"
                        >
                          {row.productCategoryId}
                        </Link>
                      </td>
                      <td>{row.categoryName}</td>
                      <td>{row.productCategoryTypeId}</td>
                      {canWrite && (
                        <td>
                          <button
                            type="button"
                            className="btn-link-danger"
                            onClick={() => handleRemove(row.productCategoryId)}
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
        )}
      </div>
    </div>
  );
}
