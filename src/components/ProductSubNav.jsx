import { NavLink, useParams } from 'react-router-dom';

export default function ProductSubNav() {
  const { productId } = useParams();
  const base = `/products/${encodeURIComponent(productId)}`;

  const items = [
    { to: `${base}/product`, label: 'Product', end: true },
    { to: `${base}/prices`, label: 'Prices', end: true },
    { to: `${base}/categories`, label: 'Categories', end: true },
    { to: `${base}/images`, label: 'Images', end: true },
    { to: `${base}/attributes`, label: 'Attributes', end: true },
  ];

  return (
    <nav className="product-subnav" aria-label="Product section navigation">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'product-subnav-link active' : 'product-subnav-link')}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
