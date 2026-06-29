import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Transaction } from '../api';
import { useAuth } from '../auth';
import { DELIVERY_LABELS, formatCup, formatDate, formatUsd, STATUS_LABELS } from '../format';

export default function Dashboard() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setTxs(await api.listTransactions());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const totals = useMemo(() => {
    const sent = txs.reduce((acc, t) => acc + t.amountUsd, 0);
    const active = txs.filter((t) => t.status !== 'completed').length;
    return { sent, active, count: txs.length };
  }, [txs]);

  async function advance(id: number) {
    const updated = await api.advanceTransaction(id);
    setTxs((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Hola, {user?.name.split(' ')[0]} 👋</h1>
          <p className="muted">Aquí está el resumen de tus envíos.</p>
        </div>
        <Link to="/app/enviar" className="btn-primary">
          Nuevo envío
        </Link>
      </div>

      <div className="stats">
        <div className="card stat">
          <span className="stat-label">Total enviado</span>
          <strong className="stat-value">{formatUsd(totals.sent)}</strong>
        </div>
        <div className="card stat">
          <span className="stat-label">Envíos realizados</span>
          <strong className="stat-value">{totals.count}</strong>
        </div>
        <div className="card stat">
          <span className="stat-label">En curso</span>
          <strong className="stat-value">{totals.active}</strong>
        </div>
      </div>

      <h2>Historial</h2>
      {loading ? (
        <div className="card empty">Cargando…</div>
      ) : txs.length === 0 ? (
        <div className="card empty">
          <p>Todavía no has hecho ningún envío.</p>
          <Link to="/app/enviar" className="btn-primary">
            Hacer mi primer envío
          </Link>
        </div>
      ) : (
        <div className="tx-list">
          {txs.map((t) => (
            <div key={t.id} className="card tx-item">
              <div className="tx-main">
                <div>
                  <strong>{t.recipient?.fullName ?? 'Destinatario'}</strong>
                  <p className="muted">
                    {t.reference} · {formatDate(t.createdAt)}
                  </p>
                  <span className="chip small">
                    {DELIVERY_LABELS[t.deliveryMethod] ?? t.deliveryMethod}
                  </span>
                </div>
                <div className="tx-amounts">
                  <strong>{formatCup(t.amountCup)}</strong>
                  <span className="muted">{formatUsd(t.totalUsd)} pagado</span>
                </div>
              </div>
              <div className="tx-foot">
                <span className={`status status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                {t.status !== 'completed' && (
                  <button className="btn-ghost btn-sm" onClick={() => advance(t.id)}>
                    Simular avance →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
