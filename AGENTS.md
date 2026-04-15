# AGENTS.MD - Règles et Standards du Projet

Ce document contient toutes les règles et standards que tout AI assistant doit suivre lorsqu'il travaille sur ce projet Capgemini.

## 🎯 TOAST SYSTEM - NOTIFICATIONS STANDARD

### Règle d'Or
**TOUS les messages de notification dans l'application DOIVENT utiliser le système toast unifié.** Aucune autre méthode de notification n'est autorisée.

### Import Standard
```tsx
import { toast } from "@/components/ui/toast";
```

### Usage Standardisé
```tsx
// Success - Opérations réussies
toast.success("Opération réussie", {
  description: "Vos modifications ont été enregistrées avec succès."
});

// Error - Erreurs système/validation
toast.error("Une erreur est survenue", {
  description: "Impossible de contacter le serveur. Veuillez réessayer plus tard."
});

// Warning - Actions nécessitant attention
toast.warning("Attention requise", {
  description: "Votre session expirera dans 5 minutes."
});

// Info - Messages informatifs
toast.info("Information", {
  description: "Une nouvelle version de l'application est disponible."
});

// Loading - États de chargement
toast.loading("Chargement en cours...");
```

### Styles et Thèmes
- **Thème bleu Capgemini** : Utilise les variables CSS `--primary`, `--accent`
- **Dark mode support** : Adaptation automatique au thème système
- **Position** : `bottom-center` (fixe)
- **Durée** : 4 secondes par défaut
- **Animations** : Slide-in depuis le bas avec fade

### Actions et Boutons
```tsx
toast.info("Article supprimé", {
  description: "L'action peut être annulée.",
  action: {
    label: "Annuler",
    onClick: () => console.log("Action annulée")
  }
});
```

## 🎨 LOGO SYSTEM - TAILLES STANDARDISÉES

### Composants Disponibles
```tsx
import { CapgeminiLogo, CapgeminiLogoSmall } from "@/components/icons";
```

### Tailles Standard
- **sm** : Petit (mobile, icônes)
- **md** : Moyen (navigation par défaut)
- **lg** : Grand (headers, pages principales)
- **xl** : Très grand (hero sections)

### CapgeminiLogo (Version Complète)
```tsx
<CapgeminiLogo size="sm" /> // 120x32px
<CapgeminiLogo size="md" /> // 160x42px
<CapgeminiLogo size="lg" /> // 200x52px
<CapgeminiLogo size="xl" /> // 240x64px
```

### CapgeminiLogoSmall (Icône Seulement)
```tsx
<geminiLogoSmall size="sm" /> // 24x24px
<CapgeminiLogoSmall size="md" /> // 32x32px
<CapgeminiLogoSmall size="lg" /> // 40x40px
<CapgeminiLogoSmall size="xl" /> // 48x48px
```

### Thème et Couleurs
- **Mode clair** : Logo bleu officiel `#0070AD`
- **Mode sombre** : Logo blanc
- **Source officielle** : URLs capgemini.com (jamais de fichiers locaux)
- **Adaptation automatique** : Switch automatique selon le thème

### Usage Recommandé
```tsx
// Header principal
<CapgeminiLogo size="lg" className="mx-auto" />

// Navigation
<CapgeminiLogoSmall size="md" />

// Footer
<CapgeminiLogo size="sm" />

// Hero section
<CapgeminiLogo size="xl" />
```

## 🎨 DESIGN SYSTEM

### Couleurs Officielles Capgemini
```tsx
export const CAPGEMINI_COLORS = {
  blue: "#0070AD",      // Bleu principal
  blueLight: "#00A3E0", // Bleu clair
} as const;
```

### Thème CSS Variables
- `--primary` : Bleu Capgemini principal
- `--accent` : Variantes de bleu
- `--secondary` : Gris secondaire
- `--background` : Fond principal
- `--card` : Fond des cartes
- `--border` : Bordures

### Composants UI
- **Framework** : shadcn/ui avec style "radix-nova"
- **Icons** : Hugeicons
- **Animations** : Tailwind CSS + tw-animate-css
- **Responsive** : Mobile-first approach

## 📁 STRUCTURE DU PROJET

### Architecture
```
app/                 # App Router Next.js
├── auth/            # Pages d'authentification
├── dashboard/       # Tableau de bord
└── page.tsx         # Landing page

components/
├── ui/              # Composants shadcn/ui
├── icons.tsx        # Logos Capgemini
└── theme-toggle.tsx # Switch thème

lib/
├── utils.ts         # Utilitaires (cn function)
└── db/              # Configuration Drizzle ORM
```

