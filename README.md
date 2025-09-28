# PayrollPro - Système de Gestion des Salaires

Un système moderne et complet de gestion des salaires construit avec React et Node.js, conçu pour rationaliser les opérations de paie pour les organisations avec plusieurs entreprises et rôles utilisateurs.

## 🚀 Fonctionnalités

### Contrôle d'Accès Basé sur les Rôles
- **SUPERADMIN** : Accès complet au système incluant la gestion des entreprises et administrateurs
- **ADMIN** : Gestion des employés, paie et paiements pour l'entreprise assignée
- **CAISSIER** : Accès en lecture seule aux employés, bulletins de salaire et traitement des paiements

### Fonctionnalités Principales
- **Gestion des Entreprises** : Créer, modifier et gérer plusieurs entreprises
- **Gestion des Administrateurs** : Le SUPERADMIN peut créer et gérer les administrateurs d'entreprise
- **Gestion des Employés** : Ajouter, mettre à jour et suivre les informations des employés
- **Traitement de la Paie** : Générer des cycles de paie et gérer les calculs salariaux
- **Génération des Bulletins** : Création et distribution automatisées des bulletins de salaire
- **Suivi des Paiements** : Surveiller le statut des paiements et les paiements à venir
- **Rapports** : Tableau de bord d'analyses et rapports complets
- **Paramètres** : Configuration et préférences du système

### Analyses du Tableau de Bord
- Métriques et KPI en temps réel
- Graphiques interactifs pour les tendances salariales et la distribution des employés
- Suivi du statut des entreprises
- Surveillance des échéanciers de paiement

## 🛠 Pile Technologique

### Frontend
- **React 18** - React moderne avec hooks et composants fonctionnels
- **Vite** - Outil de build rapide et serveur de développement
- **React Router** - Routage côté client
- **Tailwind CSS** - Framework CSS utilitaire
- **Recharts** - Bibliothèque de visualisation de données
- **Axios** - Client HTTP pour les appels API
- **Lucide React** - Bibliothèque d'icônes élégantes

### Backend
- **Node.js** - Environnement d'exécution serveur
- **Express.js** - Framework web
- **PostgreSQL** - Base de données
- **JWT** - Jetons d'authentification
- **bcrypt** - Hachage des mots de passe

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Serveur API backend en cours d'exécution (par défaut : https://gestion-salaire.onrender.com)

## 🔧 Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-dépôt>
   cd salary-management-system
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'Environnement**
   Créer un fichier `.env` dans le répertoire racine :
   ```env
   VITE_API_BASE_URL=https://gestion-salaire.onrender.com
   ```

4. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Build pour la production**
   ```bash
   npm run build
   ```

## 📖 Utilisation

### Pour Commencer
1. Naviguer vers l'application dans votre navigateur
2. Se connecter avec vos identifiants selon votre rôle
3. Accéder aux fonctionnalités selon vos permissions

### Rôles Utilisateurs et Permissions

#### SUPERADMIN
- Gérer les entreprises (créer, modifier, supprimer)
- Gérer les administrateurs
- Voir les analyses à l'échelle du système
- Accéder à toutes les données d'entreprise

#### ADMIN
- Gérer les employés de leur entreprise
- Traiter la paie et générer les bulletins
- Gérer les paiements
- Voir les rapports et analyses

#### CAISSIER
- Voir les informations des employés
- Accéder aux bulletins (lecture seule)
- Traiter les paiements
- Voir les rapports

## 🏗 Structure du Projet

```
salary-management-system/
├── public/                          # Fichiers statiques publics
│   └── vite.svg                     # Icône par défaut de Vite
├── src/                             # Code source principal
│   ├── components/                  # Composants réutilisables React
│   │   ├── layout/                  # Composants de mise en page
│   │   │   ├── Header.jsx           # Barre de navigation supérieure avec menu et profil
│   │   │   └── Layout.jsx           # Layout principal avec sidebar et contenu
│   │   └── ui/                      # Composants d'interface utilisateur
│   │       └── RoleSwitcher.jsx     # Sélecteur de rôle pour changer de contexte
│   ├── context/                     # Contextes React pour la gestion d'état globale
│   │   └── AuthContext.jsx          # Contexte d'authentification et gestion des rôles
│   ├── pages/                       # Pages/components de routage principales
│   │   ├── Home/                    # Page d'accueil avec tableaux de bord
│   │   │   └── Home.jsx             # Composant principal du tableau de bord
│   │   ├── Admins.jsx               # Page de gestion des administrateurs
│   │   ├── Companies.jsx            # Page de gestion des entreprises
│   │   ├── Employees.jsx            # Page de gestion des employés
│   │   ├── Login.jsx                # Page de connexion utilisateur
│   │   ├── PayRuns.jsx              # Page de gestion des cycles de paie
│   │   ├── Payslips.jsx             # Page de visualisation des bulletins
│   │   ├── Payments.jsx             # Page de gestion des paiements
│   │   ├── Reports.jsx              # Page de rapports et analyses
│   │   └── Settings.jsx             # Page de paramètres système
│   ├── services/                    # Services et utilitaires
│   │   ├── api.js                   # Configuration Axios et appels API
│   │   └── authService.js           # Services d'authentification
│   ├── App.jsx                      # Composant racine de l'application
│   ├── main.jsx                     # Point d'entrée React avec rendu
│   ├── index.css                    # Styles CSS globaux
│   └── App.css                      # Styles spécifiques à l'application
├── index.html                       # Template HTML principal
├── package.json                     # Dépendances et scripts npm
├── vite.config.js                   # Configuration de Vite
├── tailwind.config.js               # Configuration Tailwind CSS
└── README.md                        # Documentation du projet
```

