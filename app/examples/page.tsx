"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { CapgeminiLogo, CapgeminiLogoSmall } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function ExamplesPage() {
  const [isLoading, setIsLoading] = useState(false);

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

  const showLoadingToast = () => {
    setIsLoading(true);
    toast.loading("Traitement en cours...");
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Opération terminée !");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <CapgeminiLogo size="md" />
          </Link>
          <nav className="flex items-center gap-4">
            <ThemeToggle variant="ghost" size="icon" />
            <Link href="/">
              <Button variant="ghost">Accueil</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Exemples d'Utilisation
          </h1>
          <p className="text-muted-foreground text-lg">
            Guide d'utilisation des composants standards du projet
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Toast Examples */}
          <Card className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <CapgeminiLogoSmall size="md" />
              <h2 className="text-2xl font-semibold text-foreground">
                Notifications Toast
              </h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Utilisez toujours le système toast unifié pour toutes les notifications.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={showSuccessToast} variant="default">
                Succès
              </Button>
              <Button onClick={showErrorToast} variant="destructive">
                Erreur
              </Button>
              <Button onClick={showWarningToast} className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:text-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30">
                Attention
              </Button>
              <Button onClick={showInfoToast} variant="outline">
                Information
              </Button>
              <Button 
                onClick={showLoadingToast} 
                disabled={isLoading}
                className="sm:col-span-2"
              >
                {isLoading ? "Chargement..." : "Test Loading"}
              </Button>
            </div>
          </Card>

          {/* Logo Examples */}
          <Card className="p-6 border-accent/20 bg-accent/5">
            <div className="flex items-center gap-3 mb-6">
              <CapgeminiLogoSmall size="md" />
              <h2 className="text-2xl font-semibold text-foreground">
                Logos Capgemini
              </h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Utilisez les tailles standardisées pour tous les logos.
            </p>

            <div className="space-y-6">
              {/* Logo complet */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Logo complet
                </h3>
                <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg bg-background/50 border border-border">
                  <div className="text-center">
                    <CapgeminiLogo size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">sm</p>
                  </div>
                  <div className="text-center">
                    <CapgeminiLogo size="md" />
                    <p className="text-xs text-muted-foreground mt-1">md</p>
                  </div>
                  <div className="text-center">
                    <CapgeminiLogo size="lg" />
                    <p className="text-xs text-muted-foreground mt-1">lg</p>
                  </div>
                </div>
              </div>

              {/* Logo small */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Icône uniquement
                </h3>
                <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg bg-background/50 border border-border">
                  <div className="text-center">
                    <CapgeminiLogoSmall size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">sm</p>
                  </div>
                  <div className="text-center">
                    <CapgeminiLogoSmall size="md" />
                    <p className="text-xs text-muted-foreground mt-1">md</p>
                  </div>
                  <div className="text-center">
                    <CapgeminiLogoSmall size="lg" />
                    <p className="text-xs text-muted-foreground mt-1">lg</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Code Examples */}
        <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Exemples de code</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Toast System</h4>
              <pre className="text-sm text-muted-foreground overflow-x-auto bg-background p-3 rounded border">
{`import { toast } from "@/components/ui/toast";

// Success
toast.success("Opération réussie", { 
  description: "Description optionnelle" 
});

// Error
toast.error("Erreur", { 
  description: "Message d'erreur" 
});

// Warning
toast.warning("Attention", { 
  description: "Message d'avertissement" 
});

// Info
toast.info("Information", { 
  description: "Message informatif" 
});`}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Logo System</h4>
              <pre className="text-sm text-muted-foreground overflow-x-auto bg-background p-3 rounded border">
{`import { CapgeminiLogo, CapgeminiLogoSmall } from "@/components/icons";

// Logo complet avec tailles
<CapgeminiLogo size="sm" /> // 120x32px
<CapgeminiLogo size="md" /> // 160x42px  
<CapgeminiLogo size="lg" /> // 200x52px

// Icône seule avec tailles
<CapgeminiLogoSmall size="sm" /> // 24x24px
<CapgeminiLogoSmall size="md" /> // 32x32px
<CapgeminiLogoSmall size="lg" /> // 40x40px`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