### Pages Éliminées
- ❌ `/toast-demo` -> Intégré dans AGENTS.md
- ❌ `/test-logos` -> Intégré dans AGENTS.md

## 🔧 RÈGLES DE DÉVELOPPEMENT

### Package Manager - OBLIGATOIRE
**TOUS les projets doivent utiliser Bun comme gestionnaire de packages.** npm n'est jamais autorisé.

#### Installation de dépendances
```bash
bun add package-name
bun add -D dev-package-name
```

#### Scripts de développement
```bash
bun dev      # Démarrer le serveur de développement
bun build    # Construire pour la production
bun start    # Démarrer le serveur de production
bun run lint # Exécuter le linter
```

#### Gestion des mises à jour
```bash
bun update   # Mettre à jour toutes les dépendances
bun upgrade  # Mettre à jour Bun lui-même
```

### TypeScript
- **Strict mode** activé
- **Types obligatoires** pour tous les props
- **Interfaces exportées** pour la réutilisabilité

### CSS et Styling
- **Tailwind CSS** uniquement
- **Variables CSS** du thème shadcn
- **Pas de styles inline** sauf pour les dimensions dynamiques
- **Responsive design** obligatoire

### Composants
- **ForwardRef** pour les composants DOM
- **CVA (class-variance-authority)** pour les variantes
- **Props destructuring** avec valeurs par défaut
- **Documentation JSDoc** pour les composants complexes

### Performance
- **Dynamic imports** pour les composants lourds
- **Optimisation images** avec Next.js Image
- **Code splitting** automatique avec App Router

## 🎬 ANIMATION SYSTEM - FRAMER MOTION

### Règle d'Or
**TOUTES les animations de l'application DOIVENT utiliser Framer Motion.** Aucune exception autorisée.

### Technologies Animations
- **Next.js** : Plateforme principale
- **TailwindCSS** : Styles et transitions CSS
- **Framer Motion** : Animations fluides et interactives
- **Shadcn/UI** : Composants UI de base

### Imports Requis
```tsx
import { motion } from 'framer-motion';
import { animate, useSpring, useMotionValue } from 'framer-motion';
```

### Animations Standards
```tsx
// Animation au hover
<motion.div
  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
  className="card"
>

// Animation d'entrée
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>

// Animation au scroll
<motion.div
  whileInView={{ opacity: 1, x: 0 }}
  initial={{ opacity: 0, x: -50 }}
  viewport={{ once: true }}
>
```

### Cas d'Usage
- **Modales** : Animations d'entrée/sortie fluides
- **Boutons** : Micro-interactions (hover, tap)
- **Cartes** : Animations au survol et focus
- **Pages** : Transitions entre routes
- **Loading** : Animations de chargement élégantes

### Bonnes Pratiques
- Utiliser `whileHover` pour les interactions simples
- Préférer `initial`/`animate` pour les entrées
- Ajouter `layout` pour les animations de layout
- Utiliser `whileInView` pour les animations au scroll
- Garder les performances optimisées avec `layoutId`

## � dialogue DESIGN SYSTEM - STANDARD MODAL FORM

### Règle d'Or
**TOUS les dialogues de l'application DOIVENT suivre le design modal standardisé.** Aucune exception autorisée.

### Structure Standard
```tsx
<div className="w-full max-w-7xl mx-auto">
  {/* Modal Header */}
  <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-t-xl">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
        <HugeiconsIcon icon={YourIcon} className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Form Title</h2>
    </div>
    <div className="flex items-center gap-2">
      <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
        Cancel
      </Button>
      <Button type="submit" form="formId" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
        {loading ? "Loading..." : <><HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />Save</>}
      </Button>
    </div>
  </div>

  {/* Form Content */}
  <form id="formId" onSubmit={handleSubmit} className="space-y-6">
    <div className="p-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form fields here */}
      </div>
    </div>
  </form>
</div>
```

### Boutons Standard
- **Position** : En haut à droite dans le header
- **Cancel** : `variant="ghost"` avec `text-muted-foreground hover:text-foreground`
- **Save** : `bg-blue-600 hover:bg-blue-700 text-white font-medium`
- **Icône Save** : `CheckmarkSquare01Icon` de `@hugeicons/core-free-icons`
- **Loading state** : Texte dynamique avec `disabled={loading}`

### Header Requis
- **Icône gauche** : Dans conteneur `w-8 h-8 rounded-lg bg-primary/10`
- **Titre** : `text-xl font-semibold text-foreground`
- **Dégradé** : `bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5`
- **Bordure** : `border-b border-border`
- **Coins arrondis** : `rounded-t-xl`

