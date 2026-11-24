import { Link } from 'react-router-dom';
import { useTitre } from '../format';

export default function Merci() {
  useTitre('Message envoyé');
  return (
    <main className="conteneur contact">
      <h1>Merci !</h1>
      <p className="intro">Votre message est bien parti. Ludo vous recontacte rapidement.</p>
      <Link className="bouton plein" to="/">Revenir aux réalisations</Link>
    </main>
  );
}
