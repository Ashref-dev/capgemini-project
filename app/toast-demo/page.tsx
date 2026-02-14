"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

/**
 * Page de démonstration des toasts Sonner.
 * Exemples : Success, Error, Warning, Info, Custom avec bouton d'action.
 */
export default function ToastDemoPage() {
  const showSuccessToast = () => {
    toast.success("Opération réussie !", {
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  const showErrorToast = () => {
    toast.error("Une erreur est survenue", {
      description: "Impossible de contacter le serveur. Veuillez réessayer plus tard.",
    });
  };

  const showWarningToast = () => {
    toast.warning("Attention requise", {
      description: "Votre session expirera dans 5 minutes.",
    });
  };

  const showInfoToast = () => {
    toast.info("Information", {
      description: "Une nouvelle version de l'application est disponible.",
    });
  };

  const showCustomToastWithAction = () => {
    toast.info("Article supprimé", {
      description: "L'action peut être annulée.",
    });
  };

  const showCustomToastWithCancel = () => {
    toast.warning("Confirmer la suppression ?", {
      description: "Cette action est irréversible.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            Capgemini
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Accueil</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Démonstration des Toasts
          </h1>
          <p className="text-muted-foreground text-lg">
            Composant Sonner avec thème bleu et support du mode sombre
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">✓</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Toast Success
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notification de succès pour les opérations réussies.
            </p>
            <Button onClick={showSuccessToast} variant="default">
              Afficher Success
            </Button>
          </Card>

          <Card className="p-6 border-destructive/20 bg-destructive/5 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">✕</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Toast Error
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notification d&apos;erreur pour les échecs d&apos;opération.
            </p>
            <Button onClick={showErrorToast} variant="destructive">
              Afficher Error
            </Button>
          </Card>

          <Card className="p-6 border-amber-500/20 bg-amber-500/5 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">⚠</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Toast Warning
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notification d&apos;avertissement pour les alertes.
            </p>
            <Button
              onClick={showWarningToast}
              className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:text-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30"
            >
              Afficher Warning
            </Button>
          </Card>

          <Card className="p-6 border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">ℹ</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Toast Info
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Notification informative pour les messages généraux.
            </p>
            <Button onClick={showInfoToast} variant="outline">
              Afficher Info
            </Button>
          </Card>

          <Card className="p-6 md:col-span-2 border-secondary/20 bg-secondary/5 hover:shadow-lg transition-shadow">
            <div className="text-2xl mb-3">🔘</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Toast Custom avec bouton d&apos;action
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Toast personnalisé avec bouton d&apos;action et option d&apos;annulation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={showCustomToastWithAction} variant="secondary">
                Toast avec Action
              </Button>
              <Button onClick={showCustomToastWithCancel} variant="outline">
                Toast avec Action & Annuler
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
          <h4 className="font-semibold text-foreground mb-2">Usage dans le code</h4>
          <pre className="text-sm text-muted-foreground overflow-x-auto">
{`import { toast } from "@/components/ui/toast";

// Success
toast.success("Titre", { description: "Description optionnelle" });

// Error
toast.error("Erreur", { description: "Message d'erreur" });

// Warning
toast.warning("Attention", { description: "Message d'avertissement" });

// Info
toast.info("Info", { description: "Message informatif" });

// Custom avec action
toast("Message", {
  description: "Description",
  action: { label: "Action", onClick: () => {} },
  cancel: { label: "Annuler", onClick: () => {} },
});`}
          </pre>
        </div>
      </main>
    </div>
  );
}
