import { Outlet } from 'react-router-dom';
import PartySubNav from './PartySubNav';

export default function PartyLayout() {
  return (
    <div>
      <PartySubNav />
      <Outlet />
    </div>
  );
}
