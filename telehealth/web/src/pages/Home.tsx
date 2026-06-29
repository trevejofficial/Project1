import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Provider } from '../api';
import { ProviderCard } from '../components/ProviderCard';

export default function Home() {
  const [featured, setFeatured] = useState<Provider[]>([]);

  useEffect(() => {
    api.listProviders().then((list) => setFeatured(list.slice(0, 4)));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <span className="badge">Hablamos tu idioma 🇲🇽🇨🇺🇵🇷🇨🇴🇻🇪</span>
          <h1>Tu salud y bienestar, en español</h1>
          <p className="lead">
            Conéctate por video con médicos y psicólogos que hablan español. Sin seguro, sin filas y
            desde donde estés en Estados Unidos.
          </p>
          <div className="hero-cta">
            <Link to="/proveedores?cat=medica" className="btn-primary">
              Consulta médica
            </Link>
            <Link to="/proveedores?cat=psicologica" className="btn-secondary">
              Atención psicológica
            </Link>
          </div>
          <ul className="hero-points">
            <li>✓ Especialistas certificados que hablan español</li>
            <li>✓ Citas el mismo día por videollamada</li>
            <li>✓ Precios claros, sin sorpresas</li>
          </ul>
        </div>
        <div className="hero-art" aria-hidden>
          <div className="hero-card card">
            <div className="hero-card-row">
              <span className="dot online" /> Dra. en línea
            </div>
            <div className="hero-avatar">👩🏽‍⚕️</div>
            <p>“¿En qué puedo ayudarte hoy?”</p>
            <div className="hero-card-actions">
              <span className="pill">🎥 Video</span>
              <span className="pill">💬 Chat</span>
              <span className="pill">🇪🇸 Español</span>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="card service-card medica">
          <div className="service-icon">🩺</div>
          <h2>Consultas médicas</h2>
          <p>
            Medicina general, pediatría, salud de la mujer y nutrición. Recetas, certificados y
            seguimiento sin salir de casa.
          </p>
          <Link to="/proveedores?cat=medica" className="link-arrow">
            Ver médicos →
          </Link>
        </div>
        <div className="card service-card psicologica">
          <div className="service-icon">💚</div>
          <h2>Atención psicológica</h2>
          <p>
            Terapia para ansiedad, depresión, estrés, duelo y adaptación. Psicólogos y psiquiatras
            que entienden tu cultura.
          </p>
          <Link to="/proveedores?cat=psicologica" className="link-arrow">
            Ver psicólogos →
          </Link>
        </div>
      </section>

      <section className="steps">
        <h2>Cómo funciona</h2>
        <div className="steps-grid">
          <article className="card step">
            <span className="step-num">1</span>
            <h3>Elige especialista</h3>
            <p>Médico o psicólogo según lo que necesites. Todos hablan español.</p>
          </article>
          <article className="card step">
            <span className="step-num">2</span>
            <h3>Agenda tu cita</h3>
            <p>Escoge el día y la hora que mejor te queden, incluso hoy mismo.</p>
          </article>
          <article className="card step">
            <span className="step-num">3</span>
            <h3>Conéctate por video</h3>
            <p>Entra a tu consulta desde el teléfono o la computadora.</p>
          </article>
        </div>
      </section>

      <section className="featured">
        <div className="featured-head">
          <h2>Especialistas destacados</h2>
          <Link to="/proveedores" className="link-arrow">
            Ver todos →
          </Link>
        </div>
        <div className="provider-list">
          {featured.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
