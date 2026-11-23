export function formatPrix(prix?: number): string {
  if (prix === undefined || prix === null) return 'Sur devis';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prix);
}

// Numéro français « 06 12 34 56 78 » → « +33612345678 »
export function numeroInternational(numero: string): string {
  const chiffres = numero.replace(/[^\d+]/g, '');
  if (chiffres.startsWith('+')) return chiffres;
  if (chiffres.startsWith('0')) return '+33' + chiffres.slice(1);
  return chiffres;
}

const teintes = ['#B98A5E', '#8C6239', '#C9A27A', '#6E4A2B', '#A67C52', '#D2B48C'];
export function teinte(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return teintes[h % teintes.length];
}
