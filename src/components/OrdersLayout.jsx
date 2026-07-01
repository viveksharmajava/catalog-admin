import { Outlet } from 'react-router-dom';
import OrdersSubNav from './OrdersSubNav';

export default function OrdersLayout() {
  return (
    <div>
      <OrdersSubNav />
      <Outlet />
    </div>
  );
}
