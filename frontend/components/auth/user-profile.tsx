"use client";

import { useAuth } from "@/frontend/hooks/use-auth";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout02Icon, User02Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card className="border border-border/50 shadow-lg bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                <HugeiconsIcon icon={User02Icon} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bienvenue, {user.name} !</h1>
                <p className="text-sm text-muted-foreground">
                  {user.userType === "employee"
                    ? `Employé Capgemini · ${user.role}`
                    : `Partenaire · ${user.category}`}
                </p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">
              <HugeiconsIcon icon={Logout02Icon} className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border/50 shadow-lg p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Email</h3>
          <p className="text-sm font-medium">{user.email}</p>
        </Card>
        <Card className="border border-border/50 shadow-lg p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Type</h3>
          <p className="text-sm font-medium">
            {user.userType === "employee" ? "Employé Capgemini" : "Partenaire"}
          </p>
        </Card>
        <Card className="border border-border/50 shadow-lg p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            {user.userType === "employee" ? "Rôle" : "Catégorie"}
          </h3>
          <p className="text-sm font-medium capitalize">
            {user.userType === "employee" ? user.role : user.category}
          </p>
        </Card>
      </div>
    </div>
  );
}
