import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Icone from '../components/Icone';
import { api } from '../api';
import { useDonnees } from '../donnees';
import { numeroInternational, useTitre } from '../format';

export default function Contact() {
  const { site } = useDonnees();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const article = params.get('article') || '';
  const [champs, setChamps] = useState({
    nom: '',
    coordonnees: '',
    message: article ? `Bonjour, je suis intéressé par « ${article} ».` : '',
    site_web: '',
  });
  const [envoi, setEnvoi] = useState({ enCours: false, erreur: '' });
  useTitre('Contact', site?.nom);

  const tel = site?.telephone ? numeroInternational(site.telephone) : '';
  const whatsapp = site?.whatsapp ? numeroInternational(site.whatsapp).replace('+', '') : '';
  const texteMessage = article ? `Bonjour, je suis intéressé par « ${article} ».` : '';
  const lienMessage = whatsapp
    ? `https://wa.me/${whatsapp}${texteMessage ? `?text=${encodeURIComponent(texteMessage)}` : ''}`
    : tel ? `sms:${tel}` : '';

  const changer = (e) => setChamps({ ...champs, [e.target.name]: e.target.value });

  const envoyer = async (e) => {
    e.preventDefault();
    setEnvoi({ enCours: true, erreur: '' });
    try {
      await api.contact({ ...champs, article });
      navigate('/merci');
    } catch (err) {
      setEnvoi({ enCours: false, erreur: err.message });
    }
  };

  return (
    <main className="conteneur contact">
      <Link className="bouton-rond" to="/" aria-label="Retour aux réalisations"><Icone nom="retour" /></Link>
      <div>
        <h1>Contacter Ludo</h1>
        <p className="intro">Une pièce vous plaît, ou vous avez un projet sur mesure ? Ludo vous répond directement.</p>
      </div>

      {(tel || lienMessage) && (
        <>
          <div className="actions">
            {tel && <a className="bouton plein" href={`tel:${tel}`}><Icone nom="tel" taille={18} />Appeler</a>}
            {lienMessage && (
              <a className="bouton contour" href={lienMessage}><Icone nom="message" taille={18} />{whatsapp ? 'WhatsApp' : 'SMS'}</a>
            )}
          </div>
          <div className="separateur">ou écrivez-lui</div>
        </>
      )}

      <form onSubmit={envoyer}>
        <p className="cache" aria-hidden="true">
          <label>Ne pas remplir <input name="site_web" tabIndex={-1} autoComplete="off" value={champs.site_web} onChange={changer} /></label>
        </p>
        <label>Votre nom
          <input type="text" name="nom" autoComplete="name" required value={champs.nom} onChange={changer} />
        </label>
        <label>Téléphone ou e-mail
          <input type="text" name="coordonnees" autoComplete="email" required value={champs.coordonnees} onChange={changer} />
        </label>
        <label>Votre message
          <textarea name="message" required value={champs.message} onChange={changer} />
        </label>
        {envoi.erreur && <p className="alerte" role="alert">{envoi.erreur}</p>}
        <button className="bouton sombre" type="submit" disabled={envoi.enCours}>
          {envoi.enCours ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>

      <p className="pied">
        {[site?.ville, site?.telephone].filter(Boolean).join(' · ')}
        {site?.facebook && <>{(site?.ville || site?.telephone) && ' · '}<a href={site.facebook} rel="noopener">Page Facebook</a></>}
      </p>
    </main>
  );
}
