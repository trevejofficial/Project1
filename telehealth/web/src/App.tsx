import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import { CrisisNote } from './components/CrisisNote';
import Appointments from './pages/Appointments';
import Consult from './pages/Consult';
import Home from './pages/Home';
import Login from './pages/Login';
import ProviderDetail from './pages/ProviderDetail';
import Providers from './pages/Providers';
import Register from './pages/Register';

function NavBar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const active = (p: string) => (pathname === p ? 'active' : '');

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src="/logo.svg" alt="" width={30} height={30} />
        <span>Salud<strong>Juntos</strong></span>
      </Link>
      <nav>
        <Link className={active('/proveedores')} to="/proveedores">
          Especialistas
        </Link>
        {user ? (
          <>
            <Link className={active('/citas')} to="/citas">
              Mis citas
            </Link>
            <button className="btn-ghost btn-sm" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/ingresar">Ingresar</Link>
            <Link to="/registro" className="btn-primary btn-sm">
              Crear cuenta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/ingresar" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ingresar" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/proveedores" element={<Providers />} />
          <Route path="/proveedores/:id" element={<ProviderDetail />} />
          <Route
            path="/citas"
            element={
              <Protected>
                <Appointments />
              </Protected>
            }
          />
          <Route
            path="/consulta/:code"
            element={
              <Protected>
                <Consult />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <CrisisNote compact />
        <p>SaludJuntos · Demostración educativa. No reemplaza la atención médica profesional.</p>
      </footer>
    </div>
  );
}
