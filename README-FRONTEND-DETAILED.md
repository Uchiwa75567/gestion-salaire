# Système de Gestion des Salaires - Frontend

## Description
Application React moderne pour la gestion complète des salaires avec interface utilisateur intuitive. Permet aux entreprises de gérer leurs employés, cycles de paie, bulletins de salaire, paiements et rapports. Support multi-rôles avec interface adaptée selon les permissions.

## Technologies Utilisées
- **React 19** : Bibliothèque JavaScript moderne
- **Vite** : Build tool ultra-rapide
- **Tailwind CSS** : Framework CSS utilitaire
- **Axios** : Client HTTP pour les appels API
- **React Router DOM** : Gestion du routage
- **Recharts** : Graphiques et visualisations
- **Lucide React** : Icônes modernes
- **React Context** : Gestion d'état globale

## Architecture
- **Composants modulaires** : Layout, UI, Pages organisés logiquement
- **Context API** : Gestion centralisée de l'authentification
- **Services** : Séparation claire API et logique métier
- **Routing protégé** : Accès basé sur les rôles utilisateur

## Rôles Utilisateurs & Fonctionnalités

### 🔐 SUPERADMIN
- **Gestion des Entreprises** : CRUD complet des entreprises
- **Gestion des Administrateurs** : Comptes admin entreprise
- **Impersonnation** : Voir données comme admin entreprise
- **Accès global** : Toutes les fonctionnalités système

### 🏢 ADMIN (Entreprise)
- **Gestion des Employés** : CRUD employés de l'entreprise
- **Cycles de Paie** : Création et gestion des payruns
- **Bulletins de Salaire** : Consultation et export PDF
- **Paiements** : Gestion complète des paiements
- **Rapports** : Analyses et statistiques

### 💰 CAISSIER
- **Paiements** : Enregistrement et suivi des paiements
- **Reçus** : Génération de reçus de paiement
- **Consultation** : Accès limité aux données de paiement

### 👤 EMPLOYÉ
- **Bulletins personnels** : Consultation de ses bulletins
- **Historique paiements** : Suivi de ses paiements
- **Téléchargements** : Export PDF de ses documents

## Installation & Démarrage

### Prérequis
- Node.js (v18+)
- npm ou yarn

### Installation
```bash
cd salary-management-system
npm install
```

### Configuration
Créer un fichier `.env` :
```env
VITE_API_BASE_URL=https://gestion-salaire.onrender.com/api
```

### Démarrage
```bash
npm run dev    # Développement
npm run build  # Production
npm run preview # Prévisualisation
```

## Guide d'Utilisation

### 1. Authentification
- Accédez à `/login`
- Utilisez vos identifiants (email/mot de passe)
- Redirection automatique selon votre rôle

### 2. Navigation
- **Header** : Navigation principale + changement rôle/entreprise
- **Sidebar** : Menu adapté à votre rôle
- **Breadcrumbs** : Navigation contextuelle

### 3. Gestion des Employés (ADMIN)
```
📍 /employees
✅ Ajouter employé : Bouton "Ajouter"
✅ Modifier : Clic sur ligne employé
✅ Activer/Désactiver : Toggle status
✅ Supprimer : Actions > Supprimer
```

### 4. Cycles de Paie (ADMIN)
```
📍 /payruns
✅ Créer cycle : Bouton "Nouveau Cycle"
✅ Approuver : Actions > Approuver
✅ Fermer : Actions > Fermer
📧 Notification automatique aux employés
```

### 5. Bulletins de Salaire
```
📍 /payslips
✅ Consulter : Liste paginée avec filtres
✅ Exporter PDF : Actions > Télécharger
✅ Vue détaillée : Clic sur bulletin
```

### 6. Paiements (CAISSIER/ADMIN)
```
📍 /payments
✅ Enregistrer paiement : Bouton "Nouveau Paiement"
✅ Reçu PDF : Actions > Télécharger Reçu
✅ Historique : Filtrage par période
📧 Notification automatique à l'employé
```

### 7. Rapports (ADMIN)
```
📍 /reports
✅ Tableaux de bord : Métriques clés
✅ Graphiques : Évolution des salaires
✅ Exports : Données au format Excel/PDF
```

