# Système de Gestion des Salaires - Frontend

## Description
Ce projet est une application frontend React pour la gestion des salaires. Elle permet aux utilisateurs de gérer les employés, les entreprises, les paies, les bulletins de salaire, les paiements et les rapports. L'application est conçue pour différents rôles d'utilisateurs, notamment les super administrateurs et les administrateurs d'entreprise.

## Technologies Utilisées
- **React 19** : Bibliothèque JavaScript pour la construction d'interfaces utilisateur.
- **Vite** : Outil de build rapide pour les applications modernes.
- **Tailwind CSS** : Framework CSS utilitaire pour le styling.
- **Axios** : Bibliothèque pour effectuer des requêtes HTTP.
- **React Router DOM** : Pour la gestion du routage côté client.
- **Recharts** : Bibliothèque pour créer des graphiques et des visualisations de données.
- **Lucide React** : Bibliothèque d'icônes pour React.
- **ESLint** : Outil de linting pour maintenir la qualité du code.

## Architecture
L'application suit une architecture modulaire basée sur React :

- **Composants** : Organisés en dossiers `layout` (pour la mise en page générale), `ui` (pour les composants réutilisables comme les boutons et les interrupteurs de rôle), et `pages` (pour les pages principales).
- **Gestion d'État** : Utilise le Context API de React pour la gestion de l'authentification et de l'état global (AuthContext).
- **Routage** : Implémenté avec React Router, incluant des routes protégées basées sur les rôles (par exemple, SUPERADMIN pour l'accès aux entreprises).
- **Services** : Dossier `services` contenant `api.js` pour les appels API vers le backend (hébergé sur https://gestion-salaire.onrender.com) et `authService.js` pour la gestion de l'authentification locale.
- **Authentification** : Basée sur des tokens JWT stockés dans le localStorage, avec gestion de l'impersonnation d'entreprises.
- **Styling** : Utilise Tailwind CSS pour un design responsive et moderne.

## Fonctionnalités Principales
- **Authentification** : Connexion et déconnexion des utilisateurs, avec gestion des rôles.
- **Tableau de Bord** : Page d'accueil avec aperçu des données clés.
- **Gestion des Entreprises** (Rôle SUPERADMIN) : Création, lecture, mise à jour et suppression des entreprises.
- **Gestion des Administrateurs** (Rôle SUPERADMIN) : Gestion des comptes administrateurs.
- **Gestion des Employés** : Ajout, modification, activation/désactivation et suppression des employés.
- **Paies (PayRuns)** : Création et gestion des cycles de paie.
- **Bulletins de Salaire (Payslips)** : Consultation des bulletins individuels.
- **Paiements** : Gestion des paiements, avec export PDF des reçus et registres de paie.
- **Rapports** : Génération de rapports sur les données salariales.
- **Caissiers** : Gestion des caissiers (fonctionnalité spécifique).
- **Paramètres** : Configuration utilisateur.
- **Vue Admin par Entreprise** : Permet aux super administrateurs d'impersonner une entreprise pour voir ses données.
- **Commutateur de Rôle** : Interface pour changer de rôle ou d'entreprise.

## Installation et Démarrage
1. Clonez le dépôt :
   ```
   git clone <url-du-dépôt>
   cd salary-management-system
   ```

2. Installez les dépendances :
   ```
   npm install
   ```

3. Lancez l'application en mode développement :
   ```
   npm run dev
   ```

4. Pour construire l'application pour la production :
   ```
   npm run build
   ```

5. Pour prévisualiser la version de production :
   ```
   npm run preview
   ```

## Scripts Disponibles
- `npm run dev` : Lance le serveur de développement Vite.
- `npm run build` : Construit l'application pour la production.
- `npm run lint` : Exécute ESLint pour vérifier le code.
- `npm run preview` : Prévisualise la version de production.

## Déploiement
L'application est configurée pour le déploiement sur Vercel (voir `vercel.json`). Assurez-vous que les variables d'environnement nécessaires sont définies pour la connexion au backend.

## Contribution
Pour contribuer, veuillez suivre les bonnes pratiques de développement React et utiliser ESLint pour maintenir la qualité du code.
