import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Access Denied</h1>
        <p>Your account does not have permission to access this admin page.</p>
        <Link to="/login" className="btn-secondary">
          Back to login
        </Link>
      </div>
    </div>
  );
}
