# 🔵 IntelliConnect — Plateforme de Gestion des Partenariats Capgemini Tunisie

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=nextdotjs)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)](https://www.postgresql.org/)
[![Bun](https://img.shields.io/badge/Bun-Runtime-f472b6?logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)

> Plateforme web complète pour la gestion intelligente des partenariats de Capgemini Tunisie. Gestion des partenaires, contacts, offres, événements, documents, communications, recrutements et analytics.

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Installation rapide](#-installation-rapide)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Comptes de test](#-comptes-de-test)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Architecture du projet](#-architecture-du-projet)
- [Stack technique](#-stack-technique)
- [API Endpoints](#-api-endpoints)
- [Base de données](#-base-de-données)
- [Sécurité](#-sécurité)

---

## ⚙️ Prérequis

| Outil | Version minimum | Lien |
|-------|----------------|------|
| **Bun** | 1.0+ | [bun.sh](https://bun.sh/) |
| **PostgreSQL** | 15+ | [postgresql.org](https://www.postgresql.org/download/) |
| **Node.js** | 18+ (fourni par Bun) | — |

> 
---

## 🚀 Installation rapide

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/capgemini-project.git
cd capgemini-project

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement (voir section Configuration)
cp .env.example .env.local
# Modifier les valeurs dans .env.local

# 4. Créer la base de données PostgreSQL
psql -U postgres -c "CREATE DATABASE test_partnership_database;"

# 5. Exécuter les migrations
bun run db:migrate

# 6. Réinitialiser les mots de passe de test
node scripts/reset-passwords.js
node scripts/setup-partner-accounts.js

# 7. Lancer le serveur de développement
bun dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 🔧 Configuration

Créer un fichier `.env.local` à la racine du projet :

```env
# =====================================================
# BASES DE DONNÉES
# =====================================================
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/test_partnership_database"
DW_DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/dw_intelliconnect"

# =====================================================
# URL DE L'APPLICATION
# =====================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =====================================================
# AUTHENTIFICATION (JWT)
# =====================================================
JWT_SECRET=votre_secret_jwt_genere_aleatoirement

# =====================================================
# IA / OPENROUTER (optionnel)
# =====================================================
OPENROUTER_KEY=votre_cle_openrouter

# =====================================================
# EMAIL (Gmail SMTP — optionnel)
# =====================================================
GMAIL_USER=votre_email@gmail.com
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

### Générer un JWT_SECRET :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Configurer Gmail SMTP (optionnel) :
1. Aller sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Créer un mot de passe d'application pour "Mail"
3. Copier le mot de passe généré dans `GMAIL_APP_PASSWORD`

> 🔒 **Le fichier `.env.local` est automatiquement exclu de Git via `.gitignore`.**

---

## ▶️ Lancement

```bash
# Développement (avec hot reload)
bun dev

# Build production
bun run build

# Lancer en production
bun start

# Linter
bun run lint

# Drizzle Studio (interface visuelle BDD)
bun run db:studio
```

---

## 🔑 Comptes de test

### Employés Capgemini

Mot de passe par défaut : **`Capgemini2024!`**

| Email | Rôle | Accès spécifique |
|-------|------|-----------------|
| `khaled.maatoug@capgemini.com` | **Admin** | Tout : CRUD partenaires, RH, demandes |
| `karim.mejri@capgemini.com` | **Manager** | CRUD partenaires, événements, demandes |
| `sami.trabelsi@capgemini.com` | **Manager** | CRUD partenaires, événements, demandes |
| `leila.benali@capgemini.com` | **Commercial** | Lecture partenaires, communications |
| `ahmed.gharbi@capgemini.com` | **Commercial** | Lecture partenaires, communications |
| `nadia.haddad@capgemini.com` | **Analyst** | Dashboard BI, lecture seule |
| `mouna.baccar@capgemini.com` | **RH** | Employés, recrutements, événements |

### Partenaires

Mot de passe par défaut : **`Partner2024!`**

Se connecter avec l'email du partenaire :
- `partenariats@microsoft.tn` (Fournisseur)
- `bureau-entreprises@enit.rnu.tn` (Université)
- `carriere@ihec.rnu.tn` (Université)
- `service.clients@lafayette.tn` (Marketing)
- `contact@cocacola.tn` (Marketing)
- Et d'autres... (voir les emails dans la section Partenaires)

> Pour réinitialiser les mots de passe : `node scripts/reset-passwords.js` (employés) et `node scripts/setup-partner-accounts.js` (partenaires)

---

## 🎯 Fonctionnalités principales

### Portail Employé (`/dashboard`)

| Module | Description | Rôles |
|--------|-------------|-------|
| **Partenaires** | CRUD complet, filtrage, recherche, suspension | Tous (CRUD: admin/manager) |
| **Contacts** | Gestion des contacts par partenaire | Tous |
| **Offres** | Offres commerciales | Tous |
| **Historique statuts** | Suivi des changements de statut | Tous |
| **Dashboard BI** | Analytics et KPIs | Tous |
| **Demandes partenariat** | Validation des demandes externes | Admin, Manager |
| **Communications** | Réunions, documents, notifications par partenaire | Tous |
| **RH — Employés** | Gestion complète des employés, salaires | RH, Admin |
| **RH — Recrutements** | Suivi des recrutements étudiants | RH, Admin |
| **RH — Événements** | Organisation des événements partenaires | RH, Admin, Manager |
| **Mon Profil** | Modification profil + changement mot de passe | Tous |

### Portail Partenaire (`/partner`)

| Module | Description |
|--------|-------------|
| **Tableau de bord** | Vue d'ensemble personnalisée selon la catégorie |
| **Mes Offres** | Offres en cours avec le partenaire |
| **Mes Événements** | Événements organisés avec Capgemini |
| **Mes Documents** | Upload et téléchargement de documents |
| **Notifications** | Historique des emails reçus + alertes système |
| **Mon Profil** | Modification des informations du partenaire |
| **Statistiques** | KPIs et métriques de performance |
| **Mes Contacts** | Contacts Capgemini dédiés |

### Pages publiques

| Page | URL |
|------|-----|
| Landing page | `/` |
| Solutions Capgemini | `/solutions` |
| Success Stories | `/success-stories` |
| Demande de partenariat | `/success-stories/apply` |
| Politique de confidentialité | `/privacy` |
| Conditions d'utilisation | `/terms` |

---

## 🏗️ Architecture du projet

```
capgemini-project/
├── app/                          # Next.js App Router
│   ├── api/                      # 30+ API Routes (backend)
│   │   ├── auth/                 # Login, Logout, Me, Change password
│   │   ├── partners/             # CRUD partenaires + statut
│   │   ├── partner/              # API portail partenaire (me, offers, events...)
│   │   ├── contacts/             # Gestion contacts
│   │   ├── offers/               # Gestion offres
│   │   ├── events/               # Gestion événements
│   │   ├── documents/            # Upload/Download documents
│   │   ├── meetings/             # Réunions
│   │   ├── notifications/        # Notifications & envoi emails
│   │   ├── hr/                   # RH (employés, recrutements)
│   │   ├── bi/                   # Business Intelligence
│   │   ├── status-history/       # Historique des statuts
│   │   ├── partnership-requests/ # Demandes de partenariat
│   │   └── success-stories/      # Success stories publiques
│   │
│   ├── auth/sign-in/             # Page de connexion
│   ├── dashboard/                # Portail employé (17 pages)
│   ├── partner/                  # Portail partenaire (15 pages)
│   └── (pages publiques)         # solutions, privacy, terms...
│
├── backend/                      # Logique serveur
│   ├── auth/                     # JWT (jose) + Session management
│   ├── db/
│   │   ├── config.ts             # Connexion Drizzle ORM
│   │   ├── schema/               # 15 tables PostgreSQL (Drizzle)
│   │   └── migrations/           # Migrations SQL versionnées
│   └── services/
│       └── email.ts              # Service Nodemailer (Gmail SMTP)
│
├── frontend/                     # Composants UI réutilisables
│   ├── components/
│   │   ├── ui/                   # 25+ composants shadcn/ui
│   │   ├── auth/                 # Login form, user menu
│   │   ├── dashboard/            # Sidebar, partner form
│   │   └── partner/              # Sidebar partenaire
│   ├── hooks/                    # useAuth, useToast
│   └── lib/                      # Utilitaires
│
├── scripts/                      # Scripts DB utilitaires
├── uploads/documents/            # Stockage des fichiers uploadés
├── middleware.ts                  # Protection des routes authentifiées
└── .env.local                    # Configuration (non versionné)
```

---

## 🛠️ Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Runtime** | Bun |
| **Langage** | TypeScript (strict mode) |
| **UI** | React 19.2.3 |
| **Styling** | Tailwind CSS v4 |
| **Composants UI** | shadcn/ui + Radix UI |
| **Animations** | Framer Motion |
| **Icônes** | Hugeicons |
| **ORM** | Drizzle ORM |
| **Base de données** | PostgreSQL 17 |
| **Authentification** | JWT via jose + bcryptjs |
| **Email** | Nodemailer (Gmail SMTP) |
| **Thème** | next-themes (clair / sombre) |
| **Notifications** | Sonner (toast system) |

---

## 📡 API Endpoints

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion (email + password) |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Utilisateur connecté |
| POST | `/api/auth/change-password` | Changer mot de passe |

### Partenaires (Employés)
| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| GET | `/api/partners` | Liste des partenaires | Tous |
| POST | `/api/partners/manage` | Créer un partenaire | Admin/Manager |
| PUT | `/api/partners/manage/[id]` | Modifier un partenaire | Admin/Manager |
| DELETE | `/api/partners/manage?id=X` | Supprimer un partenaire | Admin/Manager |
| POST | `/api/partners/status` | Suspendre/Réactiver | Admin/Manager |

### Communications
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/meetings?partnerId=X` | Réunions d'un partenaire |
| POST | `/api/meetings` | Créer une réunion |
| DELETE | `/api/meetings?id=X` | Supprimer une réunion |
| GET | `/api/notifications?partnerId=X` | Notifications d'un partenaire |
| POST | `/api/notifications` | Envoyer notification + email |
| PATCH | `/api/notifications` | Marquer comme lu |

### Documents
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/documents?partnerId=X` | Liste documents |
| POST | `/api/documents` | Upload (multipart/form-data) |
| DELETE | `/api/documents?id=X` | Supprimer |
| GET | `/api/documents/download?id=X` | Télécharger |

### Ressources Humaines
| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| GET | `/api/hr/employees` | Liste tous les employés | RH/Admin |
| PATCH | `/api/hr/employees` | Modifier (salaire, rôle...) | RH/Admin |
| GET | `/api/hr/recruitments` | Liste recrutements étudiants | RH/Admin |
| POST | `/api/hr/recruitments` | Créer un recrutement | RH/Admin |
| DELETE | `/api/hr/recruitments?id=X` | Supprimer | RH/Admin |

### Autres
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST/DELETE | `/api/contacts` | Contacts partenaires |
| GET/POST/DELETE | `/api/offers` | Offres commerciales |
| GET/POST/DELETE | `/api/events` | Événements |
| GET | `/api/bi` | Données Dashboard BI |
| GET | `/api/status-history` | Historique des statuts |
| GET/POST | `/api/partnership-requests` | Demandes de partenariat |

---

## 🗄️ Base de données

### Tables (15+)

| Table | Description |
|-------|-------------|
| `partners` | Partenaires (nom, catégorie, statut, pays, email...) |
| `capgemini_employees` | Employés (email, rôle, salaire, département...) |
| `partner_contacts` | Contacts des partenaires |
| `offers` | Offres commerciales |
| `partner_events` | Événements organisés |
| `partner_documents` | Documents uploadés (métadonnées) |
| `partner_meetings` | Réunions avec partenaires |
| `partner_notifications` | Notifications et historique emails |
| `partner_kpis` | KPIs de performance |
| `partner_status_history` | Historique changements de statut |
| `student_recruitments` | Recrutements étudiants |
| `partnership_requests` | Demandes de partenariat externes |
| `client_partners` | Sous-type : partenaires clients |
| `marketing_partners` | Sous-type : partenaires marketing |
| `university_partners` | Sous-type : partenaires universitaires |
| `technology_partners` | Sous-type : partenaires technologiques |
| `vendor_projects` | Projets fournisseurs |

### Catégories de partenaires

| Catégorie | Code | Fonctionnalités spécifiques |
|-----------|------|---------------------------|
| Client | `customer` | CA, projets actifs, contrats |
| Marketing | `marketing` | Campagnes, ROI, leads, conversions |
| Fournisseur | `supplier` | Certifications, projets, SLA |
| Université | `university` | Recrutements, conventions, stages |

---

## 🔒 Sécurité

- **JWT httpOnly cookies** — Tokens stockés dans des cookies sécurisés (pas en localStorage)
- **Hachage bcrypt** — Mots de passe hachés avec un coût de 10
- **Middleware de protection** — Routes `/dashboard/*` et `/partner/*` protégées
- **Contrôle d'accès par rôle** — Chaque API vérifie le rôle de l'utilisateur
- **Variables d'environnement** — `.env*` exclu de Git
- **Validation côté serveur** — Toutes les entrées sont validées avant traitement
- **Upload sécurisé** — Validation du type et de la taille des fichiers

---

## 📜 Scripts utilitaires

```bash
node scripts/reset-passwords.js          # Réinitialiser les mots de passe employés
node scripts/setup-partner-accounts.js    # Configurer les comptes partenaires
node scripts/check-tables.js              # Vérifier les tables de la BDD
node scripts/explore-db.js                # Explorer la structure de la BDD
```

---

**Dernière mise à jour** : Avril 2026
