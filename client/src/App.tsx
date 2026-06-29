import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import type { ReactNode } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Recipients from './pages/Recipients';

function NavBar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src="/flag.svg" alt="" width={28} height={28} />
        <span>Cuba<strong>Remesas</strong></span>
      </Link>
      <nav>
        {user ? (
          <>
            <Link className={pathname === '/app' ? 'active' : ''} to="/app">
              Mis envíos
            </Link>
            <Link className={pathname === '/app/enviar' ? 'active' : ''} to="/app/enviar">
              Enviar dinero
            </Link>
            <Link className={pathname === '/app/destinatarios' ? 'active' : ''} to="/app/destinatarios">
              Destinatarios
            </Link>
            <button className="btn-ghost" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
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
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/app"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/app/enviar"
            element={
              <Protected>
                <Send />
              </Protected>
            }
          />
          <Route
            path="/app/destinatarios"
            element={
              <Protected>
                <Recipients />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>CubaRemesas · Demostración educativa. No procesa pagos reales.</p>
      </footer>
    </div>
  );
}
