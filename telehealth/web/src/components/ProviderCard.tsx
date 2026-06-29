import { Link } from 'react-router-dom';
import type { Provider } from '../api';
import { formatUsd } from '../format';

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link to={`/proveedores/${provider.id}`} className="card provider-card">
      <div className="provider-avatar" aria-hidden>
        {provider.avatar}
      </div>
      <div className="provider-info">
        <h3>
          {provider.title} {provider.name}
        </h3>
        <p className="provider-specialty">{provider.specialty}</p>
        <div className="provider-meta">
          <span className="rating">★ {provider.rating.toFixed(1)}</span>
          <span>· {provider.years} años</span>
          <span>· {provider.languages.join(', ')}</span>
        </div>
      </div>
      <div className="provider-price">
        <strong>{formatUsd(provider.priceUsd)}</strong>
        <span>por sesión</span>
      </div>
    </Link>
  );
}
