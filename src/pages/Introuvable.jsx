import { Link } from 'react-router-dom';
import { useTitre } from '../format';

export default function Introuvable() {
  useTitre('Page introuvable');
  return (
    <main className="conteneur contact">
      <h1>Page introuvable</h1>
      <p className="intro">Cette réalisation a peut-être été retirée.</p>
      <Link className="bouton plein" to="/">Voir les réalisations</Link>
    </main>
  );
}
