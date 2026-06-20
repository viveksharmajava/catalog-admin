import { Outlet } from 'react-router-dom';
import CategorySubNav from './CategorySubNav';

export default function CategoryLayout() {
  return (
    <div className="category-section">
      <CategorySubNav />
      <Outlet />
    </div>
  );
}
