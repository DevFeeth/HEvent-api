# HEvent API

API REST de billetterie d'événements : publication d'événements, vente de billets avec codes promo, paiement simulé, QR codes et scan à l'entrée.

Projet réalisé dans le cadre du cours **Technologies Back-end et Cloud** (Henallux) par Maxime, Nolan et Florian.

## Technologies

- **Node.js 24** + **Express 5**
- **PostgreSQL 17** avec **Prisma 7** (adaptateur `@prisma/adapter-pg`)
- **VineJS** pour la validation
- **Argon2id** (avec pepper) pour les mots de passe, **JWT** pour l'authentification
- **pino** pour les logs
- **Swagger** (swagger-jsdoc) pour la documentation, **Bruno** pour les tests
- **Docker Compose** (un conteneur API + un conteneur base de données)

## Lancement

### 1. Créer le fichier `.env`

Copier `.env.example` en `.env` à la racine et remplir les valeurs :

| Variable | Rôle |
|---|---|
| `USERDB` | Utilisateur PostgreSQL |
| `PASSWORDDB` | Mot de passe PostgreSQL |
| `DBNAME` | Nom de la base |
| `DATABASE_URL` | Seulement pour lancer l'API hors Docker : `postgresql://USERDB:PASSWORDDB@localhost:5432/DBNAME` |
| `PEPPER` | Secret ajouté aux mots de passe avant le hachage |
| `JWT_SECRET` | Secret de signature des tokens de session |
| `QR_SECRET` | Secret de signature des QR codes |

> ⚠️ Les mots de passe des comptes de test ont été hachés avec le `PEPPER` de l'équipe. Avec un autre `PEPPER`, ils ne fonctionnent plus : le `.env` complet est fourni séparément, il n'est pas dans le dépôt.

Pour générer les autres secrets :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Démarrer

```bash
docker compose up --build
```

- L'API écoute sur **http://localhost:3001/api/v1**
- Vérifier qu'elle tourne : http://localhost:3001/api/v1/health
- La base est créée et remplie automatiquement par [src/scripts/SQL/hEvent.sql](src/scripts/SQL/hEvent.sql) au premier démarrage du conteneur.

Pour repartir d'une base propre :

```bash
docker compose down
```

Ou, sans supprimer les conteneurs, réinitialiser la base avec le script JavaScript (il supprime toutes les tables puis exécute `hEvent.sql` ; `DATABASE_URL` doit pointer vers la base, par exemple `localhost:5432`) :

```bash
npm run initDB
```

### Lancer l'API hors Docker (développement)

Avec seulement la base dans Docker (`docker compose up -d db`) et `DATABASE_URL` rempli dans `.env` :

```bash
npm install
npx prisma generate
npm run dev
```

## Comptes de test

Voir [login.txt](login.txt). Tous les comptes ont le mot de passe **`password`**.

| Email | Rôle |
|---|---|
| `user@mail.com` | USER |
| `orga@mail.com` | ORGANIZER |
| `admin@mail.com` | ADMIN |

Le jeu de données contient aussi 25 autres comptes (4 organisateurs, des utilisateurs dont un compte désactivé), 18 événements (7 terminés, 1 annulé, 8 publiés dont un qui a lieu le jour même pour tester le scan, 2 brouillons), des types de billets, des codes promo et des commandes.

## Authentification

1. `POST /api/v1/users/login` avec `{"email": "...", "password": "..."}` renvoie un `token` (valable 24 h).
2. Envoyer ce token dans le header des requêtes protégées :

```
Authorization: Bearer <token>
```

Le rôle et l'état du compte sont relus en base à chaque requête : un compte désactivé ou dont le rôle change est pris en compte immédiatement.

Protection contre la force brute : après **5 échecs de connexion en 15 minutes** pour une même adresse IP et un même email, la connexion est refusée (429, header `Retry-After`).

Les listes (`/users`, `/events`, `/categories`, `/roles`) acceptent `?search=&page=&limit=` : la limite est appliquée en SQL et le nombre total est renvoyé dans le header `X-Total-Count`.

| Rôle | Droits |
|---|---|
| Visiteur | Voir les événements publiés, leurs types de billets et les catégories, créer un compte, commander en invité |
| USER | Commander, payer, voir ses commandes et ses billets, générer le QR code d'un billet |
| ORGANIZER | + Gérer ses événements, leurs types de billets et codes promo, scanner et annuler les billets |
| ADMIN | Tout, sur tous les événements, + gestion des utilisateurs, rôles et catégories |

