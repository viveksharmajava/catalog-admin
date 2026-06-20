import { NavLink } from 'react-router-dom';

const items = [
  { to: '/category/find', label: 'Find Category', end: false },
  { to: '/category/rollup', label: 'Rollup', end: false },
  { to: '/category/products', label: 'Products', end: false },
  { to: '/category/catalogs', label: 'Catalog', end: false },
];

export default function CategorySubNav() {
  return (
    <nav className="category-subnav" aria-label="Category section navigation">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'category-subnav-link active' : 'category-subnav-link')}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
