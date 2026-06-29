import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Quote, type RatesInfo, type Recipient, type Transaction } from '../api';
import { DELIVERY_LABELS, formatCup, formatUsd } from '../format';

export default function Send() {
  const navigate = useNavigate();
  const [rates, setRates] = useState<RatesInfo | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [amount, setAmount] = useState(100);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Transaction | null>(null);

  useEffect(() => {
    api.getRates().then(setRates);
    api.listRecipients().then((list) => {
      setRecipients(list);
      if (list.length) setRecipientId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!rates) return;
    if (amount < rates.minSendUsd || amount > rates.maxSendUsd) {
      setQuote(null);
      return;
    }
    const handle = setTimeout(() => {
      api.getQuote(amount).then(setQuote).catch(() => setQuote(null));
    }, 250);
    return () => clearTimeout(handle);
  }, [amount, rates]);

  const recipient = recipients.find((r) => r.id === recipientId) ?? null;

  async function onConfirm() {
    if (!recipientId) {
      setError('Selecciona un destinatario');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const tx = await api.createTransaction({ recipientId, amountUsd: amount });
      setDone(tx);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el envío');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="page narrow">
        <div className="card success-card">
          <div className="success-check">✓</div>
          <h1>¡Envío creado!</h1>
          <p className="muted">
            Tu referencia es <strong>{done.reference}</strong>
          </p>
          <div className="receipt">
            <div className="quote-row big">
              <span>Recibe {done.recipient?.fullName}</span>
              <strong>{formatCup(done.amountCup)}</strong>
            </div>
            <div className="quote-row">
              <span>Enviaste</span>
              <span>{formatUsd(done.amountUsd)}</span>
            </div>
            <div className="quote-row">
              <span>Comisión</span>
              <span>{formatUsd(done.feeUsd)}</span>
            </div>
            <div className="quote-row total">
              <span>Total pagado</span>
              <strong>{formatUsd(done.totalUsd)}</strong>
            </div>
          </div>
          <button className="btn-primary block" onClick={() => navigate('/app')}>
            Ver mis envíos
          </button>
        </div>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="page narrow">
        <div className="card empty">
          <h2>Primero agrega un destinatario</h2>
          <p className="muted">Necesitas registrar a quién enviarás el dinero.</p>
          <Link to="/app/destinatarios" className="btn-primary">
            Agregar destinatario
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h1>Enviar dinero</h1>

      <div className="card">
        <label>
          ¿A quién envías?
          <select
            value={recipientId ?? ''}
            onChange={(e) => setRecipientId(Number(e.target.value))}
          >
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fullName} — {r.province}
              </option>
            ))}
          </select>
        </label>

        {recipient && (
          <p className="chip">
            {DELIVERY_LABELS[recipient.deliveryMethod] ?? recipient.deliveryMethod}
          </p>
        )}

        <label>
          Monto a enviar (USD)
          <div className="input-money">
            <span>$</span>
            <input
              type="number"
              min={rates?.minSendUsd ?? 10}
              max={rates?.maxSendUsd ?? 2000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </label>

        <div className="amount-presets">
          {[50, 100, 200, 500].map((v) => (
            <button
              key={v}
              type="button"
              className={amount === v ? 'preset active' : 'preset'}
              onClick={() => setAmount(v)}
            >
              ${v}
            </button>
          ))}
        </div>

        <div className="quote-box">
          {rates && (amount < rates.minSendUsd || amount > rates.maxSendUsd) && (
            <p className="form-error">
              El monto debe estar entre {formatUsd(rates.minSendUsd)} y {formatUsd(rates.maxSendUsd)}.
            </p>
          )}
          {quote && (
            <>
              <div className="quote-row">
                <span>Tasa</span>
                <span>1 USD = {quote.rate.toFixed(2)} CUP</span>
              </div>
              <div className="quote-row big">
                <span>Recibe en Cuba</span>
                <strong>{formatCup(quote.amountCup)}</strong>
              </div>
              <div className="quote-row">
                <span>Comisión</span>
                <span>{formatUsd(quote.feeUsd)}</span>
              </div>
              <div className="quote-row total">
                <span>Total a pagar</span>
                <strong>{formatUsd(quote.totalUsd)}</strong>
              </div>
            </>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        <button
          className="btn-primary block"
          onClick={onConfirm}
          disabled={submitting || !quote}
        >
          {submitting ? 'Procesando…' : 'Confirmar envío'}
        </button>
      </div>
    </div>
  );
}
