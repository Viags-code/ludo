import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { FournisseurDonnees } from './donnees';
import Accueil from './pages/Accueil';
import Fiche from './pages/Fiche';
import Contact from './pages/Contact';
import Merci from './pages/Merci';
import Introuvable from './pages/Introuvable';
import Admin from './pages/admin/Admin';
import './styles.css';

// Revient en haut de la page à chaque changement d'adresse.
function HautDePage() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurDonnees>
        <HautDePage />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/articles/:id" element={<Fiche />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/merci" element={<Merci />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </FournisseurDonnees>
    </BrowserRouter>
  </StrictMode>
);
