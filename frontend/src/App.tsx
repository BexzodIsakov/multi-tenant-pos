import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicOnly } from './components/PublicOnly';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import { AppShell } from './components/AppShell';
import { Login } from './pages/Login';
import { Catalog } from './pages/Catalog';
import { Cart } from './pages/Cart';
import { Receipt } from './pages/Receipt';
import { AdminReport } from './pages/AdminReport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/receipt/:orderId" element={<Receipt />} />

            <Route element={<RequireRole role="admin" />}>
              <Route path="/admin/report" element={<AdminReport />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/catalog" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
