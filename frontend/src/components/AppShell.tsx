import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItemBase = 'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium';
const navItemActive = 'bg-amber-400 text-gray-900';
const navItemInactive = 'text-gray-700 hover:bg-gray-100';

function navClass({ isActive }: { isActive: boolean }) {
  return `${navItemBase} ${isActive ? navItemActive : navItemInactive}`;
}

export function AppShell() {
  const { role, logout } = useAuth();

  return (
    <div className="bg-gray-50 flex">
      <aside className="w-60 h-screen sticky top-0 overflow-y-auto bg-white flex flex-col p-4">
        <div className="text-xl font-semibold text-gray-900 mb-8">Bito POS</div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLink to="/catalog" className={navClass}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={navClass}>
            Cart
          </NavLink>
          {role === 'admin' && (
            <NavLink to="/admin/report" className={navClass}>
              Sales Report
            </NavLink>
          )}
        </nav>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-sm font-medium text-gray-900 mb-2 capitalize">{role}</div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
