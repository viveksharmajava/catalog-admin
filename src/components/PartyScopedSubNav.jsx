import { NavLink, useParams } from 'react-router-dom';

export default function PartyScopedSubNav() {
  const { partyId } = useParams();
  const base = `/party/person/${encodeURIComponent(partyId)}`;

  const items = [
    { to: `${base}/person`, label: 'Personal Information', end: true },
    { to: `${base}/addresses`, label: 'Manage Addresses', end: true },
  ];

  return (
    <nav className="category-subnav" aria-label="Party section navigation">
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
