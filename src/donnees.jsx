import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

// Articles et coordonnées chargés une fois et partagés par toutes les pages.
const Contexte = createContext(null);

export function FournisseurDonnees({ children }) {
  const [articles, setArticles] = useState(null);
  const [site, setSite] = useState(null);
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([api.articles(), api.site()]);
      setArticles(a);
      setSite(s);
      setErreur('');
    } catch (e) {
      setErreur(e.message);
      setArticles((a) => a ?? []);
      setSite((s) => s ?? { nom: 'Ludo Bois Planche', metier: 'Menuisier', ville: '' });
    }
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  return <Contexte.Provider value={{ articles, site, erreur, recharger }}>{children}</Contexte.Provider>;
}

export const useDonnees = () => useContext(Contexte);
