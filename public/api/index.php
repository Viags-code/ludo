<?php
// API du site de Ludo : lit et enregistre les articles, les coordonnées,
// gère la connexion à l'espace /admin et le formulaire de contact.
// Les données sont dans api/donnees/ (JSON), les photos dans /uploads/.

declare(strict_types=1);

const DOSSIER_DONNEES = __DIR__ . '/donnees';
const DOSSIER_PHOTOS = __DIR__ . '/../uploads';
const URL_PHOTOS = '/uploads';
const TAILLE_MAX_PHOTO = 15 * 1024 * 1024;
const COTE_MAX_PHOTO = 1600;
const MAX_PHOTOS = 12;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$configFichier = __DIR__ . '/config.php';
$config = is_file($configFichier) ? require $configFichier : [];

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_name('ludo_admin');
session_start();

function repondre(array $donnees, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function erreur(string $message, int $code = 400): never
{
    repondre(['erreur' => $message], $code);
}

function lireJson(string $nom, mixed $defaut): mixed
{
    $chemin = DOSSIER_DONNEES . "/$nom.json";
    if (!is_file($chemin)) return $defaut;
    $contenu = json_decode((string) file_get_contents($chemin), true);
    return $contenu ?? $defaut;
}

function ecrireJson(string $nom, mixed $donnees): void
{
    if (!is_dir(DOSSIER_DONNEES)) mkdir(DOSSIER_DONNEES, 0755, true);
    $chemin = DOSSIER_DONNEES . "/$nom.json";
    $temp = $chemin . '.tmp';
    file_put_contents($temp, json_encode($donnees, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    rename($temp, $chemin);
}

// Verrou global pour que deux enregistrements ne s'écrasent pas.
function verrouiller()
{
    if (!is_dir(DOSSIER_DONNEES)) mkdir(DOSSIER_DONNEES, 0755, true);
    $verrou = fopen(DOSSIER_DONNEES . '/.verrou', 'c');
    flock($verrou, LOCK_EX);
    return $verrou;
}

function siteParDefaut(): array
{
    return [
        'nom' => 'Ludo Bois Planche',
        'metier' => 'Menuisier',
        'ville' => '',
        'telephone' => '',
        'whatsapp' => '',
        'facebook' => 'https://www.facebook.com/LUDOBOISPLANCHE/',
        // Afficher le bouton qui lance la vidéo /video/atelier.mp4
        'video' => true,
        'presentation' => 'Meubles et créations en bois, pièces uniques et sur mesure.',
        // Informations légales (menu et page Mentions légales)
        'entreprise' => '',
        'statut' => '',
        'siret' => '',
        'adresse' => '',
        'email' => '',
    ];
}

function corpsJson(): array
{
    $donnees = json_decode((string) file_get_contents('php://input'), true);
    return is_array($donnees) ? $donnees : [];
}

function texte(mixed $valeur, int $max): string
{
    $valeur = trim(is_string($valeur) ? $valeur : '');
    return mb_substr($valeur, 0, $max);
}

function exigerAdmin(): void
{
    if (empty($_SESSION['admin'])) erreur('Connexion nécessaire.', 401);
}

// Protection contre les requêtes envoyées depuis un autre site.
function exigerRequeteDuSite(): void
{
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'ludo') erreur('Requête refusée.', 403);
}

function slug(string $texte): string
{
    $texte = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texte) ?: '';
    $texte = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $texte) ?? '', '-'));
    return substr($texte ?: 'article', 0, 60);
}

