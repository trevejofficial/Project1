import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Appointment } from '../api';
import { formatDateTime } from '../format';

/**
 * Sala de consulta simulada. En un producto real aquí se integraría un SDK
 * de video (p. ej. Twilio, Daily o Zoom). Aquí mostramos la sala de espera.
 */
export default function Consult() {
  const { code } = useParams();
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    api.listAppointments().then((list) => {
      const match = list.find((a) => a.roomCode === code);
      if (match) setAppt(match);
      else setNotFound(true);
    });
  }, [code]);

  if (notFound) {
    return (
      <div className="page narrow">
        <div className="card empty">
          <h2>Consulta no encontrada</h2>
          <Link to="/citas" className="btn-primary">Volver a mis citas</Link>
        </div>
      </div>
    );
  }

  if (!appt) {
    return <div className="page narrow"><div className="card empty">Conectando…</div></div>;
  }

  return (
    <div className="page narrow">
      <div className="consult-room">
        <div className="video-stage">
          <div className="remote-video">
            <div className="remote-avatar">{appt.provider.avatar}</div>
            <p>{appt.provider.title} {appt.provider.name}</p>
            <span className="waiting">Sala de espera · tu especialista se unirá pronto</span>
          </div>
          <div className="self-video">{camOn ? '🙂' : '🚫'}</div>
        </div>

        <div className="consult-bar">
          <button
            className={`ctrl ${micOn ? '' : 'off'}`}
            onClick={() => setMicOn((v) => !v)}
            aria-label="Micrófono"
          >
            {micOn ? '🎙️' : '🔇'}
          </button>
          <button
            className={`ctrl ${camOn ? '' : 'off'}`}
            onClick={() => setCamOn((v) => !v)}
            aria-label="Cámara"
          >
            {camOn ? '🎥' : '📷'}
          </button>
          <Link to="/citas" className="ctrl leave" aria-label="Salir">📞</Link>
        </div>
      </div>

      <div className="card consult-info">
        <h2>Detalles de la consulta</h2>
        <p><strong>Especialista:</strong> {appt.provider.title} {appt.provider.name} · {appt.provider.specialty}</p>
        <p><strong>Fecha:</strong> {formatDateTime(appt.scheduledAt)}</p>
        <p><strong>Motivo:</strong> {appt.reason}</p>
        <p className="muted code">Código de sala: {appt.roomCode}</p>
      </div>
    </div>
  );
}
