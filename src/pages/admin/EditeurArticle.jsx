import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { useDonnees } from '../../donnees';
import Icone from '../../components/Icone';
import { apercuDeVideo, reduirePhoto } from './reduirePhoto';
import { apercuVideo, estVideo } from '../../media';

const TAILLE_MAX_VIDEO = 200 * 1024 * 1024;

const vide = { titre: '', prix: '', vendu: false, bois: '', dimensions: '', description: '' };
let compteur = 0;

// Formulaire d'ajout ou de modification d'une réalisation.
export default function EditeurArticle() {
  const { id } = useParams();
  const { articles, recharger } = useDonnees();
  const navigate = useNavigate();
  const existant = id ? articles?.find((a) => a.id === id) : null;

  const [champs, setChamps] = useState(vide);
  // Chaque photo : { cle, url } pour une photo déjà en ligne, { cle, fichier, apercu } pour une nouvelle.
  const [photos, setPhotos] = useState([]);
  const [etat, setEtat] = useState({ enCours: false, erreur: '' });
  const [progression, setProgression] = useState(null);
  const [pret, setPret] = useState(!id);
  const choixPhotos = useRef(null);

  useEffect(() => {
    if (existant && !pret) {
      setChamps({
        titre: existant.titre,
        prix: existant.prix ?? '',
        vendu: existant.vendu,
        bois: existant.bois || '',
        dimensions: existant.dimensions || '',
        description: existant.description || '',
      });
      setPhotos(existant.photos.map((url) => ({ cle: url, url, video: estVideo(url) })));
      setPret(true);
    }
  }, [existant, pret]);

  // Libère les aperçus en mémoire quand on quitte la page.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => {
    photosRef.current.forEach((p) => {
      if (p.apercu) URL.revokeObjectURL(p.apercu);
      if (p.imageApercu) URL.revokeObjectURL(p.imageApercu);
    });
  }, []);

  if (id && articles === null) return <p className="vide">Chargement…</p>;
  if (id && !existant) return <main className="conteneur contact"><p className="vide">Cette réalisation n'existe plus.</p><Link className="bouton plein" to="/admin">Retour</Link></main>;

  const changer = (e) => {
    const { name, type, checked, value } = e.target;
    setChamps({ ...champs, [name]: type === 'checkbox' ? checked : value });
  };

  const ajouterPhotos = (e) => {
    const fichiers = [...e.target.files];
    e.target.value = '';
    const tropLourdes = fichiers.filter((f) => f.type.startsWith('video/') && f.size > TAILLE_MAX_VIDEO);
    setEtat((et) => ({ ...et, erreur: tropLourdes.length ? 'Une vidéo dépasse 200 Mo : raccourcissez-la ou filmez en qualité 1080p.' : '' }));

    const nouvelles = fichiers
      .filter((f) => !tropLourdes.includes(f))
      .map((fichier) => {
        const element = { cle: `n${compteur++}`, fichier, apercu: URL.createObjectURL(fichier), video: fichier.type.startsWith('video/') };
        if (element.video) {
          // L'aperçu se fabrique en arrière-plan ; on l'attend au moment de publier.
          element.apercuPret = apercuDeVideo(fichier).then((image) => {
            setPhotos((liste) => liste.map((p) => (p.cle === element.cle
              ? { ...p, imageApercu: image ? URL.createObjectURL(image) : null, illisible: !image }
              : p)));
            return image;
          });
        }
        return element;
      });
    setPhotos((p) => [...p, ...nouvelles].slice(0, 12));
  };

  const deplacer = (index, sens) => {
    const copie = [...photos];
    const cible = index + sens;
    if (cible < 0 || cible >= copie.length) return;
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    setPhotos(copie);
  };

  const retirer = (index) => {
    const p = photos[index];
    if (p.apercu) URL.revokeObjectURL(p.apercu);
    if (p.imageApercu) URL.revokeObjectURL(p.imageApercu);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const publier = async (e) => {
    e.preventDefault();
    setEtat({ enCours: true, erreur: '' });
    try {
      const formulaire = new FormData();
      if (id) formulaire.append('id', id);
      formulaire.append('titre', champs.titre);
      formulaire.append('prix', String(champs.prix));
      formulaire.append('vendu', champs.vendu ? 'oui' : 'non');
      formulaire.append('bois', champs.bois);
      formulaire.append('dimensions', champs.dimensions);
      formulaire.append('description', champs.description);
      formulaire.append('photos', JSON.stringify(photos.filter((p) => p.url).map((p) => p.url)));
      let n = 0;
      const ordre = [];
      for (const p of photos) {
        if (p.url) ordre.push(p.url);
        else if (p.video) {
          formulaire.append('nouvelles[]', p.fichier);
          const image = await p.apercuPret;
          if (image) formulaire.append(`apercu_${n}`, image);
          ordre.push(`nouvelle:${n++}`);
        } else {
          formulaire.append('nouvelles[]', await reduirePhoto(p.fichier));
          ordre.push(`nouvelle:${n++}`);
        }
      }
      formulaire.append('ordre', JSON.stringify(ordre));
      setProgression(0);
      await api.enregistrerArticle(formulaire, setProgression);
      await recharger();
      navigate('/admin');
    } catch (err) {
      setProgression(null);
      setEtat({ enCours: false, erreur: err.message });
    }
  };

  const supprimer = async () => {
    if (!window.confirm(`Supprimer « ${existant.titre} » du site ?`)) return;
    setEtat({ enCours: true, erreur: '' });
    try {
      await api.supprimerArticle(id);
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
        <span>{id ? 'Modifier' : 'Nouvelle réalisation'}</span>
        <span className="espace-44" />
      </header>

      <main className="conteneur editeur page">
        <form id="editeur" onSubmit={publier}>
          <fieldset className="champ-photos">
            <legend>Photos et vidéos</legend>
            <div className="grille-photos">
              {photos.map((p, i) => (
                <div className="photo-editee" key={p.cle}>
                  {!p.video && <img src={p.url || p.apercu} alt={`Photo ${i + 1}`} />}
                  {p.video && p.url && <img src={apercuVideo(p.url)} alt={`Vidéo ${i + 1}`} />}
                  {p.video && !p.url && (p.imageApercu
                    ? <img src={p.imageApercu} alt={`Vidéo ${i + 1}`} />
                    : <video src={p.apercu} muted playsInline preload="metadata" aria-label={`Vidéo ${i + 1}`} />)}
                  {i === 0 && <span className="etiquette">Vignette</span>}
                  {p.video && <span className="etiquette video">Vidéo</span>}
                  {p.illisible && <span className="avertissement-video">Format peu compatible</span>}
                  <div className="outils-photo">
                    <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label={`Avancer l’élément ${i + 1}`}><Icone nom="gauche" taille={16} /></button>
                    <button type="button" onClick={() => retirer(i)} aria-label={`Retirer l’élément ${i + 1}`}><Icone nom="fermer" taille={16} /></button>
                    <button type="button" onClick={() => deplacer(i, 1)} disabled={i === photos.length - 1} aria-label={`Reculer l’élément ${i + 1}`}><Icone nom="droite" taille={16} /></button>
                  </div>
                </div>
              ))}
              {photos.length < 12 && (
                <button type="button" className="ajout-photo" onClick={() => choixPhotos.current?.click()}>
                  <Icone nom="appareil" taille={24} />Ajouter
                </button>
              )}
            </div>
            <input ref={choixPhotos} type="file" accept="image/*,video/*" multiple hidden onChange={ajouterPhotos} />
            <span className="aide">Prendre une photo ou une vidéo, ou choisir dans la galerie. La première sert de vignette (mettez plutôt une photo en premier). Vidéos : 200 Mo maximum, de préférence courtes.</span>
            {photos.some((p) => p.illisible) && (
              <p className="alerte">Une vidéo n'a pas pu être lue par ce navigateur : elle risque de ne pas s'afficher chez tous les visiteurs. Sur le téléphone, désactivez « Vidéos haute efficacité (HEVC) » dans les réglages de l'appareil photo, puis refilmez.</p>
            )}
          </fieldset>

          <label>Titre
            <input name="titre" required maxLength={120} value={champs.titre} onChange={changer} placeholder="Ex. : Table basse en chêne" />
          </label>
          <label>Prix en euros <span className="aide">Laisser vide pour afficher « Sur devis »</span>
            <input name="prix" type="number" inputMode="numeric" min="0" step="1" value={champs.prix} onChange={changer} />
          </label>
          <label>Bois <span className="aide">Facultatif</span>
            <input name="bois" maxLength={80} value={champs.bois} onChange={changer} placeholder="Ex. : chêne massif" />
          </label>
          <label>Dimensions <span className="aide">Facultatif</span>
            <input name="dimensions" maxLength={80} value={champs.dimensions} onChange={changer} placeholder="Ex. : 120 × 60 × 45 cm" />
          </label>
          <label>Description
            <textarea name="description" maxLength={5000} value={champs.description} onChange={changer} rows={6} />
          </label>
          <label className="case">
            <input type="checkbox" name="vendu" checked={champs.vendu} onChange={changer} />
            Déjà vendu
          </label>

          {etat.erreur && <p className="alerte" role="alert">{etat.erreur}</p>}
          {id && (
            <button type="button" className="bouton danger" onClick={supprimer} disabled={etat.enCours}>Supprimer cette réalisation</button>
          )}
        </form>
      </main>

      <div className="barre-bas">
        <div className="conteneur">
          <button className="bouton plein" type="submit" form="editeur" disabled={etat.enCours}>
            {etat.enCours ? (progression !== null && progression < 100 ? `Envoi… ${progression} %` : 'Publication…') : id ? 'Enregistrer' : 'Publier'}
          </button>
        </div>
      </div>
    </>
  );
}
