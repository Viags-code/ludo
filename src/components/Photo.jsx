import Icone from './Icone';
import { teinte } from '../format';

// Une photo, ou un aplat couleur bois si l'article n'en a pas encore.
export default function Photo({ src, alt, graine, chargement = 'lazy' }) {
  if (src) return <img src={src} alt={alt} loading={chargement} decoding="async" />;
  return (
    <div className="sans-photo" style={{ background: teinte(graine) }} role="img" aria-label={`${alt} (photo à venir)`}>
      <Icone nom="photo" taille={32} />
    </div>
  );
}
