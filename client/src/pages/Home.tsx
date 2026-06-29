import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Quote, type RatesInfo } from '../api';
import { useAuth } from '../auth';
import { formatCup, formatUsd } from '../format';

export default function Home() {
  const { user } = useAuth();
  const [rates, setRates] = useState<RatesInfo | null>(null);
  const [amount, setAmount] = useState(100);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getRates().then(setRates).catch(() => setError('No se pudo cargar la tasa.'));
  }, []);

  useEffect(() => {
    if (!rates) return;
    if (amount < rates.minSendUsd || amount > rates.maxSendUsd) {
      setQuote(null);
      setError(`El monto debe estar entre ${formatUsd(rates.minSendUsd)} y ${formatUsd(rates.maxSendUsd)}.`);
      return;
    }
    setError('');
    const handle = setTimeout(() => {
      api.getQuote(amount).then(setQuote).catch(() => setQuote(null));
    }, 250);
    return () => clearTimeout(handle);
  }, [amount, rates]);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="badge">🇨🇺 Llega a toda la isla</span>
          <h1>
            Envía dinero a Cuba
            <br />
            rápido, seguro y al mejor cambio
          </h1>
          <p className="lead">
            Tu familia recibe en efectivo a domicilio, recarga de tarjeta en CUP o tarjeta MLC.
            Sin filas, sin complicaciones y con seguimiento en tiempo real.
          </p>
          <div className="hero-cta">
            <Link to={user ? '/app/enviar' : '/registro'} className="btn-primary">
              {user ? 'Enviar dinero' : 'Empezar ahora'}
            </Link>
            <a href="#como-funciona" className="btn-ghost">
              Cómo funciona
            </a>
          </div>
        </div>

        <div className="calculator card">
          <h2>Calcula tu envío</h2>
          <label>
            Tú envías (USD)
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

          <div className="rate-line">
            {rates ? (
              <span>
                Tasa de hoy: <strong>1 USD = {rates.rate.toFixed(2)} CUP</strong>
              </span>
            ) : (
              <span>Cargando tasa…</span>
            )}
          </div>

          <div className="quote-box">
            {error && <p className="form-error">{error}</p>}
            {quote && !error && (
              <>
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

          <Link to={user ? '/app/enviar' : '/registro'} className="btn-primary block">
            Continuar
          </Link>
        </div>
      </section>

      <section id="como-funciona" className="steps">
        <h2>Cómo funciona</h2>
        <div className="steps-grid">
          <article className="card step">
            <span className="step-num">1</span>
            <h3>Crea tu cuenta</h3>
            <p>Regístrate en menos de un minuto con tu correo electrónico.</p>
          </article>
          <article className="card step">
            <span className="step-num">2</span>
            <h3>Agrega al destinatario</h3>
            <p>Indica a quién enviar y cómo quieres que reciba el dinero en Cuba.</p>
          </article>
          <article className="card step">
            <span className="step-num">3</span>
            <h3>Envía y haz seguimiento</h3>
            <p>Confirma el envío y sigue su estado hasta la entrega.</p>
          </article>
        </div>
      </section>

      <section className="features">
        <div className="feature card">
          <h3>💸 Mejor tasa</h3>
          <p>Cambio competitivo USD → CUP actualizado durante el día.</p>
        </div>
        <div className="feature card">
          <h3>🏠 Entrega a domicilio</h3>
          <p>Efectivo en la puerta de tu familia en todas las provincias.</p>
        </div>
        <div className="feature card">
          <h3>🔒 Seguro</h3>
          <p>Tus datos protegidos y cada envío con número de referencia.</p>
        </div>
      </section>
    </div>
  );
}
