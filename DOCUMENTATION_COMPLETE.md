# ═══════════════════════════════════════════════════════════════════
# 📘 DOCUMENTATION COMPLÈTE — IntelliConnect
# Plateforme de Gestion des Partenariats — Capgemini Tunisie
# ═══════════════════════════════════════════════════════════════════

# Date de génération : Avril 2026
# Projet : IntelliConnect — capgemini-project
# ═══════════════════════════════════════════════════════════════════

---

# TABLE DES MATIÈRES

1.  [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2.  [Architecture technique](#2-architecture-technique)
3.  [Système d'authentification](#3-système-dauthentification)
4.  [Rôles et permissions](#4-rôles-et-permissions)
5.  [Comptes de test et mots de passe](#5-comptes-de-test-et-mots-de-passe)
6.  [Portail Employé — Dashboard](#6-portail-employé--dashboard)
7.  [Portail Partenaire](#7-portail-partenaire)
8.  [Pages publiques](#8-pages-publiques)
9.  [Gestion des partenaires](#9-gestion-des-partenaires)
10. [Système de communications](#10-système-de-communications)
11. [Gestion documentaire](#11-gestion-documentaire)
12. [Modules RH](#12-modules-rh)
13. [Dashboard Business Intelligence](#13-dashboard-business-intelligence)
14. [Système de notifications et emails](#14-système-de-notifications-et-emails)
15. [Demandes de partenariat](#15-demandes-de-partenariat)
16. [Base de données — Schémas complets](#16-base-de-données--schémas-complets)
17. [Tous les API Endpoints](#17-tous-les-api-endpoints)
18. [Sécurité et bonnes pratiques](#18-sécurité-et-bonnes-pratiques)
19. [Guide de déploiement](#19-guide-de-déploiement)
20. [FAQ et dépannage](#20-faq-et-dépannage)

---

# 1. VUE D'ENSEMBLE DU PROJET

## Qu'est-ce qu'IntelliConnect ?

IntelliConnect est une plateforme web complète développée pour Capgemini Tunisie.
Elle permet de gérer l'ensemble du cycle de vie des partenariats : de la demande
initiale de partenariat jusqu'au suivi des KPIs, en passant par les réunions,
documents, événements, notifications par email, et les analytics.

## Objectifs principaux

- **Centraliser** la gestion de tous les partenaires (clients, fournisseurs, universités, marketing)
- **Automatiser** les communications (emails, notifications, rappels)
- **Piloter** la performance via des dashboards BI
- **Faciliter** le recrutement via les partenaires universitaires
- **Offrir** un portail dédié aux partenaires pour qu'ils gèrent leur propre espace

## Deux portails principaux

| Portail | URL de base | Utilisateurs |
|---------|-------------|-------------|
| **Employé** | `/dashboard` | Employés Capgemini (admin, manager, commercial, analyst, rh) |
| **Partenaire** | `/partner` | Partenaires externes (clients, fournisseurs, universités, marketing) |

## Logique métier globale

```
                    ┌────────────────────────┐
                    │  SITE PUBLIC (/)        │
                    │  • Landing page          │
                    │  • Solutions              │
                    │  • Success stories        │
                    │  • Demande partenariat    │
                    └──────────┬───────────────┘
                               │
             ┌─────────────────┼────────────────────┐
             ▼                                       ▼
   ┌─────────────────┐                    ┌─────────────────┐
   │  PORTAIL EMPLOYÉ │                    │ PORTAIL PARTENAIRE │
   │  /dashboard       │                    │ /partner            │
   │                   │   ◄── Gérer ──►    │                     │
   │  • Partenaires    │                    │  • Mon dashboard    │
   │  • Contacts       │                    │  • Mes offres       │
   │  • Offres         │                    │  • Mes événements   │
   │  • Événements     │                    │  • Mes documents    │
   │  • Documents      │                    │  • Notifications    │
   │  • Communications │                    │  • Mon profil       │
   │  • RH (employés,  │                    │  • Statistiques     │
   │    recrutements)  │                    │  • Mes contacts     │
   │  • Dashboard BI   │                    │  • (Univ: Recrut.)  │
   │  • Mon profil     │                    │  • (Fourn: Projets) │
   └─────────────────┘                    └─────────────────┘
```

---

# 2. ARCHITECTURE TECHNIQUE

## Stack technologique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Framework | Next.js 16.1.6 (App Router) | Frontend + Backend (API Routes) |
| Runtime | Bun | Gestionnaire de paquets et runtime JavaScript |
| Langage | TypeScript (strict mode) | Typage statique |
| UI Library | React 19.2.3 | Composants réactifs |
| Styling | Tailwind CSS v4 | Styles utilitaires |
| Composants UI | shadcn/ui + Radix UI | Composants accessibles |
| Animations | Framer Motion | Animations fluides |
| Icônes | Hugeicons | Bibliothèque d'icônes |
| ORM | Drizzle ORM | Requêtes type-safe vers PostgreSQL |
| Base de données | PostgreSQL 17 | Stockage principal |
| Auth | JWT (jose) + bcryptjs | Authentification et hachage |
| Email | Nodemailer (Gmail SMTP) | Envoi d'emails |
| Thème | next-themes | Mode clair/sombre |
| Toasts | Sonner | Notifications toast |

## Structure des dossiers

```
capgemini-project/
│
├── app/                              ← Next.js App Router (pages + API)
│   ├── layout.tsx                    ← Layout racine (metadata, providers)
│   ├── page.tsx                      ← Landing page publique
│   ├── globals.css                   ← Styles globaux + thème Tailwind
│   │
│   ├── auth/
│   │   └── sign-in/page.tsx          ← Page de connexion
│   │
│   ├── api/                          ← 30+ API Routes (backend)
│   │   ├── auth/                     ← login, logout, me, change-password
│   │   ├── partners/                 ← CRUD partenaires + négociation + statut
│   │   ├── partner/                  ← API du portail partenaire (/me, offers, events...)
│   │   ├── contacts/                 ← Gestion des contacts
│   │   ├── offers/                   ← Gestion des offres
│   │   ├── events/                   ← Gestion des événements
│   │   ├── documents/                ← Upload, download, liste
│   │   ├── meetings/                 ← Réunions employé-partenaire
│   │   ├── notifications/            ← Notifications + envoi email
│   │   ├── hr/                       ← RH : employés + recrutements
│   │   ├── bi/                       ← Business Intelligence (KPIs)
│   │   ├── status-history/           ← Historique des changements de statut
│   │   ├── partnership-requests/     ← Demandes de partenariat publiques
│   │   └── success-stories/          ← Success stories publiques
│   │
│   ├── dashboard/                    ← Portail employé (17+ pages)
│   │   ├── partners/                 ← Liste + détails + communications
│   │   ├── contacts/                 ← Contacts des partenaires
│   │   ├── offers/                   ← Offres commerciales
│   │   ├── bi/                       ← Dashboard analytics
│   │   ├── hr/                       ← RH (employés, recrutements, événements)
│   │   ├── partnership-requests/     ← Gestion des demandes
│   │   ├── status-history/           ← Historique
│   │   ├── profile/                  ← Mon profil + changement mot de passe
│   │   └── events/                   ← Redirection → /dashboard/hr/events
│   │
│   ├── partner/                      ← Portail partenaire (15+ pages)
│   │   ├── page.tsx                  ← Dashboard partenaire
│   │   ├── offers/                   ← Mes offres
│   │   ├── events/                   ← Mes événements
│   │   ├── documents/                ← Mes documents
│   │   ├── notifications/            ← Notifications reçues
│   │   ├── profile/                  ← Mon profil
│   │   ├── stats/                    ← Mes statistiques
│   │   ├── contacts/                 ← Mes contacts Capgemini
│   │   ├── recruitments/             ← Recrutements (universités seulement)
│   │   └── projects/                 ← Projets (fournisseurs seulement)
│   │
│   ├── solutions/                    ← Page Solutions Capgemini
│   ├── success-stories/              ← Success stories + formulaire de demande
│   ├── privacy/                      ← Politique de confidentialité
│   └── terms/                        ← Conditions d'utilisation
│
├── backend/                          ← Logique serveur
│   ├── auth/
│   │   ├── jwt.ts                    ← Création/vérification JWT (jose)
│   │   └── session.ts                ← Extraction user depuis cookie
│   ├── db/
│   │   ├── config.ts                 ← Connexion Drizzle ORM ← DATABASE_URL
│   │   ├── schema/                   ← 15+ tables PostgreSQL définies en Drizzle
│   │   │   ├── partners.ts           ← Table partenaires principale
│   │   │   ├── capgemini-employees.ts← Employés Capgemini
│   │   │   ├── partner-contacts.ts   ← Contacts des partenaires
│   │   │   ├── offers.ts             ← Offres commerciales
│   │   │   ├── partner-events.ts     ← Événements
│   │   │   ├── partner-documents.ts  ← Documents uploadés
│   │   │   ├── partner-meetings.ts   ← Réunions
│   │   │   ├── partner-notifications.ts ← Notifications
│   │   │   ├── partner-kpis.ts       ← KPIs de performance
│   │   │   ├── status-history.ts     ← Historique des statuts
│   │   │   ├── student-recruitments.ts ← Recrutements étudiants
│   │   │   ├── partnership-requests.ts ← Demandes de partenariat
│   │   │   ├── client-partners.ts    ← Sous-type client
│   │   │   ├── marketing-partners.ts ← Sous-type marketing
│   │   │   ├── university-partners.ts← Sous-type université
│   │   │   ├── technology-partners.ts← Sous-type fournisseur
│   │   │   └── vendor-projects.ts    ← Projets fournisseurs
│   │   └── migrations/               ← Migrations SQL versionnées
│   └── services/
│       └── email.ts                  ← Service d'envoi d'emails (Nodemailer)
│
├── frontend/                         ← Composants UI réutilisables
│   ├── components/
│   │   ├── ui/                       ← 25+ composants shadcn/ui
│   │   ├── auth/                     ← LoginForm, UserMenu
│   │   ├── dashboard/                ← Sidebar employé, PartnerForm
│   │   └── partner/                  ← Sidebar partenaire
│   ├── hooks/                        ← useAuth, useToast
│   └── lib/                          ← Utilitaires frontend
│
├── scripts/                          ← Scripts utilitaires de BDD
│   ├── reset-passwords.js            ← Réinitialiser mots de passe employés
│   ├── setup-partner-accounts.js     ← Configurer comptes partenaires
│   ├── check-tables.js               ← Vérifier les tables
│   └── explore-db.js                 ← Explorer la structure BDD
│
├── uploads/documents/                ← Stockage physique des documents uploadés
├── middleware.ts                      ← Protection des routes authentifiées
├── .env.local                         ← Variables d'environnement (NON versionné)
├── .env.example                       ← Template d'environnement (versionné)
└── README.md                          ← Documentation d'installation
```

---

# 3. SYSTÈME D'AUTHENTIFICATION

## Comment ça fonctionne ?

L'application utilise un système d'authentification basé sur **JWT (JSON Web Tokens)**
stockés dans des **cookies httpOnly**. C'est plus sécurisé que le localStorage car
les cookies httpOnly ne sont pas accessibles via JavaScript côté client.

## Flux complet de connexion

### Étape 1 : L'utilisateur va sur /auth/sign-in

La page de connexion présente un formulaire avec :
- **Email** (champ texte)
- **Mot de passe** (champ texte masqué)
- **Type d'utilisateur** : "Employé Capgemini" ou "Partenaire" (sélecteur)

### Étape 2 : Soumission du formulaire

```
POST /api/auth/login
Body: {
  "email": "khaled.maatoug@capgemini.com",
  "password": "Capgemini2024!",
  "userType": "employee"
}
```

### Étape 3 : Vérification côté serveur

1. Le serveur vérifie que l'email existe dans la table correspondante :
   - `userType === "employee"` → cherche dans `capgemini_employees`
   - `userType === "partner"` → cherche dans `partners`
2. Vérifie que le compte est actif (`isActive = true`)
3. Compare le mot de passe avec le hash bcrypt stocké en BDD
4. Si tout est OK → génère un JWT

### Étape 4 : Création du JWT

Le token JWT contient :
```json
{
  "sub": "7",                              // ID de l'utilisateur
  "email": "khaled.maatoug@capgemini.com",
  "name": "Khaled Maatoug",
  "role": "admin",                         // Rôle (employés seulement)
  "userType": "employee",                  // Type : employee ou partner
  "category": null                         // Catégorie (partenaires seulement)
}
```

Signé avec `JWT_SECRET` via la librairie `jose`. Expire après 7 jours.

### Étape 5 : Cookie httpOnly

Le token est stocké dans un cookie sécurisé :
```
Set-Cookie: session_token=eyJhbGci...
  httpOnly: true      ← Pas accessible via JavaScript
  secure: true        ← HTTPS seulement en production
  sameSite: lax       ← Protection CSRF basique
  maxAge: 604800      ← 7 jours
  path: /             ← Accessible sur tout le site
```

### Étape 6 : Redirection

- **Employés** → `/dashboard/partners` (liste des partenaires)
- **Partenaires** → `/partner` (tableaux de bord partenaire)

### Étape 7 : Middleware de protection

Le fichier `middleware.ts` intercepte TOUTES les requêtes vers :
- `/dashboard/*` — Portail employé
- `/partner/*` — Portail partenaire
- `/admin/*` — Administration

Si le cookie `session_token` est absent → redirection vers `/auth/sign-in`.

### Déconnexion

`POST /api/auth/logout` → Supprime le cookie `session_token` → Redirection vers `/auth/sign-in`.

---

# 4. RÔLES ET PERMISSIONS

## Rôles des employés

| Rôle | Description | Qui ? |
|------|-------------|-------|
| **admin** | Accès total à toutes les fonctionnalités | Khaled Maatoug |
| **manager** | Gestion des partenaires + demandes + événements | Karim Mejri, Sami Trabelsi |
| **commercial** | Consultation + communications + négociation | Leila Ben Ali, Ahmed Gharbi |
| **analyst** | Consultation + Dashboard BI | Nadia Haddad |
| **rh** | Gestion RH (employés, recrutements, événements) | Mouna Baccar |

## Matrice d'accès détaillée (Portail Employé)

| Fonctionnalité | admin | manager | commercial | analyst | rh |
|----------------|-------|---------|------------|---------|--------|
| Voir partenaires | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer/modifier partenaire | ✅ | ✅ | ❌ | ❌ | ❌ |
| Supprimer partenaire | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suspendre/réactiver | ✅ | ✅ | ❌ | ❌ | ❌ |
| Voir contacts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gérer contacts | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir offres | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gérer offres | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dashboard BI | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir historique statuts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Demandes partenariat | ✅ | ✅ | ❌ | ❌ | ❌ |
| Communications (réunions) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Envoyer notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload documents | ✅ | ✅ | ✅ | ✅ | ✅ |
| RH — Employés | ✅ | ❌ | ❌ | ❌ | ✅ |
| RH — Recrutements | ✅ | ❌ | ❌ | ❌ | ✅ |
| RH — Événements | ✅ | ✅ | ❌ | ❌ | ✅ |
| Mon profil | ✅ | ✅ | ✅ | ✅ | ✅ |
| Changer mot de passe | ✅ | ✅ | ✅ | ✅ | ✅ |
| Négocier partenariats | ❌ | ✅ | ✅ | ❌ | ❌ |

## Catégories de partenaires

| Catégorie | Code | Menu spécial | Fonctionnalités uniques |
|-----------|------|-------------|------------------------|
| Client | `customer` | — | CA, projets actifs, contrats |
| Marketing | `marketing` | — | Campagnes, ROI, leads, conversions |
| Fournisseur | `supplier` | Projets | Certifications, SLA, commissions |
| Université | `university` | Recrutements | Stages, alternances, conventions |

---

# 5. COMPTES DE TEST ET MOTS DE PASSE

## ⚠️ INFORMATIONS CONFIDENTIELLES — NE PAS PARTAGER

### Employés Capgemini

**Mot de passe commun : `Capgemini2024!`**

| Prénom Nom | Email | Rôle | Département | Salaire (TND) |
|-----------|-------|------|-------------|---------------|
| Khaled Maatoug | khaled.maatoug@capgemini.com | admin | Direction | 5 000 |
| Karim Mejri | karim.mejri@capgemini.com | manager | Business Development | 4 500 |
| Sami Trabelsi | sami.trabelsi@capgemini.com | manager | Partnerships | 4 200 |
| Leila Ben Ali | leila.benali@capgemini.com | commercial | Sales | 3 500 |
| Ahmed Gharbi | ahmed.gharbi@capgemini.com | commercial | Sales | 3 200 |
| Nadia Haddad | nadia.haddad@capgemini.com | analyst | Analytics | 3 800 |
| Mouna Baccar | mouna.baccar@capgemini.com | rh | Ressources Humaines | 3 500 |

### Partenaires

**Mot de passe commun : `Partner2024!`**

Exemples de comptes partenaires :

| Partenaire | Email | Catégorie |
|-----------|-------|-----------|
| Microsoft Tunisie | partenariats@microsoft.tn | Fournisseur |
| ENIT | bureau-entreprises@enit.rnu.tn | Université |
| IHEC Carthage | carriere@ihec.rnu.tn | Université |
| Lafayette | service.clients@lafayette.tn | Marketing |
| Coca-Cola Tunisie | contact@cocacola.tn | Marketing |

### Réinitialisation des mots de passe

Si vous devez remettre les mots de passe par défaut :

```bash
# Réinitialiser les mots de passe de TOUS les employés à "Capgemini2024!"
node scripts/reset-passwords.js

# Réinitialiser les mots de passe de TOUS les partenaires à "Partner2024!"
node scripts/setup-partner-accounts.js
```

### Connexion au système

1. Ouvrir http://localhost:3000/auth/sign-in
2. Choisir le type : "Employé Capgemini" ou "Partenaire"
3. Entrer l'email et le mot de passe
4. Cliquer sur "Se connecter"

**Exemple concret - Connexion Admin :**
```
Type : Employé Capgemini
Email : khaled.maatoug@capgemini.com
Mot de passe : Capgemini2024!
→ Redirigé vers /dashboard/partners
```

**Exemple concret - Connexion Partenaire Université :**
```
Type : Partenaire
Email : bureau-entreprises@enit.rnu.tn
Mot de passe : Partner2024!
→ Redirigé vers /partner (dashboard partenaire)
→ Voit le menu spécial "Recrutements" (car université)
```

---

# 6. PORTAIL EMPLOYÉ — DASHBOARD

## 6.1 Partenaires (`/dashboard/partners`)

### Description
Page principale du portail employé. Affiche la liste de TOUS les partenaires
avec filtrage avancé et actions rapides.

### Fonctionnalités
- **Tableau complet** : Nom, catégorie, statut, niveau, email, pays
- **Recherche** : Filtre en temps réel par nom
- **Filtres** : Par catégorie (client/marketing/fournisseur/université)
- **Actions par partenaire** :
  - 👁 Voir détails → `/dashboard/partners/[id]`
  - ✏️ Modifier (admin/manager)
  - 🗑 Supprimer (admin/manager)
  - 📞 Communications → page réunions + notifications
  - 📄 Documents → upload/téléchargement
- **Création** : Bouton "Ajouter un partenaire" (admin/manager)

### Exemple concret
Karim (manager) se connecte. Il voit la liste des 25 partenaires.
Il cherche "Microsoft" dans la barre de recherche. Il clique sur l'icône "Communications"
pour accéder à la page de réunions et notifications de Microsoft Tunisie.

### Suspension / Réactivation
Les admins et managers peuvent suspendre un partenaire (changer son statut
de "actif" à "suspendu"). Un partenaire suspendu peut toujours se connecter
mais voit un message d'avertissement. La réactivation remet le statut à "actif".

## 6.2 Contacts (`/dashboard/contacts`)

### Description
Gestion des contacts associés à chaque partenaire (ex : le directeur commercial
d'un partenaire client, le responsable stages d'une université).

### Fonctionnalités
- Affichage par partenaire
- Ajout de contact : prénom, nom, email, téléphone, rôle, contact principal (oui/non)
- Modification et suppression
- Indicateur de contact principal (un par partenaire)

## 6.3 Offres (`/dashboard/offers`)

### Description
Suivi des offres commerciales échangées avec les partenaires.

### Fonctionnalités
- Liste des offres avec : titre, description, réduction, audience cible
- Création d'offre associée à un partenaire
- Dates de validité (début/fin)
- Montant total en TND
- Statut (active/inactive)

## 6.4 Historique des statuts (`/dashboard/status-history`)

### Description
Journal chronologique de tous les changements de statut des partenaires.

### Informations affichées
- Partenaire concerné
- Ancien statut → Nouveau statut
- Date du changement
- Qui a effectué le changement
- Raison du changement (si fournie)

### Exemple concret
```
Partenaire: Microsoft Tunisie
Changement: actif → suspendu
Date: 15/03/2026
Par: Karim Mejri (manager)
Raison: "Contrat arrivé à terme, en attente de renouvellement"
```

## 6.5 Dashboard BI (`/dashboard/bi`)

### Description
Tableau de bord analytique alimenté par un Data Warehouse séparé.
Affiche les KPIs clés de l'activité partenariat.

### KPIs affichés
- **Répartition par catégorie** : Combien de partenaires par type
- **Répartition par statut** : Actifs vs suspendus vs en attente
- **Répartition par niveau** : Gold, Silver, Bronze, Standard
- **Top 10 des revenus** : Les partenaires qui génèrent le plus de CA
- **Résumé événements** : Nombre total, participants, budget, revenus
- **Résumé projets** : Nombre, valeur totale, satisfaction moyenne
- **Résumé recrutements** : Éudiants recrutés, convertis en CDI

### Prérequis technique
Ce dashboard nécessite un Data Warehouse séparé (`DW_DATABASE_URL` dans .env.local).
Sans ce DW, la page affiche un message d'erreur.

## 6.6 Demandes de partenariat (`/dashboard/partnership-requests`)

### Description
Les entreprises externes peuvent soumettre une demande de partenariat via
le formulaire public. Les admins et managers voient ces demandes ici.

### Flux complet
```
1. Une entreprise remplit le formulaire sur /success-stories/apply
2. La demande arrive avec le statut "en_attente"
3. Un admin ou manager consulte la demande
4. Il peut :
   - ✅ Accepter → crée automatiquement le partenaire dans le système
   - ❌ Refuser → avec une raison de refus
5. Un email est envoyé au demandeur (si SMTP configuré)
```

### Informations dans une demande
- Nom de l'entreprise, forme juridique
- Contact (prénom, nom, email, téléphone, rôle)
- Site web, adresse, pays
- Nombre d'employés, CA annuel
- Catégorie souhaitée (client/marketing/fournisseur/université)
- Motivations pour le partenariat
- Données spécifiques (université : type d'institution, spécialités, etc.)

## 6.7 Communications (`/dashboard/partners/[id]/communications`)

### Description
Page centralisée pour communiquer avec un partenaire spécifique.
Accessible via le bouton "Communications" sur la page de liste des partenaires.

### Trois sections

#### 📅 Réunions
- **Créer une réunion** : Titre, date, durée, type (présentiel/visioconférence/téléphonique), lieu, agenda
- **Consulter** : Historique de toutes les réunions avec ce partenaire
- **Informations post-réunion** : Conclusions, accords, prochaines étapes, score de satisfaction
- **Supprimer** une réunion

#### 🔔 Notifications
- **Envoyer une notification** : Titre, message, type (email/système/meeting/document/status_change)
- **Envoi d'email** : Si un sujet d'email est fourni, un vrai email est envoyé via Gmail SMTP
- **Historique** : Liste de toutes les notifications envoyées au partenaire
- **Statut email** : Indicateur si l'email a été effectivement envoyé

#### 📄 Documents
- **Upload** : Glisser-déposer un fichier (max 50 Mo, formats bureautiques + images)
- **Liste** : Tous les documents partagés avec ce partenaire
- **Télécharger** : Télécharger directement un document
- **Supprimer** un document

### Exemple concret
```
Scénario : Karim (manager) veut organiser une réunion avec l'ENIT

1. Il va sur /dashboard/partners → cherche "ENIT" → clique "Communications"
2. Section Réunions → "Nouvelle réunion"
   - Titre : "Revue annuelle du partenariat ENIT-Capgemini"
   - Date : 25/04/2026 à 10h00
   - Durée : 90 minutes
   - Type : Présentiel
   - Lieu : "Siège Capgemini Tunis, Salle Carthage"
   - Agenda : "Bilan stages 2025, Convention 2026, Événements"
3. Il clique "Créer" → La réunion apparaît dans l'historique
4. Il envoie une notification :
   - Titre : "Invitation : Revue annuelle"
   - Message : "Réunion prévue le 25/04 à 10h..."
   - Sujet email : "Invitation - Revue partenariat"
   → Un email est envoyé à bureau-entreprises@enit.rnu.tn
5. Il uploade le PDF de l'ordre du jour dans la section Documents
```

## 6.8 Mon profil (`/dashboard/profile`)

### Description
Page de profil personnel de l'employé connecté.

### Fonctionnalités
- Affichage : nom, email, rôle
- **Changement de mot de passe** :
  - Mot de passe actuel (vérification)
  - Nouveau mot de passe (minimum 8 caractères)
  - Confirmation du nouveau mot de passe
- **Commercial uniquement** : Formulaire de demande de partenariat + négociation de partenariats

---

# 7. PORTAIL PARTENAIRE

## 7.1 Dashboard (`/partner`)

### Description
Page d'accueil du partenaire après connexion. Affiche un résumé de son activité
et de sa relation avec Capgemini.

### Informations affichées
- Nom de l'entreprise et statut du partenariat
- Catégorie et niveau de partenariat (badges)
- Cartes statistiques :
  - Nombre d'offres actives
  - Nombre d'événements
  - Nombre de contacts Capgemini
  - Classement dans sa catégorie
  - Satisfaction moyenne globale et par catégorie
  - Budget annuel
- Liens rapides vers les sections principales

## 7.2 Mes Offres (`/partner/offers`)

- Liste des offres associées à ce partenaire
- Détails : titre, description, type de réduction, nombre d'utilisations
- Création d'une nouvelle offre

## 7.3 Mes Événements (`/partner/events`)

- Liste des événements organisés avec Capgemini
- Informations : nom, date, lieu, participants, budget
- Badges de statut : planifié, en cours, terminé, annulé
- Création d'un nouvel événement

## 7.4 Mes Documents (`/partner/documents`)

- Upload de documents depuis le portail partenaire
- Liste de tous les documents partagés
- Téléchargement direct
- Métadonnées : nom, taille, date, uploadé par

## 7.5 Notifications (`/partner/notifications`)

- Historique de toutes les notifications reçues de Capgemini
- Types : email, système, réunion, document, changement de statut
- Indicateur d'email envoyé
- Marquage comme lu/non lu

## 7.6 Mon Profil (`/partner/profile`)

- Modification des informations : nom, email, téléphone, site web, adresse
- Upload/modification du logo
- Description de l'entreprise
- Changement de mot de passe
- **Universités** : Modification des données spécifiques (type d'institution, spécialités, etc.)
- **Fournisseurs** : Modification des données tech (certifications, technologies, accords)

## 7.7 Statistiques (`/partner/stats`)

- Nombre total d'offres et d'événements
- Données de participation aux événements
- Utilisation du budget
- Scores de satisfaction
- Tendances

## 7.8 Mes Contacts (`/partner/contacts`)

- Liste des contacts Capgemini dédiés à ce partenaire
- Informations : prénom, nom, email, téléphone, rôle
- Indicateur de contact principal
- Ajout de nouveau contact

## 7.9 Recrutements — Universités uniquement (`/partner/recruitments`)

- Visible UNIQUEMENT pour les partenaires de catégorie "university"
- Liste des étudiants recrutés via ce partenariat
- Informations : nom, email, type de contrat, dates, spécialisation
- Suivi de la conversion en CDI

## 7.10 Projets — Fournisseurs uniquement (`/partner/projects`)

- Visible UNIQUEMENT pour les partenaires de catégorie "supplier"
- Liste des projets réalisés avec Capgemini
- Informations : nom du projet, client, technologies, durée, valeur
- Statut de livraison : planifié, en cours, terminé, annulé
- Budget et commissions

---

# 8. PAGES PUBLIQUES

## 8.1 Landing Page (`/`)

La page d'accueil présente IntelliConnect avec :
- **Header fixe** : Logo Capgemini, navigation, toggle thème, bouton connexion
- **Section Hero** : Titre accrocheur avec effets de glassmorphism et gradient animé
  - CTA "Devenir partenaire" → `/success-stories/apply`
  - CTA "Se connecter" → `/auth/sign-in`
- **Section Why Capgemini** : Arguments pour devenir partenaire
- **Footer** : Liens utiles, informations de contact

## 8.2 Solutions (`/solutions`)

Présentation des solutions offertes par Capgemini Tunisie :
stratégie, transformation digitale, IA, cloud, etc.

## 8.3 Success Stories (`/success-stories`)

Histoires de succès des partenariats existants.
Bouton "Devenir partenaire" qui mène au formulaire de demande.

## 8.4 Formulaire de demande (`/success-stories/apply`)

Formulaire public permettant à toute entreprise de déposer une demande
de partenariat. Voir la section "Demandes de partenariat" pour le détail.

## 8.5 Politique de confidentialité (`/privacy`)

Page légale décrivant la politique de protection des données.

## 8.6 Conditions d'utilisation (`/terms`)

Page légale décrivant les conditions d'utilisation de la plateforme.

---

# 9. GESTION DES PARTENAIRES

## Cycle de vie d'un partenaire

```
┌──────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Demande de   │ ──► │  Review   │ ──► │  Créé    │ ──► │   Actif      │
│  partenariat  │     │ (admin/   │     │ dans     │     │  (opérationnel)│
│  (externe)    │     │  manager) │     │  le      │     │              │
│               │     │           │     │ système  │     │              │
└──────────────┘     └──────────┘     └──────────┘     └───────┬──────┘
                          │                                      │
                     ❌ Refusé                             ┌─────┴────┐
                                                           │          │
                                                      ⏸ Suspendu   🗑 Supprimé
                                                           │
                                                      ▶ Réactivé
                                                           │
                                                      ┌────┴──┐
                                                      │ Actif  │
                                                      └────────┘
```

## Création manuelle d'un partenaire

Un admin ou manager peut créer un partenaire directement via le formulaire :

1. Aller sur `/dashboard/partners`
2. Cliquer "Ajouter un partenaire"
3. Remplir les champs :
   - **Obligatoires** : Nom, catégorie
   - **Recommandés** : Email, téléphone, pays, description
   - **Optionnels** : Site web, logo, taxId, budget annuel, niveau de partenariat
4. Selon la catégorie, des champs supplémentaires apparaissent :
   - **Université** : Type d'institution, spécialités, nombre de stages...
   - **Fournisseur** : Technologies, certifications, type de vendeur...
5. Le partenaire est créé avec un mot de passe par défaut hashé

## Les 4 catégories en détail

### Client (`customer`)
Entreprises qui achètent des services Capgemini.
- Champs spécifiques : type de client, industrie, CA annuel, projets actifs
- Exemple : Une banque tunisienne qui utilise les services IT de Capgemini

### Marketing (`marketing`)
Partenaires de co-marketing et de communication.
- Champs spécifiques : type marketing, leads générés, taux de conversion, budget marketing
- Exemple : Une agence de pub qui co-organise des événements avec Capgemini

### Fournisseur (`supplier`)
Éditeurs de logiciels et fournisseurs technologiques.
- Champs spécifiques : type de vendeur, technologies, certifications, commissions, projets
- Sous-entité : `vendor_projects` pour suivre chaque projet
- Exemple : Microsoft Tunisie qui fournit les licences Azure

### Université (`university`)
Institutions académiques pour le recrutement et les événements.
- Champs spécifiques : type d'institution, spécialités, stages, alternances, conventions
- Sous-entité : `student_recruitments` pour suivre chaque étudiant recruté
- Exemple : ENIT qui envoie des stagiaires chaque été

---

# 10. SYSTÈME DE COMMUNICATIONS

## Vue d'ensemble

Chaque partenaire dispose d'un espace de communication dédié comprenant
trois volets : réunions, notifications, et documents.

## Réunions

### Création d'une réunion

**Champs obligatoires :**
- Titre (ex : "Revue trimestrielle Q2 2026")
- Date et heure
- Durée en minutes
- Type : présentiel, visioconférence, ou téléphonique

**Champs optionnels :**
- Lieu (ex : "Siège Capgemini, Lac 2, Tunis")
- Agenda (ordre du jour détaillé)
- Conclusions (rempli après la réunion)
- Accords (décisions prises)
- Prochaines étapes
- Score de satisfaction (0-100)
- Documents partagés

### Types de réunions
| Type | Code | Usage |
|------|------|-------|
| Présentiel | `presentiel` | Rendez-vous physique |
| Visioconférence | `visioconference` | Teams, Zoom, Meet |
| Téléphonique | `telephonique` | Appel téléphonique |

## Notifications

### Types de notifications
| Type | Code | Quand l'utiliser |
|------|------|-----------------|
| Email | `email` | Communication officielle |
| Système | `system` | Alerte automatique |
| Réunion | `meeting` | Rappel de réunion |
| Document | `document` | Nouveau document partagé |
| Changement de statut | `status_change` | Suspension, réactivation |
| Général | `general` | Autre type |

### Envoi d'email

Quand une notification inclut un sujet d'email (`emailSubject`), un vrai
email est envoyé via Gmail SMTP. Le système enregistre si l'email a été
effectivement envoyé (champ `emailSent`).

**Note développement** : En mode développement, tous les emails sont
redirigés vers `kenzaachouk@gmail.com` pour éviter d'envoyer de vrais
emails aux partenaires.

---

# 11. GESTION DOCUMENTAIRE

## Upload de fichiers

### Formats acceptés
`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.csv`, `.ppt`, `.pptx`,
`.txt`, `.rtf`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.zip`, `.rar`

### Taille maximale
50 Mo par fichier.

### Processus d'upload

```
1. L'utilisateur sélectionne un fichier
2. Le fichier est envoyé en FormData à POST /api/documents
3. Le serveur :
   a. Vérifie l'extension et la taille
   b. Génère un nom unique (hash aléatoire + extension)
   c. Écrit le fichier dans uploads/documents/
   d. Enregistre les métadonnées en BDD
4. Le document apparaît dans la liste
```

### Stockage
Les fichiers sont stockés physiquement dans le dossier `uploads/documents/`
du projet. Les métadonnées (nom original, taille, type, qui l'a uploadé)
sont stockées dans la table `partner_documents`.

### Téléchargement
Le endpoint `GET /api/documents/download?id=X` lit le fichier depuis le disque
et le renvoie en tant que pièce jointe avec le nom original du fichier.

---

# 12. MODULES RH

## 12.1 RH — Employés (`/dashboard/hr/employees`)

### Accès
RH et Admin uniquement.

### Fonctionnalités
- **Tableau des employés** : Nom, email, rôle, département, salaire, téléphone, statut
- **Cartes statistiques** :
  - Total employés
  - Employés actifs
  - Masse salariale totale (somme des salaires)
  - Salaire moyen
- **Édition en ligne** : Cliquer sur un employé pour modifier :
  - Salaire
  - Département
  - Téléphone
  - Rôle
  - Statut (actif/inactif)

### Exemple concret
```
Mouna (RH) veut augmenter le salaire de Leila Ben Ali de 3 500 à 3 800 TND.

1. Elle va sur /dashboard/hr/employees
2. Elle voit le tableau avec les 7 employés
3. Elle clique sur "Modifier" à côté de Leila Ben Ali
4. Elle change le salaire de 3500 à 3800
5. Elle clique "Sauvegarder"
6. Le nouveau salaire apparaît immédiatement
7. La carte "Masse salariale" se met à jour
```

## 12.2 RH — Recrutements (`/dashboard/hr/recruitments`)

### Accès
RH et Admin uniquement.

### Description
Suivi des étudiants recrutés via les partenariats universitaires.

### Champs d'un recrutement
- Partenaire universitaire (obligatoire)
- Étudiant : prénom, nom, email, téléphone
- Type de contrat : stage, alternance, VIE, CDI jeune diplômé, contrat pro
- Durée du contrat (mois)
- Dates de début et de fin
- Niveau de diplôme : Licence, Master, Doctorat
- Spécialisation et compétences
- Projet assigné, équipe, manager
- Scores : performance et satisfaction (0-100)
- Conversion en CDI : oui/non, date de CDI, fourchette salariale

### Exemple concret
```
Mouna (RH) enregistre un nouveau stagiaire venant de l'ENIT.

1. Elle va sur /dashboard/hr/recruitments
2. Elle clique "Nouveau recrutement"
3. Elle remplit :
   - Partenaire : ENIT
   - Étudiant : Mohamed Ben Salah
   - Email : m.bensalah@enit.rnu.tn
   - Type : Stage
   - Durée : 6 mois
   - Date début : 01/02/2026
   - Niveau : Master
   - Spécialisation : Génie Logiciel
   - Compétences : Python, React, SQL
   - Projet : "Migration Cloud Azure"
   - Équipe : DevOps
   - Manager : Karim Mejri
4. Le recrutement apparaît dans la liste
5. À la fin du stage, elle peut mettre à jour :
   - Performance score : 85/100
   - Satisfaction score : 90/100
   - Converti en CDI : Oui
   - Date CDI : 01/08/2026
```

## 12.3 RH — Événements (`/dashboard/hr/events`)

### Accès
RH, Admin et Manager.

### Description
Organisation et suivi des événements liés aux partenariats
(forums, journées portes ouvertes, séminaires, webinaires).

### Champs d'un événement
- Partenaire associé
- Nom de l'événement
- Description
- Lieu
- Date et heure
- Nombre de participants
- Budget alloué
- Revenus générés
- Type d'événement
- Statut : planifié, en cours, terminé, annulé

### Cartes statistiques
- Total événements
- Événements à venir
- Budget total alloué
- Participants totaux

---

# 13. DASHBOARD BUSINESS INTELLIGENCE

## Architecture

Le dashboard BI utilise un **Data Warehouse séparé** pour les analytics.
C'est une base PostgreSQL différente configurée via `DW_DATABASE_URL`.

## Tables du Data Warehouse

| Table | Contenu |
|-------|---------|
| `dim_partner` | Dimension partenaires (catégorie, statut, niveau) |
| `fact_partner_activity` | Faits d'activité (CA, satisfaction) |
| `fact_events` | Faits événements (participants, budget, revenus) |
| `fact_projects` | Faits projets (valeur, satisfaction client) |
| `fact_university_recruitment` | Faits recrutements (conversions CDI) |

## KPIs calculés

1. **Répartition par catégorie** : Nombre de partenaires par type
2. **Répartition par statut** : Actifs, suspendus, en attente
3. **Répartition par niveau** : Gold, Silver, Bronze, Standard
4. **Top 10 revenus** : Les 10 partenaires avec le plus gros CA
5. **Résumé événements** : Total, participants, budget, revenus
6. **Résumé projets** : Total, valeur, satisfaction moyenne
7. **Résumé recrutements** : Étudiants totaux, convertis CDI, satisfaction

---

# 14. SYSTÈME DE NOTIFICATIONS ET EMAILS

## Architecture email

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Employé     │ ──► │ API          │ ──► │ Nodemailer│ ──► Gmail SMTP ──► Destinataire
│  envoie      │     │ /api/notifs  │     │ (email.ts)│
│  notification│     │              │     │           │
└─────────────┘     └──────┬───────┘     └──────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ BDD          │
                    │ partner_     │
                    │ notifications│
                    └──────────────┘
```

## Configuration Gmail SMTP

1. Avoir un compte Gmail
2. Activer la vérification en 2 étapes
3. Créer un "mot de passe d'application" sur https://myaccount.google.com/apppasswords
4. Mettre le mot de passe dans `GMAIL_APP_PASSWORD` dans `.env.local`

## Mode développement

En mode dev, TOUS les emails sont renvoyés vers l'adresse de test
(`kenzaachouk@gmail.com`) au lieu de l'adresse réelle du partenaire.
Cela évite d'envoyer de vrais emails pendant les tests.

Pour changer ce comportement et envoyer aux vraies adresses, modifier
`TEST_EMAIL` dans `backend/services/email.ts`.

---

# 15. DEMANDES DE PARTENARIAT

## Processus complet

```
┌────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : Soumission publique                         │
│                                                        │
│  Une entreprise visite /success-stories/apply           │
│  Elle remplit le formulaire avec :                      │
│  • Infos entreprise (nom, taille, CA)                   │
│  • Infos contact (nom, email, téléphone)                │
│  • Catégorie souhaitée                                  │
│  • Motivations                                          │
│  • Données spécifiques (université/fournisseur)         │
│                                                        │
│  Statut initial : "en_attente"                          │
│  Un email d'alerte est envoyé aux admins                │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : Revue par admin/manager                     │
│                                                        │
│  Sur /dashboard/partnership-requests :                   │
│  • L'admin voit la demande avec tous les détails        │
│  • Il peut :                                            │
│    ✅ ACCEPTER → un partenaire est automatiquement       │
│       créé dans le système avec les infos fournies       │
│    ❌ REFUSER → une raison de refus est enregistrée      │
│                                                        │
│  Qui a reviewé et quand est enregistré                  │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│  ÉTAPE 3 : Si accepté                                  │
│                                                        │
│  • Le partenaire est créé dans la table `partners`      │
│  • Son ID est lié à la demande (createdPartnerId)       │
│  • Il peut se connecter avec son email + mot de passe    │
│    par défaut                                           │
│  • Il accède au portail partenaire /partner              │
└────────────────────────────────────────────────────────┘
```

---

# 16. BASE DE DONNÉES — SCHÉMAS COMPLETS

## Table `partners` (principale)

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant unique |
| categories | varchar(50) | customer, marketing, supplier, university |
| name | varchar(200) | Nom de l'entreprise |
| legalName | varchar(200) | Raison sociale |
| email | varchar(100) | Email principal |
| phone | varchar(20) | Téléphone |
| website | varchar(200) | Site web |
| address | text | Adresse postale |
| logoUrl | text | URL du logo |
| description | text | Description |
| taxId | varchar(50) | Matricule fiscal |
| partnerSubcategory | varchar(100) | Sous-catégorie |
| partnershipLevel | varchar(50) | Niveau (Gold, Silver, Bronze, Standard) |
| partnershipStartDate | date | Date de début du partenariat |
| partnershipStatus | varchar(50) | Statut (actif, suspendu, en_attente) |
| annualBudgetTnd | bigint | Budget annuel en TND |
| satisfactionScore | integer | Score de satisfaction (0-100) |
| numEmployees | bigint | Nombre d'employés |
| country | varchar(100) | Pays (défaut : "Tunisie") |
| contractEndDate | date | Date de fin de contrat |
| passwordHash | text | Hash bcrypt du mot de passe |
| lastEventDate | date | Dernier événement |
| annualRevenueGenerated | integer | CA généré annuellement |
| updatedAt | timestamp | Dernière mise à jour |

## Table `capgemini_employees`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant unique |
| email | varchar(100) UNIQUE | Email professionnel |
| firstName | varchar(100) | Prénom |
| lastName | varchar(100) | Nom |
| role | varchar(50) | admin, manager, commercial, analyst, rh |
| department | varchar(100) | Département |
| salary | integer | Salaire mensuel en TND |
| phone | varchar(20) | Téléphone |
| isActive | boolean | Compte actif |
| passwordHash | text | Hash bcrypt |
| hireDate | date | Date d'embauche |
| createdAt | timestamp | Création |
| updatedAt | timestamp | Dernière mise à jour |

## Table `partner_contacts`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant |
| partnerId | integer FK | Partenaire associé |
| firstName | varchar(100) | Prénom |
| lastName | varchar(100) | Nom |
| email | varchar(100) | Email |
| phone | varchar(50) | Téléphone |
| role | varchar(100) | Rôle/poste |
| isPrimary | boolean | Contact principal |
| createdAt | timestamp | Date de création |

## Table `partner_meetings`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant |
| partnerId | integer FK | Partenaire |
| title | varchar(255) | Titre de la réunion |
| meetingDate | timestamp | Date et heure |
| durationMinutes | integer | Durée en minutes |
| employeeName | varchar(200) | Nom de l'employé |
| employeeRole | varchar(100) | Rôle de l'employé |
| employeeId | integer | ID de l'employé |
| location | varchar(255) | Lieu |
| meetingType | varchar(50) | presentiel, visioconference, telephonique |
| agenda | text | Ordre du jour |
| conclusions | text | Conclusions |
| remarks | text | Remarques |
| agreements | text | Accords |
| sharedDocuments | text | Documents partagés |
| satisfactionScore | integer | Score de satisfaction |
| nextSteps | text | Prochaines étapes |
| createdAt | timestamp | Date de création |

## Table `partner_notifications`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant |
| partnerId | integer FK | Partenaire |
| type | varchar(50) | email, system, meeting, document, status_change, general |
| title | varchar(255) | Titre |
| message | text | Message |
| emailSent | boolean | Email envoyé ? |
| emailSubject | varchar(255) | Sujet de l'email |
| isRead | boolean | Lu ? |
| sentBy | varchar(200) | Nom de l'expéditeur |
| sentById | integer | ID de l'expéditeur |
| createdAt | timestamp | Date de création |

## Table `partner_documents`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant |
| partnerId | integer FK | Partenaire |
| fileName | varchar(255) | Nom stocké (hash) |
| originalName | varchar(255) | Nom original du fichier |
| fileType | varchar(100) | Type MIME |
| fileSize | bigint | Taille en octets |
| filePath | text | Chemin sur le disque |
| description | text | Description |
| uploadedBy | varchar(200) | Nom de l'uploadeur |
| uploadedByType | varchar(20) | employee ou partner |
| uploadedById | integer | ID de l'uploadeur |
| createdAt | timestamp | Date de création |

## Table `student_recruitments`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant |
| universityPartnerId | integer FK | Partenaire universitaire |
| studentFirstName | varchar(100) | Prénom de l'étudiant |
| studentLastName | varchar(100) | Nom de l'étudiant |
| studentEmail | varchar(100) | Email |
| studentPhone | varchar(50) | Téléphone |
| recruitmentType | varchar(50) | stage, alternance, vie, cdi_jeune_diplome, contrat_pro |
| contractDurationMonths | integer | Durée du contrat |
| startDate | date | Date de début |
| endDate | date | Date de fin |
| degreeLevel | varchar(50) | Licence, Master, Doctorat |
| specialization | varchar(255) | Spécialisation |
| skills | text[] | Compétences (tableau) |
| assignedProject | varchar(255) | Projet assigné |
| assignedTeam | varchar(100) | Équipe |
| managerName | varchar(255) | Manager |
| managerEmail | varchar(100) | Email du manager |
| performanceScore | integer | Note de performance (0-100) |
| satisfactionScore | integer | Note de satisfaction (0-100) |
| convertedToCdi | boolean | Converti en CDI ? |
| cdiStartDate | date | Date de début CDI |
| cdiSalaryRange | varchar(50) | Fourchette salariale CDI |
| notes | text | Notes |
| createdAt/updatedAt | timestamp | Dates |

## Table `partnership_requests`

| Colonne | Type | Description |
|---------|------|-------------|
| id | serial PK | Identifiant |
| companyName | varchar(255) | Nom de l'entreprise |
| legalName | varchar(255) | Raison sociale |
| contactFirstName | varchar(100) | Prénom du contact |
| contactLastName | varchar(100) | Nom du contact |
| contactEmail | varchar(255) | Email du contact |
| contactPhone | varchar(50) | Téléphone |
| contactRole | varchar(100) | Rôle/poste |
| website | varchar(255) | Site web |
| description | text | Description |
| country | varchar(100) | Pays |
| address | text | Adresse |
| numEmployees | integer | Nombre d'employés |
| annualRevenue | varchar(100) | CA annuel |
| category | varchar(50) | Catégorie demandée |
| partnerSubcategory | varchar(100) | Sous-catégorie |
| partnershipLevel | varchar(50) | Niveau souhaité |
| motivations | text | Motivations |
| universityData | jsonb | Données université (JSON) |
| technologyData | jsonb | Données technologie (JSON) |
| status | varchar(50) | en_attente, acceptee, refusee |
| isAccepted | boolean | Accepté ? |
| reviewedBy | integer | ID du reviewer |
| reviewedAt | timestamp | Date de review |
| rejectionReason | text | Raison du refus |
| createdPartnerId | integer | ID du partenaire créé |
| createdAt | timestamp | Date de soumission |

## Tables sous-types partenaires

### `client_partners`
Données spécifiques aux clients : clientType, industry, annualRevenue, numActiveProjects

### `marketing_partners`  
Données spécifiques au marketing : marketingType, leadsGeneratedPerYear, conversionRate, annualMarketingBudget

### `university_partners`
Données spécifiques aux universités : institutionType, numStudents, specialties (text[]),
numInternsPerYear, numApprenticesPerYear, numHiresPerYear, conversionRateToCdi,
hasFrameworkAgreement, agreementSignedDate, annualSponsorshipBudget, budgetBreakdown (jsonb)

### `technology_partners`
Données spécifiques aux fournisseurs : vendorType, technologies (text[]),
certificationsHeld, certificationLevel, partnershipModel, commissionRate, discountRate,
numProjectsPerYear, numLicensesSold, hasMasterAgreement, hasDedicatedSupport, supportSlaHours

### `vendor_projects`
Projets des fournisseurs : projectName, clientName, technologiesUsed (text[]),
projectValue, licenseCost, servicesCost, commissionEarned, deliveryStatus,
clientSatisfactionScore

---

# 17. TOUS LES API ENDPOINTS

## Authentification

| Méthode | Route | Auth? | Description |
|---------|-------|-------|-------------|
| POST | /api/auth/login | Non | Connexion (email, password, userType) |
| POST | /api/auth/logout | Oui | Déconnexion (supprime le cookie) |
| GET | /api/auth/me | Oui | Retourne l'utilisateur connecté |
| POST | /api/auth/change-password | Oui | Changer le mot de passe |

## Partenaires

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | /api/partners | Tous auth | Liste tous les partenaires |
| GET | /api/partners?category=X | Tous auth | Filtrer par catégorie |
| POST | /api/partners/manage | admin, manager | Créer un partenaire |
| PUT | /api/partners/manage | admin, manager | Modifier un partenaire |
| DELETE | /api/partners/manage?id=X | admin, manager | Supprimer un partenaire |
| POST | /api/partners/status | admin, manager | Suspendre/réactiver |
| GET | /api/partners/negotiate | manager, commercial | Liste des prospects |
| POST | /api/partners/negotiate | manager, commercial | Activer/terminer partenariat |

## Portail Partenaire

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/partner/me | Infos du partenaire connecté |
| GET | /api/partner/offers | Mes offres |
| POST | /api/partner/offers | Créer une offre |
| GET | /api/partner/events | Mes événements |
| POST | /api/partner/events | Créer un événement |
| GET | /api/partner/contacts | Mes contacts |
| POST | /api/partner/contacts | Ajouter un contact |
| DELETE | /api/partner/contacts?id=X | Supprimer un contact |
| GET | /api/partner/documents | Mes documents |
| POST | /api/partner/documents | Uploader un document |
| GET | /api/partner/stats | Mes statistiques |
| PATCH | /api/partner/profile | Modifier mon profil |
| GET | /api/partner/recruitments | Mes recrutements (université) |
| GET | /api/partner/projects | Mes projets (fournisseur) |

## Communications

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/meetings?partnerId=X | Liste des réunions |
| POST | /api/meetings | Créer une réunion |
| DELETE | /api/meetings?id=X | Supprimer une réunion |
| GET | /api/notifications?partnerId=X | Liste des notifications |
| POST | /api/notifications | Envoyer notification + email |
| PATCH | /api/notifications | Marquer comme lu |

## Documents

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/documents?partnerId=X | Liste des documents |
| POST | /api/documents | Upload (multipart/form-data) |
| DELETE | /api/documents?id=X | Supprimer un document |
| GET | /api/documents/download?id=X | Télécharger un fichier |

## Ressources Humaines

| Méthode | Route | Rôles | Description |
|---------|-------|-------|-------------|
| GET | /api/hr/employees | rh, admin | Liste des employés |
| PATCH | /api/hr/employees | rh, admin | Modifier un employé |
| GET | /api/hr/recruitments | rh, admin | Liste des recrutements |
| POST | /api/hr/recruitments | rh, admin | Créer un recrutement |
| DELETE | /api/hr/recruitments?id=X | rh, admin | Supprimer un recrutement |

## Autres

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST/DELETE | /api/contacts | Contacts partenaires |
| GET/POST/DELETE | /api/offers | Offres commerciales |
| GET/POST/DELETE | /api/events | Événements |
| GET | /api/bi | Données Dashboard BI |
| GET | /api/status-history | Historique des statuts |
| GET/POST | /api/partnership-requests | Demandes de partenariat |
| POST | /api/partnership-requests/[id]/review | Accepter/refuser demande |
| GET | /api/success-stories | Stories publiques |

---

# 18. SÉCURITÉ ET BONNES PRATIQUES

## Mesures de sécurité implémentées

| Mesure | Détail |
|--------|--------|
| JWT httpOnly | Tokens stockés en cookies sécurisés, pas en localStorage |
| Hachage bcrypt | Mots de passe hachés avec un coût de 10 rounds |
| Middleware | Routes /dashboard/*, /partner/*, /admin/* protégées |
| Contrôle de rôle | Chaque API vérifie le rôle avant d'agir |
| Variables env | .env* exclu de Git, secrets jamais versionnés |
| Validation serveur | Toutes les entrées validées côté serveur |
| Upload sécurisé | Vérification extension + taille max 50 Mo |
| CSRF partiel | sameSite: lax sur les cookies |

## Bonnes pratiques de développement

- **TypeScript strict** : Typage obligatoire pour toutes les props et réponses
- **Validation côté serveur** : Ne jamais faire confiance aux données client
- **Gestion d'erreurs** : Try-catch systématique avec messages appropriés
- **Pas de secrets dans le code** : Utiliser `.env.local` pour tout secret
- **Bun uniquement** : Ne jamais utiliser npm, yarn ou pnpm

---

# 19. GUIDE DE DÉPLOIEMENT

## Prérequis production

1. **Serveur** : Node.js 18+ ou Bun 1.0+
2. **Base de données** : PostgreSQL 15+
3. **SMTP** : Compte Gmail avec mot de passe d'application
4. **Domaine** : Configurer NEXT_PUBLIC_APP_URL

## Étapes

```bash
# 1. Cloner et installer
git clone [repo-url]
cd capgemini-project
bun install

# 2. Configurer l'environnement
cp .env.example .env.local
# Modifier les valeurs (DATABASE_URL, JWT_SECRET, GMAIL_*)

# 3. Initialiser la base
# Créer la DB PostgreSQL
# Exécuter les migrations Drizzle
bun run db:migrate

# 4. Initialiser les comptes
node scripts/reset-passwords.js
node scripts/setup-partner-accounts.js

# 5. Build et lancement
bun run build
bun start
```

## Variables d'environnement obligatoires

| Variable | Obligatoire | Description |
|----------|------------|-------------|
| DATABASE_URL | ✅ | URL PostgreSQL principale |
| JWT_SECRET | ✅ | Clé secrète pour les tokens JWT |
| NEXT_PUBLIC_APP_URL | ✅ | URL publique de l'app |
| DW_DATABASE_URL | ❌ | URL du Data Warehouse (pour le BI) |
| GMAIL_USER | ❌ | Adresse Gmail pour SMTP |
| GMAIL_APP_PASSWORD | ❌ | Mot de passe d'application Gmail |
| OPENROUTER_KEY | ❌ | Clé API OpenRouter (IA) |

---

# 20. FAQ ET DÉPANNAGE

## Q: Le build échoue avec une erreur de middleware

Le warning "experimental middleware" est normal avec Next.js 16.
Le build compile quand même (exit code peut être 1 mais le message
"Compiled successfully" confirme le succès).

## Q: Les emails ne sont pas envoyés

1. Vérifier que `GMAIL_USER` et `GMAIL_APP_PASSWORD` sont définis dans `.env.local`
2. Le mot de passe d'application doit être créé sur https://myaccount.google.com/apppasswords
3. En mode dev, les emails vont à `kenzaachouk@gmail.com` — c'est normal

## Q: La page BI est vide / erreur

Le dashboard BI nécessite un Data Warehouse séparé (`DW_DATABASE_URL`).
Sans cette BDD, la page affiche une erreur. C'est normal si le DW n'est pas configuré.

## Q: Comment ajouter un nouvel employé via la BDD ?

```sql
INSERT INTO capgemini_employees (email, first_name, last_name, role, department, salary, phone, is_active, password_hash, hire_date)
VALUES ('nom.prenom@capgemini.com', 'Prénom', 'Nom', 'commercial', 'Sales', 3500, '+216 XX XXX XXX', true,
  '$2a$10$...hash_bcrypt...', '2026-01-15');
```
Ou utiliser `node scripts/reset-passwords.js` après insertion pour définir un mot de passe.

## Q: Comment réinitialiser TOUS les mots de passe ?

```bash
node scripts/reset-passwords.js          # Employés → Capgemini2024!
node scripts/setup-partner-accounts.js    # Partenaires → Partner2024!
```

## Q: Le upload de fichier échoue

Vérifier que le dossier `uploads/documents/` existe à la racine du projet.
Si non, le créer : `mkdir -p uploads/documents`

## Q: Où sont stockés les fichiers uploadés ?

Physiquement dans `uploads/documents/` avec un nom haché.
Les métadonnées (nom original, taille, type) sont en BDD dans `partner_documents`.

---

# FIN DE LA DOCUMENTATION

Document généré automatiquement pour le projet IntelliConnect — Capgemini Tunisie.
Pour toute question, consulter le README.md du projet ou le fichier AGENTS.md
pour les standards de développement.