## API Integration

### Configuration API
```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Intercepteur pour JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Gestion d'État
```javascript
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  // Méthodes login, logout, switchRole, etc.
};
```

## Tests Fonctionnels

### Comptes de Test
```
SUPERADMIN:
- Email: superadmin@gestion-salaire.com
- Password: SuperAdmin123!

ADMIN (Test Company):
- Email: admin@testcompany.com
- Password: Admin123!

CAISSIER (Test Company):
- Email: cashier@testcompany.com
- Password: Cashier123!

EMPLOYÉ (Test Company):
- Email: employee@testcompany.com
- Password: Employee123!
```

### Scénarios de Test

#### 1. Gestion des Employés
```bash
# Créer un employé
1. Aller à /employees
2. Cliquer "Ajouter Employé"
3. Remplir formulaire (nom, email, salaire, poste)
4. Soumettre → Employé créé avec succès
```

#### 2. Cycle de Paie Complet
```bash
# Créer et traiter un cycle de paie
1. Aller à /payruns → "Nouveau Cycle"
2. Remplir période (novembre 2024)
3. Approuver le cycle
4. Vérifier emails envoyés aux employés
5. Aller à /payslips → Voir bulletins générés
6. Aller à /payments → Enregistrer paiements
7. Vérifier emails de confirmation paiement
```

#### 3. Exports PDF
```bash
# Tester les exports
1. Bulletin individuel → Actions > Télécharger PDF
2. Reçu de paiement → Actions > Télécharger Reçu
3. Registre de paie → PayRuns > Télécharger Registre
```

#### 4. Changement de Rôle
```bash
# Tester l'impersonnation
1. Header > Sélecteur rôle
2. Choisir "Voir comme Admin: Company ABC"
3. Interface s'adapte aux permissions
4. Données filtrées par entreprise
```

## Composants Clés

### Layout Components
- **Header** : Navigation + sélecteur rôle/entreprise
- **Layout** : Structure principale avec sidebar
- **RoleSwitcher** : Changement de contexte utilisateur

### Form Components
- **AddEmployeeModal** : Formulaire création employé
- **EditEmployeeModal** : Modification employé
- **PaymentForm** : Enregistrement paiement

### Data Components
- **EmployeesTable** : Liste paginée employés
- **PayRunsTable** : Gestion cycles de paie
- **PaymentsTable** : Suivi paiements
- **PayslipsTable** : Consultation bulletins

## Gestion d'État

### AuthContext
```javascript
// État global d'authentification
{
  user: { id, email, role, companyId },
  company: { id, name, currency },
  token: "jwt-token",
  isImpersonating: false
}
```

### Actions Disponibles
- `login(user, token)`
- `logout()`
- `switchRole(role, company)`
- `updateProfile(data)`

## Sécurité
- **JWT Tokens** : Stockage localStorage avec expiration
- **Routes Protégées** : Redirection automatique si non autorisé
- **Validation** : Données validées côté client et serveur
- **CORS** : Configuration appropriée pour l'API

## Performance
- **Lazy Loading** : Composants chargés à la demande
- **Pagination** : Grandes listes paginées
- **Caching** : Données mises en cache localement
- **Optimisation Bundle** : Code splitting avec Vite

## Déploiement
```bash
# Build pour production
npm run build

# Déploiement Vercel
vercel --prod
```

## Dépannage

### Problèmes Courants
1. **Erreur 401** : Token expiré → Reconnexion
2. **Erreur 403** : Permissions insuffisantes → Vérifier rôle
3. **Erreur 500** : Problème serveur → Vérifier logs API

### Debug Mode
```bash
# Variables d'environnement de debug
VITE_DEBUG=true
VITE_API_BASE_URL=http://localhost:5000/api
```

## Contribution
1. Fork le projet
2. Créer branche feature (`git checkout -b feature/nouvelle-fonction`)
3. Commiter (`git commit -m "Ajout nouvelle fonctionnalité"`)
4. Push (`git push origin feature/nouvelle-fonction`)
5. Pull Request

## Support
📧 support@gestion-salaire.com
📚 Documentation API: `/api/docs`
🐛 Issues: GitHub Issues
