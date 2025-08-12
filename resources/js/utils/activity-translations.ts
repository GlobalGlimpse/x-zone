// Types de sujets et leurs traductions
export const SUBJECT_TYPES = {
  'App\\Models\\User': 'Utilisateur',
  'App\\Models\\Product': 'Produit',
  'App\\Models\\Order': 'Commande',
  'App\\Models\\Category': 'Catégorie',
  'App\\Models\\Article': 'Article',
  'App\\Models\\Comment': 'Commentaire',
  'App\\Models\\Role': 'Rôle',
  'App\\Models\\Permission': 'Permission',
  'App\\Models\\Setting': 'Paramètre',
  'App\\Models\\File': 'Fichier',
  'App\\Models\\Invoice': 'Facture',
  'App\\Models\\Customer': 'Client',
  'App\\Models\\Project': 'Projet',
  'App\\Models\\Task': 'Tâche',
  'App\\Models\\Team': 'Équipe',
  'App\\Models\\Report': 'Rapport',
  'App\\Models\\Contact': 'Contact',
  'App\\Models\\Ticket': 'Ticket',
  'App\\Models\\Page': 'Page',
  'App\\Models\\Event': 'Événement',
  'User': 'Utilisateur',
  'Product': 'Produit',
  'Order': 'Commande',
  'Category': 'Catégorie',
  'Article': 'Article',
  'Comment': 'Commentaire',
  'Role': 'Rôle',
  'Permission': 'Permission',
  'Setting': 'Paramètre',
  'File': 'Fichier',
  'Invoice': 'Facture',
  'Customer': 'Client',
  'Project': 'Projet',
  'Task': 'Tâche',
  'Team': 'Équipe',
  'Report': 'Rapport',
  'Contact': 'Contact',
  'Ticket': 'Ticket',
  'Page': 'Page',
  'Event': 'Événement',
} as const;

// Actions et leurs traductions bidirectionnelles
export const ACTION_TRANSLATIONS = {
  // Anglais -> Français
  'created': 'créé',
  'updated': 'modifié',
  'deleted': 'supprimé',
  'restored': 'restauré',
  'viewed': 'consulté',
  'accessed': 'accédé',
  'logged in': 'connecté',
  'logged out': 'déconnecté',
  'registered': 'inscrit',
  'activated': 'activé',
  'deactivated': 'désactivé',
  'suspended': 'suspendu',
  'banned': 'banni',
  'verified': 'vérifié',
  'published': 'publié',
  'unpublished': 'dépublié',
  'approved': 'approuvé',
  'rejected': 'rejeté',
  'archived': 'archivé',
  'uploaded': 'téléchargé',
  'downloaded': 'téléchargé',
  'moved': 'déplacé',
  'copied': 'copié',
  'renamed': 'renommé',
  'ordered': 'commandé',
  'shipped': 'expédié',
  'delivered': 'livré',
  'cancelled': 'annulé',
  'refunded': 'remboursé',
  'paid': 'payé',
  'sent': 'envoyé',
  'received': 'reçu',
  'shared': 'partagé',
  'assigned': 'assigné',
  'completed': 'terminé',
  'failed': 'échoué',
  'closed': 'fermé',
  'reopened': 'rouvert',

  // Français -> Anglais (pour la recherche inverse)
  'créé': 'created',
  'modifié': 'updated',
  'supprimé': 'deleted',
  'restauré': 'restored',
  'consulté': 'viewed',
  'accédé': 'accessed',
  'connecté': 'logged in',
  'déconnecté': 'logged out',
  'inscrit': 'registered',
  'activé': 'activated',
  'désactivé': 'deactivated',
  'suspendu': 'suspended',
  'banni': 'banned',
  'vérifié': 'verified',
  'publié': 'published',
  'dépublié': 'unpublished',
  'approuvé': 'approved',
  'rejeté': 'rejected',
  'archivé': 'archived',
  'téléchargé': 'uploaded',
  'déplacé': 'moved',
  'copié': 'copied',
  'renommé': 'renamed',
  'commandé': 'ordered',
  'expédié': 'shipped',
  'livré': 'delivered',
  'annulé': 'cancelled',
  'remboursé': 'refunded',
  'payé': 'paid',
  'envoyé': 'sent',
  'reçu': 'received',
  'partagé': 'shared',
  'assigné': 'assigned',
  'terminé': 'completed',
  'échoué': 'failed',
  'fermé': 'closed',
  'rouvert': 'reopened',
} as const;

// Fonction pour obtenir le nom du type de sujet
export function getSubjectTypeName(subjectType: string): string {
  return SUBJECT_TYPES[subjectType as keyof typeof SUBJECT_TYPES] ||
         subjectType.split('\\').pop() ||
         subjectType;
}