## 🔌 Points de Terminaison API

### Authentification
- `POST /auth/login` - Connexion utilisateur

### Entreprises
- `GET /company` - Obtenir toutes les entreprises
- `GET /company/:id` - Obtenir une entreprise par ID
- `POST /company` - Créer une nouvelle entreprise
- `PUT /company/:id` - Mettre à jour une entreprise
- `DELETE /company/:id` - Supprimer une entreprise

### Administrateurs
- `GET /admin` - Obtenir tous les administrateurs
- `GET /admin/:id` - Obtenir un administrateur par ID
- `POST /admin` - Créer un nouvel administrateur
- `PUT /admin/:id` - Mettre à jour un administrateur
- `DELETE /admin/:id` - Supprimer un administrateur

### Employés
- `GET /employees` - Obtenir tous les employés
- `POST /employees` - Créer un nouvel employé
- `PUT /employees/:id` - Mettre à jour un employé
- `DELETE /employees/:id` - Supprimer un employé

### Paie
- `GET /payruns` - Obtenir tous les cycles de paie
- `POST /payruns` - Créer un nouveau cycle de paie
- `GET /payslips` - Obtenir tous les bulletins
- `GET /payments` - Obtenir tous les paiements

## 🎨 Fonctionnalités UI/UX

- **Design Responsive** : Fonctionne parfaitement sur desktop, tablette et mobile
- **Interface Moderne** : Design propre et intuitif avec des animations fluides
- **Prêt pour le Mode Sombre/Clair** : Construit avec Tailwind pour un changement de thème facile
- **Graphiques Interactifs** : Visualisation de données avec Recharts
- **Dialogues Modaux** : Formulaires élégants avec validation
- **États de Chargement** : Retour utilisateur pendant les opérations
- **Gestion d'Erreurs** : Gestion complète des erreurs

## 🔒 Fonctionnalités de Sécurité

- Authentification basée sur JWT
- Contrôle d'accès basé sur les rôles
- Communication API sécurisée
- Hachage des mots de passe
- Gestion des sessions
- Routes protégées

## 📊 Fonctionnalités du Tableau de Bord

### Tableau de Bord SUPERADMIN
- Nombre total d'entreprises
- Pourcentage d'entreprises actives
- Statut de santé du système
- Tendances de création d'entreprises
- Distribution du statut des entreprises
- Liste des entreprises récentes

### Tableau de Bord ADMIN/CAISSIER
- Nombre total d'employés
- Pourcentage d'employés actifs
- Nombre de cycles de paie
- Montant total payé
- Graphiques d'évolution des salaires
- Distribution du statut des employés
- Paiements à venir

## 🚀 Déploiement

### Build pour la Production
```bash
npm run build
```


### Déployer sur une Plateforme d'Hébergement
Les fichiers construits dans `dist/` peuvent être déployés sur :
- Vercel
- Netlify
- GitHub Pages
- Tout service d'hébergement statique

## 🤝 Contribution

1. Forker le dépôt
2. Créer une branche de fonctionnalité (`git checkout -b feature/fonctionnalite-incroyable`)
3. Commiter vos changements (`git commit -m 'Ajouter une fonctionnalité incroyable'`)
4. Pousser vers la branche (`git push origin feature/fonctionnalite-incroyable`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour le support, envoyez un email à pabassdiame76@gmail.com ou créez une issue dans le dépôt.

## 🔄 Améliorations Futures

- [ ] Support multi-langues (i18n)
- [ ] Bouton de basculement mode sombre
- [ ] Rapports avancés avec export PDF
- [ ] Notifications par email pour les bulletins
- [ ] Intégration avec les API bancaires
- [ ] Application mobile compagnon
- [ ] Analyses et prévisions avancées
- [ ] Opérations en masse pour les employés
- [ ] Formules salariales personnalisées
- [ ] Intégration du suivi du temps

---

**PayrollPro** - Rationalisation de la gestion de la paie pour les entreprises modernes.
