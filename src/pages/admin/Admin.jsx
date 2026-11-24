import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { api } from '../../api';
import { useDonnees } from '../../donnees';
import { formatPrix, useTitre } from '../../format';
import Photo from '../../components/Photo';
import Icone from '../../components/Icone';
import EditeurArticle from './EditeurArticle';
import Coordonnees from './Coordonnees';

// Espace de Ludo : connexion par mot de passe, puis gestion des articles.
export default function Admin() {
  const [etat, setEtat] = useState({ verifie: false, connecte: false });
  useTitre('Espace Ludo');

  useEffect(() => {
    api.session()
      .then((s) => setEtat({ verifie: true, connecte: s.connecte }))
      .catch(() => setEtat({ verifie: true, connecte: false }));
  }, []);

  if (!etat.verifie) return <p className="vide">Chargement…</p>;
  if (!etat.connecte) return <Connexion onConnecte={() => setEtat({ verifie: true, connecte: true })} />;

  const deconnecter = async () => {
    await api.deconnexion().catch(() => {});
    setEtat({ verifie: true, connecte: false });
  };

  return (
    <Routes>
      <Route index element={<ListeArticles onDeconnexion={deconnecter} />} />
      <Route path="nouveau" element={<EditeurArticle />} />
      <Route path="article/:id" element={<EditeurArticle />} />
      <Route path="coordonnees" element={<Coordonnees />} />
    </Routes>
  );
}

function Connexion({ onConnecte }) {
  const [motDePasse, setMotDePasse] = useState('');
  const [etat, setEtat] = useState({ enCours: false, erreur: '' });

  const valider = async (e) => {
    e.preventDefault();
    setEtat({ enCours: true, erreur: '' });
    try {
      await api.connexion(motDePasse);
      onConnecte();
    } catch (err) {
      setEtat({ enCours: false, erreur: err.message });
    }
  };

  return (
    <main className="conteneur contact">
      <div>
        <h1>Espace Ludo</h1>
        <p className="intro">Pour ajouter et modifier les réalisations du site.</p>
      </div>
      <form onSubmit={valider}>
        <label>Mot de passe
          <input type="password" autoComplete="current-password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
        </label>
        {etat.erreur && <p className="alerte" role="alert">{etat.erreur}</p>}
        <button className="bouton plein" type="submit" disabled={etat.enCours}>{etat.enCours ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <Link className="pied" to="/">Retour au site</Link>
    </main>
  );
}

function ListeArticles({ onDeconnexion }) {
  const { articles, erreur } = useDonnees();

  return (
    <>
      <main className="page">
        <div className="conteneur">
          <header className="entete">
            <div>
              <span className="nom">Espace Ludo</span>
              <span className="sous-titre">{articles ? `${articles.length} réalisation${articles.length > 1 ? 's' : ''}` : 'Chargement…'}</span>
            </div>
            <button className="lien-discret" type="button" onClick={onDeconnexion}>Se déconnecter</button>
          </header>

          <nav className="liens-admin">
            <Link to="/">Voir le site</Link>
            <Link to="/admin/coordonnees">Mes coordonnées</Link>
          </nav>

          {erreur && <p className="alerte">{erreur}</p>}
          {articles?.length === 0 && <p className="vide">Aucune réalisation pour l'instant. Appuyez sur « Ajouter » pour publier la première.</p>}

          <ul className="liste-admin">
            {articles?.map((a) => (
              <li key={a.id}>
                <Link to={`/admin/article/${a.id}`}>
                  <span className="mini"><Photo src={a.photos[0]} alt="" graine={a.id} /></span>
                  <span className="liste-texte">
                    <strong>{a.titre}</strong>
                    <span>{formatPrix(a.prix)}{a.vendu ? ' · Vendu' : ''}</span>
                  </span>
                  <Icone nom="droite" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <div className="barre-bas">
        <div className="conteneur">
          <Link className="bouton plein" to="/admin/nouveau"><Icone nom="plus" />Ajouter une réalisation</Link>
        </div>
      </div>
    </>
  );
}
