import { NavLink, useParams } from 'react-router-dom';

export default function CategoryScopedSubNav() {
  const { productCategoryId } = useParams();
  const base = `/category/${encodeURIComponent(productCategoryId)}`;

  const items = [
    { to: `${base}/category`, label: 'Category', end: true },
    { to: `${base}/rollup`, label: 'Rollup', end: true },
    { to: `${base}/products`, label: 'Products', end: true },
    { to: `${base}/catalogs`, label: 'Catalog', end: true },
  ];

  return (
    <nav className="category-subnav" aria-label="Category section navigation">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'category-subnav-link active' : 'category-subnav-link'
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
