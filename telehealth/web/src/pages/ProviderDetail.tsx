import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Appointment, type Provider } from '../api';
import { useAuth } from '../auth';
import { CrisisNote } from '../components/CrisisNote';
import { formatDay, formatTime, formatUsd, groupSlotsByDay } from '../format';

export default function ProviderDetail() {
  const { id } = useParams();
  const providerId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [days, setDays] = useState<{ day: string; slots: string[] }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState<Appointment | null>(null);

  useEffect(() => {
    api.getProvider(providerId).then(setProvider).catch(() => setProvider(null));
    api.getSlots(providerId).then((r) => setDays(groupSlotsByDay(r.slots)));
  }, [providerId]);

  async function onBook() {
    if (!user) {
      navigate('/ingresar', { state: { from: `/proveedores/${providerId}` } });
      return;
    }
    if (!selected) {
      setError('Elige un horario');
      return;
    }
    if (reason.trim().length < 3) {
      setError('Cuéntanos brevemente el motivo de la consulta');
      return;
    }
    setError('');
    setBooking(true);
    try {
      const appt = await api.createAppointment({
        providerId,
        scheduledAt: selected,
        reason: reason.trim(),
      });
      setDone(appt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agendar');
    } finally {
      setBooking(false);
    }
  }

  if (!provider) {
    return <div className="page narrow"><div className="card empty">Cargando especialista…</div></div>;
  }

  if (done) {
    return (
      <div className="page narrow">
        <div className="card success-card">
          <div className="success-check">✓</div>
          <h1>¡Cita agendada!</h1>
          <p className="muted">
            Con {provider.title} {provider.name}
          </p>
          <div className="receipt">
            <div className="quote-row big">
              <span>Tu consulta</span>
              <strong>{formatDay(done.scheduledAt)} · {formatTime(done.scheduledAt)}</strong>
            </div>
            <div className="quote-row">
              <span>Especialidad</span>
              <span>{provider.specialty}</span>
            </div>
            <div className="quote-row total">
              <span>Costo</span>
              <strong>{formatUsd(provider.priceUsd)}</strong>
            </div>
          </div>
          <button className="btn-primary block" onClick={() => navigate('/citas')}>
            Ver mis citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page provider-detail">
      <Link to="/proveedores" className="back-link">← Volver a especialistas</Link>

      <div className="detail-grid">
        <div className="card profile">
          <div className="profile-head">
            <div className="provider-avatar big" aria-hidden>{provider.avatar}</div>
            <div>
              <h1>{provider.title} {provider.name}</h1>
              <p className="provider-specialty">{provider.specialty}</p>
              <div className="provider-meta">
                <span className="rating">★ {provider.rating.toFixed(1)}</span>
                <span>· {provider.years} años de experiencia</span>
              </div>
              <div className="lang-chips">
                {provider.languages.map((l) => (
                  <span key={l} className="chip">{l}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="bio">{provider.bio}</p>
          <div className="price-row">
            <span>Costo por sesión</span>
            <strong>{formatUsd(provider.priceUsd)}</strong>
          </div>
          {provider.category === 'psicologica' && <CrisisNote />}
        </div>

        <div className="card booking">
          <h2>Agenda tu cita</h2>
          {days.length === 0 ? (
            <p className="muted">No hay horarios disponibles por ahora.</p>
          ) : (
            <>
              <p className="field-label">Elige un horario</p>
              <div className="slots">
                {days.map(({ day, slots }) => (
                  <div key={day} className="slot-day">
                    <span className="slot-day-label">{formatDay(day)}</span>
                    <div className="slot-times">
                      {slots.map((iso) => (
                        <button
                          key={iso}
                          className={`slot ${selected === iso ? 'active' : ''}`}
                          onClick={() => setSelected(iso)}
                        >
                          {formatTime(iso)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <label>
                Motivo de la consulta
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej.: Dolor de garganta hace 3 días / Quiero hablar sobre ansiedad"
                  rows={3}
                />
              </label>

              {error && <p className="form-error">{error}</p>}
              <button className="btn-primary block" onClick={onBook} disabled={booking}>
                {booking ? 'Agendando…' : user ? 'Confirmar cita' : 'Ingresar y agendar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
