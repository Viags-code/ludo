import { useState } from 'react';
import Icone from './Icone';
import { teinte } from '../format';
import { estVideo, vignette } from '../media';

// Vignette d'un média : la photo, ou l'aperçu d'une vidéo avec un symbole lecture,
// ou un aplat couleur bois si l'article n'a encore rien (ou si l'aperçu manque).
export default function Photo({ src, alt, graine, chargement = 'lazy' }) {
  const [rate, setRate] = useState(false);
  const video = estVideo(src);

  if (src && !rate) {
    return (
      <>
        <img src={vignette(src)} alt={alt} loading={chargement} decoding="async" onError={() => setRate(true)} />
        {video && <span className="badge-lecture" aria-hidden="true"><Icone nom="video" taille={16} /></span>}
      </>
    );
  }
  return (
    <div className="sans-photo" style={{ background: teinte(graine) }} role="img" aria-label={`${alt}${src ? '' : ' (photo à venir)'}`}>
      <Icone nom={video ? 'video' : 'photo'} taille={32} />
    </div>
  );
}