### Organisation des Champs
- **Grille responsive** : `grid grid-cols-1 md:grid-cols-2 gap-4`
- **Espacement** : `space-y-2` pour chaque groupe label/input
- **Labels** : `text-sm font-semibold text-foreground`
- **Inputs** : Focus states avec `focus:ring-primary focus:border-primary`

### Onglets (Optionnel)
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <div className="px-6 pt-6">
    <TabsList className="grid w-full grid-cols-5 bg-muted/50 border border-border">
      <TabsTrigger value="basic" className="text-xs font-medium">Basic Informations</TabsTrigger>
      <TabsTrigger value="address" className="text-xs font-medium">Address Info</TabsTrigger>
      {/* Autres onglets... */}
    </TabsList>
  </div>
  
  <TabsContent value="basic" className="mt-0 space-y-4">
    {/* Contenu de l'onglet */}
  </TabsContent>
</Tabs>
```

### Gestion des Erreurs
```tsx
{errorMessage && (
  <div className="mx-6 mt-4">
    <Alert variant="destructive" className="text-sm border-red-200 dark:border-red-900">
      {errorMessage}
    </Alert>
  </div>
)}
```

### Messages de Succès
```tsx
{successMessage && (
  <div className="mx-6 mt-4">
    <Alert variant="default" className="text-sm border-primary/20 dark:border-primary/30 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary">
      {successMessage}
    </Alert>
  </div>
)}
```

### Imports Requis
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquare01Icon } from "@hugeicons/core-free-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Optionnel
```

### Exemples d'Utilisation
- **Formulaire Profil** : Informations utilisateur avec avatar
- **Changement Mot de Passe** : 3 champs (actuel, nouveau, confirmation)
- **Création Compte** : Formulaire d'inscription avec onglets
- **Configuration** : Paramètres avec sections multiples

### Checklist Avant Implémentation
- [ ] Header avec icône + titre + boutons Save/Cancel
- [ ] Boutons en bleu (`bg-blue-600`) en haut à droite
- [ ] Largeur maximale `max-w-7xl` pour tous les formulaires
- [ ] Grille responsive pour les champs
- [ ] Labels avec `text-sm font-semibold text-foreground`
- [ ] Gestion des erreurs et succès avec Alert
- [ ] Loading states sur tous les boutons
- [ ] Icône CheckmarkSquare01Icon pour Save
- [ ] Dégradé dans le header

---

## �� BONNES PRATIQUES

### Nommage
- **Composants** : PascalCase
- **Fichiers** : kebab-case
- **Variables** : camelCase
- **Constants** : UPPER_SNAKE_CASE

