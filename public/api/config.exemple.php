<?php
// Copier ce fichier sous le nom config.php (dans le même dossier api/),
// puis remplacer les valeurs ci-dessous. config.php n'est jamais lisible
// depuis le navigateur : le serveur l'exécute sans afficher son contenu.
return [
    // Mot de passe de l'espace /admin de Ludo (12 caractères minimum conseillés).
    'mot_de_passe' => 'CHANGER-CE-MOT-DE-PASSE',

    // Adresse qui reçoit les messages du formulaire de contact.
    'email_contact' => 'ludo@example.com',

    // Adresse d'expédition : une adresse du domaine hébergé chez O2switch,
    // par exemple contact@ludoboisplanche.fr, sinon les messages finissent en spam.
    'email_expediteur' => 'site@example.com',
];
