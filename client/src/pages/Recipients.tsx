import { useEffect, useState, type FormEvent } from 'react';
import { api, type RatesInfo, type Recipient } from '../api';
import { DELIVERY_LABELS } from '../format';

const EMPTY = {
  fullName: '',
  phone: '',
  province: '',
  deliveryMethod: 'cash',
  accountNumber: '',
};

export default function Recipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [rates, setRates] = useState<RatesInfo | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setRecipients(await api.listRecipients());
  }

  useEffect(() => {
    api.getRates().then((r) => {
      setRates(r);
      setForm((f) => ({ ...f, province: r.provinces[2] ?? r.provinces[0] }));
    });
    refresh();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createRecipient({
        fullName: form.fullName,
        phone: form.phone,
        province: form.province,
        deliveryMethod: form.deliveryMethod,
        accountNumber: form.accountNumber || null,
      });
      setForm({ ...EMPTY, province: form.province });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm('¿Eliminar este destinatario?')) return;
    await api.deleteRecipient(id);
    await refresh();
  }

  const needsAccount = form.deliveryMethod !== 'cash';

  return (
    <div className="page">
      <h1>Destinatarios</h1>
      <p className="muted">Guarda a tus familiares para enviar más rápido.</p>

      <div className="two-col">
        <form className="card" onSubmit={onSubmit}>
          <h2>Agregar destinatario</h2>
          <label>
            Nombre completo
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Juan Rodríguez"
              required
            />
          </label>
          <label>
            Teléfono en Cuba
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+53 5 1234567"
              required
            />
          </label>
          <label>
            Provincia
            <select
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
            >
              {rates?.provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            Método de entrega
            <select
              value={form.deliveryMethod}
              onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}
            >
              {rates?.deliveryMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          {needsAccount && (
            <label>
              Número de tarjeta/cuenta
              <input
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="9XXX XXXX XXXX XXXX"
              />
            </label>
          )}

          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary block" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar destinatario'}
          </button>
        </form>

        <div className="list">
          {recipients.length === 0 && (
            <div className="card empty">Aún no tienes destinatarios guardados.</div>
          )}
          {recipients.map((r) => (
            <div key={r.id} className="card recipient-item">
              <div>
                <strong>{r.fullName}</strong>
                <p className="muted">
                  {r.province} · {r.phone}
                </p>
                <span className="chip">{DELIVERY_LABELS[r.deliveryMethod] ?? r.deliveryMethod}</span>
              </div>
              <button className="btn-ghost danger" onClick={() => onDelete(r.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
