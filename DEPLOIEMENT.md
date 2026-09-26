# Guide de mise en ligne — Afro Services Guangzhou

Aucune connaissance en code n'est nécessaire. Suis les étapes dans l'ordre, ça prend environ 20-30 minutes la première fois.

---

## Étape 1 — Créer la base de données gratuite (Firebase)

C'est ici que sont stockés tes plats, tes commandes, tes demandes de transport et de courses — visibles par toi et tous tes clients.

1. Va sur **console.firebase.google.com** et connecte-toi avec un compte Google (ou crées-en un, gratuit).
2. Clique sur **"Ajouter un projet"**, donne-lui un nom (ex : `afro-services-guangzhou`), continue jusqu'à la création (tu peux désactiver Google Analytics, pas nécessaire).
3. Une fois dans le projet, dans le menu de gauche, clique sur **"Firestore Database"** puis **"Créer une base de données"**.
4. Choisis **"Commencer en mode test"** (ça permettra au site de lire/écrire pendant les 30 premiers jours — voir la note sécurité en bas de ce guide).
5. Choisis une région proche de la Chine si proposée (ex: asia-east1), puis valide.
6. Retourne à la page d'accueil du projet (icône maison), clique sur l'icône **`</>`** ("Ajouter une application Web").
7. Donne un surnom à l'app (ex: `afro-web`), clique sur **"Enregistrer et continuer"**.
8. Firebase affiche un bloc de code avec `firebaseConfig = { apiKey: "...", ... }`. **Copie ces valeurs.**

## Étape 2 — Coller la configuration dans le projet

1. Ouvre le fichier `src/firebase.js` dans ce dossier.
2. Remplace chaque `"COLLE_TA_..._ICI"` par la valeur correspondante copiée à l'étape 1.
3. Sauvegarde le fichier.

## Étape 3 — Mettre le code sur GitHub (sans ligne de commande)

1. Va sur **github.com**, crée un compte gratuit si tu n'en as pas.
2. Clique sur **"New repository"**, nomme-le `afro-services-guangzhou`, laisse-le en **Public** ou **Private** (les deux fonctionnent), clique sur **"Create repository"**.
3. Sur la page du repository, clique sur **"uploading an existing file"**.
4. Glisse-dépose **tout le contenu de ce dossier** (tous les fichiers et le dossier `src`) dans la zone.
5. Clique sur **"Commit changes"** en bas de page.

## Étape 4 — Déployer sur Vercel (gratuit)

1. Va sur **vercel.com**, clique sur **"Sign Up"**, choisis **"Continue with GitHub"** (connecte ton compte GitHub de l'étape 3).
2. Une fois connecté, clique sur **"Add New..." → "Project"**.
3. Trouve ton repository `afro-services-guangzhou` dans la liste et clique sur **"Import"**.
4. Vercel détecte automatiquement que c'est un projet Vite — ne change rien, clique sur **"Deploy"**.
5. Après 1-2 minutes, Vercel te donne une adresse du type `afro-services-guangzhou.vercel.app` — **c'est ton site, en ligne, gratuit.**

## Étape 5 (optionnel) — Utiliser ton propre nom de domaine

Si tu achètes un nom de domaine plus tard (ex: chez Namecheap ou Alibaba Cloud, environ 8-15 USD/an), tu vas dans **Vercel → ton projet → Settings → Domains**, tu ajoutes ton domaine, et Vercel te donne les informations à mettre chez ton fournisseur de domaine. Je peux t'accompagner sur cette étape le moment venu.

---

## ⚠️ Sécurité — à faire avant de partager le lien publiquement

En "mode test", n'importe qui connaissant ton lien Firebase pourrait techniquement modifier tes données directement (pas juste via le site). Pour un usage sérieux :

1. Dans Firebase Console → Firestore Database → onglet **"Règles"**.
2. Remplace les règles par celles-ci (limite l'accès à la collection utilisée par le site) :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /afroData/{docId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Ces règles restent ouvertes en écriture pour que le site fonctionne sans compte utilisateur (comme conçu actuellement). C'est suffisant pour démarrer, mais dès que le volume de commandes grandit, il vaudra mieux ajouter une vraie authentification pour l'espace Gestion — dis-le moi quand tu en seras là, je t'aiderai à la mettre en place.

3. Pense aussi à changer le code d'accès `ADMIN_PIN` dans `src/App.jsx` (actuellement `1234`) pour quelque chose que toi seul connais.

---

## Besoin d'aide à une étape ?

Reviens me voir avec le message d'erreur exact ou une capture d'écran, je t'aiderai à débloquer.
