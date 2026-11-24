import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useDonnees } from '../../donnees';
import Icone from '../../components/Icone';

const champsSite = [
  { nom: 'nom', label: 'Nom affiché' },
  { nom: 'metier', label: 'Métier' },
  { nom: 'ville', label: 'Ville' },
  { nom: 'telephone', label: 'Téléphone', aide: 'Fait apparaître le bouton « Appeler »', type: 'tel' },
  { nom: 'whatsapp', label: 'Numéro WhatsApp', aide: 'Laisser vide si pas de WhatsApp : le bouton proposera un SMS', type: 'tel' },
  { nom: 'facebook', label: 'Lien de la page Facebook', type: 'url' },
  { nom: 'video', label: 'Vidéo de présentation (lien Facebook)', aide: 'Lien d’un reel ou d’une vidéo Facebook publique, lancée par le bouton de l’en-tête. Laisser vide pour cacher le bouton.', type: 'url' },
  { nom: 'presentation', label: 'Présentation courte', aide: 'Une phrase, reprise par Google et les réseaux sociaux', long: true },
];

export default function Coordonnees() {
  const { site, recharger } = useDonnees();
  const navigate = useNavigate();
  const [valeurs, setValeurs] = useState(null);
  const [etat, setEtat] = useState({ enCours: false, erreur: '' });

  useEffect(() => {
    if (site && !valeurs) setValeurs(site);
  }, [site, valeurs]);

  if (!valeurs) return <p className="vide">Chargement…</p>;

  const changer = (e) => setValeurs({ ...valeurs, [e.target.name]: e.target.value });

  const enregistrer = async (e) => {
    e.preventDefault();
    setEtat({ enCours: true, erreur: '' });
    try {
      await api.enregistrerSite(valeurs);
      await recharger();
      navigate('/admin');
    } catch (err) {
      setEtat({ enCours: false, erreur: err.message });
    }
  };

  return (
    <>
      <header className="barre-admin">
        <Link className="bouton-rond" to="/admin" aria-label="Fermer sans enregistrer"><Icone nom="fermer" taille={18} /></Link>
        <span>Mes coordonnées</span>
        <span className="espace-44" />
      </header>
      <main className="conteneur editeur page">
        <form id="coordonnees" onSubmit={enregistrer}>
          {champsSite.map((c) => (
            <label key={c.nom}>
              {c.label} {c.aide && <span className="aide">{c.aide}</span>}
              {c.long ? (
                <textarea name={c.nom} rows={3} maxLength={300} value={valeurs[c.nom] ?? ''} onChange={changer} />
              ) : (
                <input name={c.nom} type={c.type || 'text'} maxLength={120} value={valeurs[c.nom] ?? ''} onChange={changer} />
              )}
            </label>
          ))}
          {etat.erreur && <p className="alerte" role="alert">{etat.erreur}</p>}
        </form>
      </main>
      <div className="barre-bas">
        <div className="conteneur">
          <button className="bouton plein" type="submit" form="coordonnees" disabled={etat.enCours}>
            {etat.enCours ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </>
  );
}
