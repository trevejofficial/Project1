import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Appointment } from '../api';
import { useAuth } from '../auth';
import { CATEGORY_LABELS, formatDateTime, STATUS_LABELS } from '../format';

export default function Appointments() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setAppts(await api.listAppointments());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: Appointment[] = [];
    const old: Appointment[] = [];
    for (const a of appts) {
      if (a.status === 'agendada' && new Date(a.scheduledAt).getTime() > now) up.push(a);
      else old.push(a);
    }
    up.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    return { upcoming: up, past: old };
  }, [appts]);

  async function cancel(id: number) {
    if (!confirm('¿Cancelar esta cita?')) return;
    const updated = await api.cancelAppointment(id);
    setAppts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  function Item({ a, canJoin }: { a: Appointment; canJoin: boolean }) {
    return (
      <div className="card appt-item">
        <div className="appt-avatar" aria-hidden>{a.provider.avatar}</div>
        <div className="appt-body">
          <strong>{a.provider.title} {a.provider.name}</strong>
          <p className="muted">{a.provider.specialty}</p>
          <p className="appt-when">🗓️ {formatDateTime(a.scheduledAt)}</p>
          <span className={`chip cat-${a.provider.category}`}>
            {CATEGORY_LABELS[a.provider.category]}
          </span>
        </div>
        <div className="appt-actions">
          <span className={`status status-${a.status}`}>{STATUS_LABELS[a.status]}</span>
          {canJoin && (
            <>
              <Link to={`/consulta/${a.roomCode}`} className="btn-primary btn-sm">
                Entrar a consulta
              </Link>
              <button className="btn-ghost btn-sm danger" onClick={() => cancel(a.id)}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Hola, {user?.name.split(' ')[0]} 👋</h1>
          <p className="muted">Estas son tus consultas.</p>
        </div>
        <Link to="/proveedores" className="btn-primary">Agendar nueva cita</Link>
      </div>

      {loading ? (
        <div className="card empty">Cargando…</div>
      ) : appts.length === 0 ? (
        <div className="card empty">
          <p>Todavía no tienes citas.</p>
          <Link to="/proveedores" className="btn-primary">Buscar especialista</Link>
        </div>
      ) : (
        <>
          <h2>Próximas</h2>
          {upcoming.length === 0 ? (
            <div className="card empty">No tienes citas próximas.</div>
          ) : (
            <div className="appt-list">
              {upcoming.map((a) => (
                <Item key={a.id} a={a} canJoin />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <>
              <h2>Historial</h2>
              <div className="appt-list">
                {past.map((a) => (
                  <Item key={a.id} a={a} canJoin={false} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
