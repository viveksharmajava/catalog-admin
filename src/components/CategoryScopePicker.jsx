import { useSearchParams } from 'react-router-dom';
import FormField from './FormField';

export default function CategoryScopePicker({ categories, label = 'Working Category' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') || '';

  function handleChange(nextId) {
    const params = new URLSearchParams(searchParams);
    if (nextId) {
      params.set('categoryId', nextId);
    } else {
      params.delete('categoryId');
    }
    setSearchParams(params);
  }

  const selected = categories.find((c) => c.productCategoryId === categoryId);

  return (
    <div className="category-scope-picker screenlet">
      <div className="screenlet-body">
        <FormField label={label} hint="Select a category to view and manage its associations.">
          <select value={categoryId} onChange={(e) => handleChange(e.target.value)}>
            <option value="">— Select a category —</option>
            {categories.map((c) => (
              <option key={c.productCategoryId} value={c.productCategoryId}>
                {c.categoryName} [{c.productCategoryId}]
              </option>
            ))}
          </select>
        </FormField>
        {selected && (
          <p className="category-scope-summary">
            Managing associations for <strong>{selected.categoryName}</strong> ({selected.productCategoryId})
          </p>
        )}
      </div>
    </div>
  );
}

export function useCategoryScopeId() {
  const [searchParams] = useSearchParams();
  return searchParams.get('categoryId') || '';
}
