"use client";

import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TestToastPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/50 p-4 flex justify-between items-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour
        </Link>
        <ThemeToggle variant="ghost" size="icon" />
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-8 text-center">Test des Toasts</h1>

        <Button
          onClick={() => toast.success("Partenaire ajouté avec succès !")}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          ✅ Toast Success
        </Button>

        <Button
          onClick={() => toast.error("Erreur : connexion impossible")}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          ❌ Toast Error
        </Button>

        <Button
          onClick={() => toast.warning("Attention : session expire bientôt")}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          ⚠️ Toast Warning
        </Button>

        <Button
          onClick={() => toast.info("Nouvelle mise à jour disponible")}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          ℹ️ Toast Info
        </Button>

        <Button
          onClick={() => {
            const id = toast.loading("Chargement en cours...");
            setTimeout(() => {
              toast.success("Terminé !", { id });
            }, 2000);
          }}
          className="w-full"
        >
          🔄 Toast Loading
        </Button>
        </div>
      </div>
    </div>
  );
}