// Fonction pour traduire une description d'action
export function translateActionDescription(description: string, subjectType: string): string {
  const subjectName = getSubjectTypeName(subjectType);

  // Extraire l'action de la description
  const lowerDesc = description.toLowerCase();

  // Chercher une traduction directe
  for (const [key, value] of Object.entries(ACTION_TRANSLATIONS)) {
    if (lowerDesc.includes(key.toLowerCase())) {
      return `${subjectName} ${value}`;
    }
  }

  // Si pas de traduction trouvée, utiliser la description originale
  return `${subjectName} - ${description}`;
}

// Fonction intelligente pour la recherche bilingue
export function createBilingualSearchTerms(searchTerm: string): string[] {
  const terms = [searchTerm.toLowerCase()];

  // Ajouter les traductions dans les deux sens
  for (const [key, value] of Object.entries(ACTION_TRANSLATIONS)) {
    if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
      terms.push(value);
    }
    if (value.toLowerCase().includes(searchTerm.toLowerCase())) {
      terms.push(key);
    }
  }

  // Ajouter les traductions de sujets
  for (const [key, value] of Object.entries(SUBJECT_TYPES)) {
    if (key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase())) {
      terms.push(key);
      terms.push(value);
    }
  }

  return [...new Set(terms)]; // Enlever les doublons
}

// Fonction pour obtenir la couleur selon le type d'action
export function getActionColor(description: string): string {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('créé') || lowerDesc.includes('created') ||
      lowerDesc.includes('ajouté') || lowerDesc.includes('added')) {
    return 'text-emerald-600 dark:text-emerald-400';
  }

  if (lowerDesc.includes('modifié') || lowerDesc.includes('updated') ||
      lowerDesc.includes('mis à jour') || lowerDesc.includes('changed')) {
    return 'text-blue-600 dark:text-blue-400';
  }

  if (lowerDesc.includes('supprimé') || lowerDesc.includes('deleted') ||
      lowerDesc.includes('retiré') || lowerDesc.includes('removed')) {
    return 'text-red-600 dark:text-red-400';
  }

  if (lowerDesc.includes('connecté') || lowerDesc.includes('logged') ||
      lowerDesc.includes('accédé') || lowerDesc.includes('accessed')) {
    return 'text-purple-600 dark:text-purple-400';
  }

  if (lowerDesc.includes('approuvé') || lowerDesc.includes('approved') ||
      lowerDesc.includes('validé') || lowerDesc.includes('validated')) {
    return 'text-teal-600 dark:text-teal-400';
  }

  if (lowerDesc.includes('rejeté') || lowerDesc.includes('rejected') ||
      lowerDesc.includes('annulé') || lowerDesc.includes('cancelled')) {
    return 'text-orange-600 dark:text-orange-400';
  }

  return 'text-slate-600 dark:text-slate-300';
}

// Fonction pour obtenir l'icône selon le type d'action
export function getActionIcon(description: string): string {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('créé') || lowerDesc.includes('created') ||
      lowerDesc.includes('ajouté') || lowerDesc.includes('added')) {
    return 'Plus';
  }

  if (lowerDesc.includes('modifié') || lowerDesc.includes('updated') ||
      lowerDesc.includes('mis à jour') || lowerDesc.includes('changed')) {
    return 'Edit';
  }

  if (lowerDesc.includes('supprimé') || lowerDesc.includes('deleted') ||
      lowerDesc.includes('retiré') || lowerDesc.includes('removed')) {
    return 'Trash2';
  }

  if (lowerDesc.includes('connecté') || lowerDesc.includes('logged in')) {
    return 'LogIn';
  }

  if (lowerDesc.includes('déconnecté') || lowerDesc.includes('logged out')) {
    return 'LogOut';
  }

  if (lowerDesc.includes('consulté') || lowerDesc.includes('viewed') ||
      lowerDesc.includes('vu')) {
    return 'Eye';
  }

  if (lowerDesc.includes('envoyé') || lowerDesc.includes('sent') ||
      lowerDesc.includes('expédié')) {
    return 'Send';
  }

  if (lowerDesc.includes('téléchargé') || lowerDesc.includes('downloaded') ||
      lowerDesc.includes('uploaded')) {
    return 'Download';
  }

  if (lowerDesc.includes('approuvé') || lowerDesc.includes('approved') ||
      lowerDesc.includes('validé')) {
    return 'Check';
  }

  if (lowerDesc.includes('rejeté') || lowerDesc.includes('rejected') ||
      lowerDesc.includes('annulé')) {
    return 'X';
  }

  return 'Activity';
}
