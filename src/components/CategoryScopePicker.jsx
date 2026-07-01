import { useParams, useSearchParams } from 'react-router-dom';

/** Resolved category id from scoped route param or legacy ?categoryId= query. */
export function useCategoryScopeId() {
  const { productCategoryId } = useParams();
  const [searchParams] = useSearchParams();
  return productCategoryId || searchParams.get('categoryId') || '';
}
