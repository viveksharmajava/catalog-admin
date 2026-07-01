import { NavLink } from 'react-router-dom';

function linkClass(isActive) {
  return isActive ? 'product-subnav-link active' : 'product-subnav-link';
}

export default function OrdersSubNav() {
  const items = [
    { to: '/orders/order/find', label: 'Find Orders' },
    { to: '/orders/order/create', label: 'Create Order' },
    { to: '/orders/quote/find', label: 'Find Quote' },
    { to: '/orders/quote/create', label: 'Create Quote' },
    { to: '/orders/order/cancel', label: 'Cancel Order' },
  ];

  return (
    <nav className="product-subnav" aria-label="Orders section navigation">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} className={({ isActive }) => linkClass(isActive)}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
