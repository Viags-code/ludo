import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icone from './Icone';
import FenetreVideo from './Video';
import { numeroInternational } from '../format';

// Menu ☰ de l'en-tête : appeler, vidéo, contact et informations légales.
export default function Menu({ site }) {
  const [ouvert, setOuvert] = useState(false);
  const [video, setVideo] = useState(false);
  const tiroir = useRef(null);

  useEffect(() => {
    const el = tiroir.current;
    if (!el) return;
    if (ouvert && !el.open) el.showModal();
    if (!ouvert && el.open) el.close();
  }, [ouvert]);

  const fermer = () => setOuvert(false);
  const telephone = site?.telephone ? numeroInternational(site.telephone) : '';
  const legal = [
    site?.entreprise || site?.nom,
    site?.statut,
    site?.siret && `SIRET ${site.siret}`,
    site?.adresse,
  ].filter(Boolean);

  const lancerVideo = () => {
    fermer();
    setVideo(true);
  };

  return (
    <>
      <button type="button" className="bouton-rond" onClick={() => setOuvert(true)} aria-label="Ouvrir le menu" aria-expanded={ouvert} aria-haspopup="dialog">
        <Icone nom="menu" />
      </button>

      <dialog
        ref={tiroir}
        className="tiroir"
        onClose={fermer}
        onClick={(e) => e.target === tiroir.current && fermer()}
        aria-label="Menu"
      >
        <div className="tiroir-contenu">
          <div className="tiroir-haut">
            <span>Menu</span>
            <button type="button" className="bouton-rond" onClick={fermer} aria-label="Fermer le menu"><Icone nom="fermer" taille={18} /></button>
          </div>

          <nav className="tiroir-liens">
            {telephone ? (
              <a className="tiroir-lien principal" href={`tel:${telephone}`} onClick={fermer}>
                <Icone nom="tel" /><span>Appeler Ludo<small>{site.telephone}</small></span>
              </a>
            ) : (
              <Link className="tiroir-lien principal" to="/contact" onClick={fermer}>
                <Icone nom="tel" /><span>Appeler Ludo</span>
              </Link>
            )}
            {site?.video && (
              <button type="button" className="tiroir-lien" onClick={lancerVideo}>
                <Icone nom="video" /><span>Vidéo de présentation</span>
              </button>
            )}
            <Link className="tiroir-lien" to="/" onClick={fermer}><Icone nom="maison" /><span>Les réalisations</span></Link>
            <Link className="tiroir-lien" to="/contact" onClick={fermer}><Icone nom="enveloppe" /><span>Écrire à Ludo</span></Link>
            <Link className="tiroir-lien" to="/mentions-legales" onClick={fermer}><Icone nom="info" /><span>Mentions légales</span></Link>
          </nav>

          <div className="tiroir-legal">
            <h2>Informations légales</h2>
            {legal.length > 0 ? legal.map((ligne) => <p key={ligne}>{ligne}</p>) : <p>À compléter dans l'espace Ludo.</p>}
            {site?.email && <p><a href={`mailto:${site.email}`}>{site.email}</a></p>}
            <p>Hébergement : o2switch, Clermont-Ferrand</p>
          </div>
        </div>
      </dialog>

      {site?.video && <FenetreVideo ouverte={video} onFermer={() => setVideo(false)} />}
    </>
  );
}
