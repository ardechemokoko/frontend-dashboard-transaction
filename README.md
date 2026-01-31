# Frontend Dashboard Transaction (Next.js)

Dashboard frontend pour l’API Transaction (Laravel). Projet Next.js 16 avec TypeScript, Tailwind CSS et App Router.

## Prérequis

- Node.js 18+
- npm (ou yarn / pnpm)

## Installation

```bash
cd frontend-dashboard-transaction
npm install
```

## Configuration

Créez un fichier `.env.local` à la racine pour l’URL de l’API backend :

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

(Si absent, l’URL par défaut est `http://127.0.0.1:8000`.)

## Connexion au backend (authentification)

1. **Démarrer le backend** : dans `backend-api-transaction`, lancer `php artisan serve` (API sur http://127.0.0.1:8000).
2. **CORS** : le backend autorise les requêtes depuis `http://localhost:3000` et `http://127.0.0.1:3000` (voir `config/cors.php` côté backend).
3. **Connexion** : sur la page `/login`, saisir **email**, **mot de passe** et **code agent** (format RD-XXXXX) d’un utilisateur créé via `POST /api/auth/register`. Le token est stocké en local et utilisé pour les routes protégées (ex. `/dashboard`, `GET /api/auth/user`).

## Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans le navigateur.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement (port 3000) |
| `npm run build` | Build de production |
| `npm run start` | Démarrer le serveur de production |
| `npm run lint` | Lancer ESLint |

## Structure

- **app/** — App Router (pages, layout, styles)
- **public/** — Assets statiques

## API backend

L’API backend (Laravel) se trouve dans `../backend-api-transaction`. Documentation : voir le README du backend pour les routes (auth, callback, verify, mark-used, etc.).

## En savoir plus

- [Documentation Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
