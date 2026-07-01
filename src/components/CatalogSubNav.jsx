import { NavLink, useParams } from 'react-router-dom';

export default function CatalogSubNav() {
  const { prodCatalogId } = useParams();
  const base = `/catalog/${encodeURIComponent(prodCatalogId)}`;

  const items = [
    { to: `${base}/catalog`, label: 'Catalog', end: true },
    { to: `${base}/categories`, label: 'Categories', end: true },
    { to: `${base}/stores`, label: 'Stores', end: true },
  ];

  return (
    <nav className="catalog-subnav" aria-label="Catalog section navigation">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'catalog-subnav-link active' : 'catalog-subnav-link')}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