// Vérifie, redimensionne et réenregistre une photo envoyée (retire aussi les données GPS).
function enregistrerPhoto(array $fichier, string $prefixe): string
{
    if ($fichier['error'] !== UPLOAD_ERR_OK) erreur("Une photo n'a pas pu être envoyée.");
    if ($fichier['size'] > TAILLE_MAX_PHOTO) erreur('Une photo est trop lourde (15 Mo maximum).');
    $infos = @getimagesize($fichier['tmp_name']);
    if (!$infos || !in_array($infos[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
        erreur('Format de photo non reconnu (JPEG, PNG ou WebP).');
    }
    $image = @imagecreatefromstring((string) file_get_contents($fichier['tmp_name']));
    if (!$image) erreur('Photo illisible.');

    $largeur = imagesx($image);
    $hauteur = imagesy($image);
    $ratio = min(1, COTE_MAX_PHOTO / max($largeur, $hauteur));
    if ($ratio < 1) {
        $image = imagescale($image, (int) round($largeur * $ratio), (int) round($hauteur * $ratio));
    }

    if (!is_dir(DOSSIER_PHOTOS)) {
        mkdir(DOSSIER_PHOTOS, 0755, true);
        // Aucun script ne doit pouvoir s'exécuter depuis le dossier des photos.
        file_put_contents(DOSSIER_PHOTOS . '/.htaccess', "<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi)$\">\n  Require all denied\n</FilesMatch>\nOptions -Indexes\n");
    }
    $nom = $prefixe . '-' . bin2hex(random_bytes(4)) . '.jpg';
    imageinterlace($image, true);
    imagejpeg($image, DOSSIER_PHOTOS . '/' . $nom, 82);
    return URL_PHOTOS . '/' . $nom;
}

function supprimerPhoto(string $url): void
{
    $nom = basename($url);
    if (str_starts_with($url, URL_PHOTOS . '/') && preg_match('/^[a-z0-9-]+\.jpg$/', $nom)) {
        @unlink(DOSSIER_PHOTOS . '/' . $nom);
    }
}

$action = $_GET['action'] ?? '';
$methode = $_SERVER['REQUEST_METHOD'];

if ($methode === 'GET') {
    switch ($action) {
        case 'articles':
            $articles = lireJson('articles', []);
            usort($articles, fn($a, $b) => strcmp($b['date'], $a['date']));
            repondre(['articles' => $articles]);
        case 'site':
            repondre(['site' => array_merge(siteParDefaut(), lireJson('site', []))]);
        case 'session':
            repondre(['connecte' => !empty($_SESSION['admin']), 'configure' => !empty($config['mot_de_passe'])]);
    }
    erreur('Action inconnue.', 404);
}

if ($methode !== 'POST') erreur('Méthode non autorisée.', 405);
exigerRequeteDuSite();

switch ($action) {
    case 'connexion': {
        $motDePasse = (string) ($config['mot_de_passe'] ?? '');
        if ($motDePasse === '' || $motDePasse === 'CHANGER-CE-MOT-DE-PASSE') {
            erreur("Le mot de passe n'est pas encore configuré (fichier api/config.php).", 503);
        }
        // Limite les essais : 10 échecs bloquent 15 minutes.
        $verrou = verrouiller();
        $essais = lireJson('essais', ['nombre' => 0, 'depuis' => time()]);
        if (time() - $essais['depuis'] > 900) $essais = ['nombre' => 0, 'depuis' => time()];
        if ($essais['nombre'] >= 10) erreur('Trop d\'essais. Réessayez dans 15 minutes.', 429);
        $saisi = (string) (corpsJson()['mot_de_passe'] ?? '');
        if (!hash_equals($motDePasse, $saisi)) {
            $essais['nombre']++;
            ecrireJson('essais', $essais);
            sleep(1);
            erreur('Mot de passe incorrect.', 401);
        }
        ecrireJson('essais', ['nombre' => 0, 'depuis' => time()]);
        flock($verrou, LOCK_UN);
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        repondre(['connecte' => true]);
    }

    case 'deconnexion':
        $_SESSION = [];
        session_destroy();
        repondre(['connecte' => false]);

    case 'article': {
        exigerAdmin();
        $verrou = verrouiller();
        $articles = lireJson('articles', []);
        $id = texte($_POST['id'] ?? '', 80);
        $titre = texte($_POST['titre'] ?? '', 120);
        if ($titre === '') erreur('Le titre est obligatoire.');

        $index = null;
        foreach ($articles as $i => $a) if ($a['id'] === $id) $index = $i;
        $ancien = $index !== null ? $articles[$index] : null;
        if ($id !== '' && $ancien === null) erreur('Article introuvable.', 404);

        // Photos gardées (dans l'ordre choisi) + nouvelles photos envoyées.
        $gardees = json_decode((string) ($_POST['photos'] ?? '[]'), true) ?: [];
        $anciennes = $ancien['photos'] ?? [];
        $gardees = array_values(array_filter($gardees, fn($p) => is_string($p) && in_array($p, $anciennes, true)));

        $nouveauId = $id ?: slug($titre) . '-' . bin2hex(random_bytes(2));
        $envoyees = [];
        if (!empty($_FILES['nouvelles']['name'])) {
            $f = $_FILES['nouvelles'];
            $nombre = is_array($f['name']) ? count($f['name']) : 0;
            if (count($gardees) + $nombre > MAX_PHOTOS) erreur('12 photos maximum par article.');
            for ($i = 0; $i < $nombre; $i++) {
                $envoyees[$i] = enregistrerPhoto([
                    'error' => $f['error'][$i], 'size' => $f['size'][$i], 'tmp_name' => $f['tmp_name'][$i],
                ], $nouveauId);
            }
        }
        // « ordre » mélange anciennes photos (url) et nouvelles (« nouvelle:N »).
        $ordre = json_decode((string) ($_POST['ordre'] ?? '[]'), true) ?: [];
        $photos = [];
        foreach ($ordre as $element) {
            if (is_string($element) && str_starts_with($element, 'nouvelle:')) {
                $n = (int) substr($element, 9);
                if (isset($envoyees[$n])) $photos[] = $envoyees[$n];
            } elseif (in_array($element, $gardees, true)) {
                $photos[] = $element;
            }
        }
        foreach (array_merge($gardees, $envoyees) as $p) if (!in_array($p, $photos, true)) $photos[] = $p;
        foreach ($anciennes as $p) if (!in_array($p, $photos, true)) supprimerPhoto($p);

        $prix = trim((string) ($_POST['prix'] ?? ''));
        $article = [
            'id' => $nouveauId,
            'titre' => $titre,
            'prix' => $prix === '' ? null : max(0, (int) $prix),
            'vendu' => ($_POST['vendu'] ?? '') === 'oui',
            'bois' => texte($_POST['bois'] ?? '', 80),
            'dimensions' => texte($_POST['dimensions'] ?? '', 80),
            'description' => texte($_POST['description'] ?? '', 5000),
            'photos' => $photos,
            'date' => $ancien['date'] ?? date('c'),
        ];
        if ($index !== null) $articles[$index] = $article; else $articles[] = $article;
        ecrireJson('articles', $articles);
        repondre(['article' => $article]);
    }

    case 'supprimer': {
        exigerAdmin();
        $verrou = verrouiller();
        $id = (string) (corpsJson()['id'] ?? '');
        $articles = lireJson('articles', []);
        $restants = [];
        foreach ($articles as $a) {
            if ($a['id'] === $id) { foreach ($a['photos'] as $p) supprimerPhoto($p); }
            else $restants[] = $a;
        }
        ecrireJson('articles', $restants);
        repondre(['ok' => true]);
    }

    case 'site': {
        exigerAdmin();
        $verrou = verrouiller();
        $d = corpsJson();
        $site = [];
        foreach (siteParDefaut() as $cle => $defaut) {
            $site[$cle] = is_bool($defaut)
                ? (bool) ($d[$cle] ?? $defaut)
                : texte($d[$cle] ?? $defaut, $cle === 'presentation' ? 300 : 120);
        }
        if ($site['email'] !== '' && !filter_var($site['email'], FILTER_VALIDATE_EMAIL)) erreur("L'adresse e-mail n'est pas valide.");
        if ($site['siret'] !== '' && !preg_match('/^\d{14}$/', str_replace(' ', '', $site['siret']))) erreur('Le SIRET doit contenir 14 chiffres.');
        if ($site['facebook'] !== '' && !preg_match('#^https://#', $site['facebook'])) erreur('Le lien Facebook doit commencer par https://');
        ecrireJson('site', $site);
        repondre(['site' => $site]);
    }

    case 'contact': {
        $d = corpsJson();
        if (!empty($d['site_web'])) repondre(['ok' => true]); // piège à robots
        $nom = texte($d['nom'] ?? '', 100);
        $coordonnees = texte($d['coordonnees'] ?? '', 150);
        $message = texte($d['message'] ?? '', 3000);
        $article = texte($d['article'] ?? '', 150);
        if ($nom === '' || $coordonnees === '' || $message === '') erreur('Merci de remplir tous les champs.');
        $destinataire = (string) ($config['email_contact'] ?? '');
        if (!filter_var($destinataire, FILTER_VALIDATE_EMAIL)) erreur("L'envoi de messages n'est pas encore configuré.", 503);

        // Au plus 5 messages par adresse IP et par heure.
        $verrou = verrouiller();
        $journal = array_filter(lireJson('contacts', []), fn($t) => $t['quand'] > time() - 3600);
        $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
        if (count(array_filter($journal, fn($t) => $t['ip'] === $ip)) >= 5) erreur('Trop de messages envoyés. Réessayez plus tard.', 429);
        $journal[] = ['ip' => $ip, 'quand' => time()];
        ecrireJson('contacts', array_values($journal));

        $propre = fn(string $s) => str_replace(["\r", "\n"], ' ', $s);
        $sujet = 'Message du site' . ($article !== '' ? ' : ' . $propre($article) : '');
        $corps = "Nom : $nom\nContact : $coordonnees\n" . ($article !== '' ? "Article : $article\n" : '') . "\n$message\n";
        $entetes = [
            'From' => (string) ($config['email_expediteur'] ?? $destinataire),
            'Content-Type' => 'text/plain; charset=UTF-8',
        ];
        if (filter_var($coordonnees, FILTER_VALIDATE_EMAIL)) $entetes['Reply-To'] = $coordonnees;
        $ok = mail($destinataire, '=?UTF-8?B?' . base64_encode($sujet) . '?=', $corps, $entetes);
        if (!$ok) erreur("Le message n'a pas pu partir. Essayez par téléphone.", 500);
        repondre(['ok' => true]);
    }
}

erreur('Action inconnue.', 404);
