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

## � FORM DESIGN SYSTEM - STANDARD MODAL FORM

### Règle d'Or
**TOUS les formulaires de l'application DOIVENT suivre le design modal standardisé.** Aucune exception autorisée.

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

---

**Dernière mise à jour** : 16 Février 2026  
**Version** : 1.0.0  

