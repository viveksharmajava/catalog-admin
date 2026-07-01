import { NavLink, useParams } from 'react-router-dom';

export default function StoreScopedSubNav() {
  const { productStoreId } = useParams();
  const base = `/stores/${encodeURIComponent(productStoreId)}`;

  const items = [
    { to: `${base}/store`, label: 'Store', end: true },
    { to: `${base}/settings`, label: 'Settings', end: true },
  ];

  return (
    <nav className="category-subnav" aria-label="Store section navigation">
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
