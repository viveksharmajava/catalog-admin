import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AdminLayout() {
  const { auth, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Catalog Admin</h1>
        <div className="topbar-meta">
          <span>{auth?.username}</span>
          <span>({auth?.roles?.join(', ')})</span>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <div className="layout-body">
        <aside className="sidebar">
          <nav>
            <NavLink to="/products/find">Find Product</NavLink>
            <NavLink to="/products/create">Create Product</NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
