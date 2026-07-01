import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createCategory,
  fetchCategories,
  fetchCategory,
  fetchCategoryTypes,
  updateCategory,
  uploadCategoryImage,
} from '../api/catalogApi';
import FormField from '../components/FormField';
import EntityImageUpload from '../components/EntityImageUpload';
import {
  categoryDtoToForm,
  categoryFormToPayload,
  initialCategoryForm,
} from '../utils/categoryForm';

export default function CategoryFormPage() {
  const { productCategoryId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(productCategoryId);

  const [form, setForm] = useState(initialCategoryForm);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [types, categories] = await Promise.all([fetchCategoryTypes(), fetchCategories()]);
        setCategoryTypes(types);
        setParentCategories(categories);
      } catch (err) {
        setError(err.message || 'Failed to load reference data');
      } finally {
        setLoadingRefs(false);
      }
    }
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (!isEdit || !productCategoryId) return;

    setForm(initialCategoryForm);
    setError('');
    setSuccess('');
    setImageFile(null);

    async function loadCategory() {
      setLoadingCategory(true);
      setError('');
      try {
        const category = await fetchCategory(productCategoryId);
        setForm(categoryDtoToForm(category));
      } catch (err) {
        setError(err.message || 'Failed to load category');
      } finally {
        setLoadingCategory(false);
      }
    }
    loadCategory();
  }, [isEdit, productCategoryId]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadImageIfNeeded(categoryId) {
    if (!imageFile || !categoryId) return;
    const result = await uploadCategoryImage(categoryId, imageFile);
    setForm((prev) => ({ ...prev, categoryImageUrl: result.url || '' }));
    setImageFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await updateCategory(productCategoryId, categoryFormToPayload(form, true));
        await uploadImageIfNeeded(updated.productCategoryId);
        setSuccess(`Category "${updated.categoryName}" (${updated.productCategoryId}) updated successfully.`);
      } else {
        const created = await createCategory(categoryFormToPayload(form, false));
        await uploadImageIfNeeded(created.productCategoryId);
        setSuccess(`Category "${created.categoryName}" (${created.productCategoryId}) created successfully.`);
        setTimeout(() => navigate(`/category/${created.productCategoryId}/category`), 1200);
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
    } finally {
      setSubmitting(false);
    }
  }

  const loading = loadingRefs || loadingCategory;
  const parentOptions = parentCategories.filter(
    (c) => !isEdit || c.productCategoryId !== productCategoryId
  );

  return (
    <div>
      <div className="screenlet">
        <div className="screenlet-title screenlet-title-bar">
          <span>{isEdit ? 'Edit Product Category' : 'New Product Category'}</span>
          <Link to="/category/find" className="add-product-link">
            Back to Find Category
          </Link>
        </div>
        <div className="screenlet-body">
          <p>
            {isEdit
              ? 'Update category details. Category ID cannot be changed.'
              : 'OFBiz Edit Product Category — create a new product category.'}
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {loading ? (
            <p>{loadingCategory ? 'Loading category…' : 'Loading reference data…'}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <FormField
                  label="Category ID"
                  hint={isEdit ? 'Read-only identifier.' : 'Auto-generated if left blank.'}
                >
                  <input
                    type="text"
                    maxLength={20}
                    value={form.productCategoryId}
                    onChange={(e) => updateField('productCategoryId', e.target.value)}
                    placeholder="CAT-..."
                    readOnly={isEdit}
                    disabled={isEdit}
                    className={isEdit ? 'readonly-field' : undefined}
                  />
                </FormField>
                <FormField label="Category Type *">
                  <select
                    value={form.productCategoryTypeId}
                    onChange={(e) => updateField('productCategoryTypeId', e.target.value)}
                    required
                  >
                    {categoryTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Primary Parent Category">
                  <select
                    value={form.primaryParentCategoryId}
                    onChange={(e) => updateField('primaryParentCategoryId', e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {parentOptions.map((c) => (
                      <option key={c.productCategoryId} value={c.productCategoryId}>
                        {c.categoryName} [{c.productCategoryId}]
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Category Name *">
                  <input
                    type="text"
                    maxLength={100}
                    required
                    value={form.categoryName}
                    onChange={(e) => updateField('categoryName', e.target.value)}
                  />
                </FormField>
                <FormField label="Description" className="full-width">
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={2}
                  />
                </FormField>
                <FormField label="Long Description" className="full-width">
                  <textarea
                    value={form.longDescription}
                    onChange={(e) => updateField('longDescription', e.target.value)}
                    rows={4}
                  />
                </FormField>
                <EntityImageUpload
                  entityId={isEdit ? productCategoryId : undefined}
                  imageUrl={form.categoryImageUrl}
                  onImageUrlChange={(url) => updateField('categoryImageUrl', url)}
                  uploadImage={uploadCategoryImage}
                  pendingFile={imageFile}
                  onPendingFileChange={setImageFile}
                  uploadOnSubmit={!isEdit}
                  label="Category Image"
                  hint="Upload a category banner or thumbnail. On create, the image uploads when you save."
                />
                <FormField label="Show In Select" className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.showInSelect}
                    onChange={(e) => updateField('showInSelect', e.target.checked)}
                  />
                </FormField>
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="submit" disabled={submitting}>
                  {submitting
                    ? isEdit
                      ? 'Updating…'
                      : 'Creating…'
                    : isEdit
                      ? 'Update Category'
                      : 'Create Category'}
                </button>
                <Link to="/category/find" className="btn-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
