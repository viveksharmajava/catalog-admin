import { NavLink } from 'react-router-dom';

function linkClass(isActive) {
  return isActive ? 'product-subnav-link active' : 'product-subnav-link';
}

export default function PartySubNav() {
  const items = [
    { to: '/party/person/find', label: 'Person', end: false },
    { to: '/party/security-group/find', label: 'Security Group', end: false },
    { to: '/party/permission/find', label: 'Permission', end: false },
  ];

  return (
    <nav className="product-subnav" aria-label="Party section navigation">
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
