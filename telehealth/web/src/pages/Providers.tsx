import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type Provider } from '../api';
import { ProviderCard } from '../components/ProviderCard';
import { CrisisNote } from '../components/CrisisNote';

const FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'medica', label: 'Médicos' },
  { id: 'psicologica', label: 'Psicólogos' },
];

export default function Providers() {
  const [params, setParams] = useSearchParams();
  const category = params.get('cat') ?? '';
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listProviders(category || undefined).then((list) => {
      setProviders(list);
      setLoading(false);
    });
  }, [category]);

  function setCategory(cat: string) {
    setParams(cat ? { cat } : {});
  }

  return (
    <div className="page">
      <h1>Nuestros especialistas</h1>
      <p className="muted">Todos atienden en español por videollamada.</p>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`filter ${category === f.id ? 'active' : ''}`}
            onClick={() => setCategory(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {category === 'psicologica' && <CrisisNote />}

      {loading ? (
        <div className="card empty">Cargando…</div>
      ) : (
        <div className="provider-list">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}