## Ressources

| Ressource | Routes |
|---|---|
| Utilisateurs | `/users`, `/users/login`, `/users/me`, `/users/me/events`, `/users/me/tickets`, `/users/me/orders` |
| Événements | `/events`, `/events/upcoming`, `/events/{id}` |
| Types de billets | `/events/{id}/ticket-types`, `/ticket-types/{id}` |
| Codes promo | `/events/{id}/promo-codes`, `/promo-codes/{id}` |
| Commandes | `/orders`, `/orders/guest`, `/orders/{id}`, `/orders/{id}/pay`, `/orders/{id}/cancel` |
| Billets | `/events/{id}/tickets`, `/tickets/{id}`, `/tickets/{id}/qr-token`, `/tickets/scan`, `/tickets/{id}/cancel` |
| Rôles | `/roles`, `/roles/{name}` |
| Catégories | `/categories`, `/categories/{name}` |

Le détail de chaque route (paramètres, corps, réponses) est dans la documentation Swagger.

## Règles métier principales

- **Commande** : les billets sont réservés directement et la commande reste `PENDING` jusqu'au paiement. Une commande non payée est annulée après **15 minutes** et ses places sont remises en vente. Une commande à 0 € est payée directement.
- **Stock** : `available_quantity` est le nombre total de billets d'un type, les billets vendus sont comptés à partir des commandes. La création de commande se fait dans une transaction avec un verrou sur l'événement, pour ne jamais vendre plus de billets que prévu.
- **Paiement simulé** : `POST /orders/{id}/pay` avec `payment_method` :
  - `pm_card_visa` : paiement accepté
  - `pm_card_chargeDeclined` : paiement refusé (402), la commande reste en attente
- **QR code** : `GET /tickets/{id}/qr-token` donne un token valable **30 secondes**, que l'organisateur scanne avec `POST /tickets/scan`. Un billet ne peut être scanné qu'une fois, pendant les dates de l'événement, et seulement si sa commande est payée.
- **Dates** : les dates et heures des événements sont exprimées à l'heure de Bruxelles.

## Documentation Swagger

La spécification OpenAPI est dans [swagger/spec.json](swagger/spec.json). Pour la régénérer après une modification des commentaires `@swagger` :

```bash
npm run genDoc
```

Pour la consulter, importer `swagger/spec.json` dans [editor.swagger.io](https://editor.swagger.io) (le bouton **Authorize** permet d'ajouter le token JWT).

## Tests Bruno

La collection est dans [bruno/](bruno/) : 75 requêtes et 106 tests (authentification, CRUD protégés, pagination et recherche, commandes, paiement, QR codes, cas d'erreur 400/401/403/404/409). L'environnement `local` est dans `bruno/environments/`.

- **Dans l'application Bruno** : *Open Collection* → dossier `bruno/`, choisir l'environnement **local**, puis *Run* sur la collection entière (les requêtes s'enchaînent : les tokens et les ids créés sont réutilisés par les suivantes).
- **En ligne de commande**, depuis le dossier `bruno/` :

```bash
npx @usebruno/cli run -r --env local
```

L'API doit être lancée. La collection peut être rejouée plusieurs fois sans réinitialiser la base.

## Structure

```
server.js                 Point d'entrée (Express, logs, CORS, job d'expiration)
prisma/schema.prisma      Schéma Prisma
src/
├── routes/               Routes + documentation Swagger
├── middlewares/
│   ├── identification/   Lecture du token JWT
│   ├── authorization/    Vérification du rôle
│   ├── security/         Limite des tentatives de connexion
│   └── validator/        Validation des données (VineJS)
├── controllers/          Logique de chaque route, transactions
├── models/               Accès à la base (Prisma)
├── jobs/                 Tâche planifiée (expiration des commandes)
├── utils/                Hachage, tokens, gestion des erreurs, logs, pagination, paiement simulé
├── database/             Client Prisma
└── scripts/
    ├── SQL/              Création et remplissage de la base (hEvent.sql)
    └── JS/               initDB.js : réinitialise la base (npm run initDB)
bruno/                    Collection de tests Bruno
swagger/                  Génération et spécification OpenAPI
```

Chaque requête suit le même chemin : **route → JWT → rôle → validateur → contrôleur → modèle**.
