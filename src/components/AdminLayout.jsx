import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function menuClass(isActive) {
  return isActive ? 'main-menu-link active' : 'main-menu-link';
}

export default function AdminLayout() {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const productsActive = location.pathname.startsWith('/products');
  const catalogActive = location.pathname.startsWith('/catalog');
  const categoryActive = location.pathname.startsWith('/category');
  const storesActive = location.pathname.startsWith('/stores');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <h1>Catalog Admin</h1>
          <nav className="main-menu" aria-label="Main navigation">
            <NavLink to="/products/find" className={menuClass(productsActive)}>
              Products
            </NavLink>
            <NavLink to="/catalog/find" className={menuClass(catalogActive)}>
              Catalog
            </NavLink>
            <NavLink to="/category/find" className={menuClass(categoryActive)}>
              Category
            </NavLink>
            <NavLink to="/stores" className={menuClass(storesActive)}>
              Stores
            </NavLink>
          </nav>
        </div>
        <div className="topbar-right">
          <div className="topbar-meta">
            <span>{auth?.username}</span>
            <span>({auth?.roles?.join(', ')})</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