### Imports
```tsx
// Imports React
import * as React from "react";

// Imports Next.js
import Link from "next/link";

// Imports locaux (ordre alphabétique)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### Error Handling
- **Toast notifications** pour les erreurs utilisateur
- **Try-catch** pour les opérations async
- **Loading states** avec toast.loading()

### Accessibilité
- **ARIA labels** obligatoires
- **Keyboard navigation** support
- **Screen reader** compatibility

---

## 📋 CHECKLIST POUR AI ASSISTANTS

Avant de proposer du code :

- [ ] Utiliser le système toast pour toutes les notifications
- [ ] Utiliser les tailles de logo standardisées
- [ ] Suivre le thème bleu Capgemini
- [ ] Respecter la structure des dossiers
- [ ] Ajouter les types TypeScript
- [ ] Documenter les composants complexes
- [ ] Tester le responsive design
- [ ] Vérifier l'accessibilité

## 🔒 SENIOR ENGINEER QUALITY GATE

### Zero Tolerance Policy
These rules are NON-NEGOTIABLE. Any AI assistant or contributor violating them MUST fix before merge.

### TypeScript Discipline
- **NEVER** use `as any`, `@ts-ignore`, `@ts-expect-error` — fix the type, not the checker
- **NEVER** use `Function` type — use specific signatures `(arg: Type) => ReturnType`
- **NEVER** leave untyped function parameters — every param gets a type
- **ALWAYS** enable strict mode — `"strict": true` in tsconfig
- **PREFER** `unknown` over `any` when type is genuinely unknown, then narrow with guards
- **PREFER** discriminated unions over boolean flags for state machines
- **PREFER** `satisfies` for type-safe object literals: `const config = { ... } satisfies Config`

### Error Handling
- **NEVER** empty catch blocks `catch(e) {}` — log, rethrow, or handle meaningfully
- **NEVER** swallow errors silently — every catch must either recover or propagate
- **ALWAYS** use toast notifications for user-facing errors (see Toast System above)
- **ALWAYS** use structured error responses in API routes: `{ error: string, details?: unknown }`
- **ALWAYS** validate external input at API boundaries (request body, query params, URL params)
- **PREFER** early returns / guard clauses over deeply nested if-else

### Component Quality
- **NEVER** use inline styles except for truly dynamic values (computed widths, positions)
- **NEVER** hardcode colors — use CSS variables and Tailwind theme tokens
- **NEVER** use `<img>` — use Next.js `<Image>` for optimization
- **NEVER** use `<a>` for internal links — use Next.js `<Link>`
- **ALWAYS** add loading states to async operations (buttons, forms, data fetching)
- **ALWAYS** add error states to data-dependent components
- **ALWAYS** add empty states when data can be empty (tables, lists, grids)
- **ALWAYS** handle the 3 states: loading → error → success/empty
- **PREFER** server components by default, `'use client'` only when needed

### Data Fetching
- **NEVER** fetch inside useEffect for initial data — use server components or SWR/React Query
- **NEVER** store server state in useState — use proper cache (SWR, React Query, or server components)
- **ALWAYS** show loading skeletons, never blank white screens
- **ALWAYS** handle API error responses gracefully on the client
- **ALWAYS** debounce search inputs (300ms minimum)
- **PREFER** optimistic updates for better perceived performance

### API Routes
- **ALWAYS** authenticate first: `const user = await getSessionUser(req); if (!user) return 401`
- **ALWAYS** validate request body with zod or manual checks before processing
- **ALWAYS** wrap handler logic in try-catch with structured error response
- **ALWAYS** use correct HTTP methods (GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes)
- **NEVER** return 200 for errors — use proper status codes (400, 401, 403, 404, 500)
- **NEVER** expose internal error details to clients in production

### Performance
- **NEVER** load entire tables into memory — paginate with LIMIT/OFFSET or cursor
- **NEVER** N+1 query — use JOINs or batch queries
- **NEVER** bundle heavy libraries client-side without dynamic import
- **ALWAYS** use `dynamic(() => import(...), { ssr: false })` for heavy client components
- **ALWAYS** use database indexes for frequently queried columns
- **PREFER** server-side data aggregation over client-side computation

### Testing Mindset
- **ALWAYS** test the feature manually after implementation — lsp_diagnostics ≠ working software
- **ALWAYS** verify in both light and dark mode
- **ALWAYS** check responsive design (mobile, tablet, desktop)
- **ALWAYS** test with empty data, maximum data, and edge cases
- **NEVER** delete failing tests to make the build pass — fix the code

### Git Discipline
- **NEVER** commit .env, credentials, or secrets
- **NEVER** commit node_modules, .next, or build artifacts
- **ALWAYS** write meaningful commit messages: `feat:`, `fix:`, `refactor:`, `docs:`
- **ALWAYS** keep commits atomic — one logical change per commit
- **PREFER** small PRs over massive ones

### UI/UX Excellence
- **EVERY** interactive element needs a hover state
- **EVERY** clickable element needs a cursor: pointer
- **EVERY** form needs validation feedback (inline errors, not just toast)
- **EVERY** destructive action needs a confirmation dialog
- **EVERY** long operation needs a loading indicator
- **EVERY** table needs sorting on at least one column
- **EVERY** list needs an empty state message
- **NEVER** show raw database IDs, timestamps, or enum values to users — humanize them
- **NEVER** truncate text without a tooltip showing the full content
- **ALWAYS** use consistent spacing: 4px grid (p-1, p-2, p-4, p-6, p-8)
- **ALWAYS** use transition animations on state changes (hover, open/close, appear/disappear)
- **ALWAYS** use Framer Motion for page transitions and content reveals
- **ALWAYS** support keyboard navigation for all interactive elements

### AI Agent Standards
- **ALWAYS** use the AI SDK `tool()` pattern with zod `inputSchema` for type-safe tools
- **ALWAYS** stream responses with `toUIMessageStreamResponse()`
- **ALWAYS** include at least one visualization tool result per agent response (chart or table)
- **ALWAYS** query real database — never fabricate data
- **ALWAYS** handle tool execution errors gracefully and report them to the user
- **ALWAYS** persist chat threads and messages for continuity
- **NEVER** expose raw SQL or database errors to the user
- **NEVER** allow the agent to modify data — read-only tools only (unless explicitly approved)

---

**Dernière mise à jour** : 15 Avril 2026
**Version** : 2.0.0

