"use client";

import { useAuth } from "@/frontend/hooks/use-auth";
import { Button } from "@/frontend/components/ui/button";
import { Card } from "@/frontend/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/frontend/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout02Icon } from "@hugeicons/core-free-icons";
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
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || "U")}&backgroundColor=0070AD&textColor=ffffff&fontWeight=700&fontSize=40`}
                    alt={user.name || "Avatar"}
                  />
                  <AvatarFallback className="bg-primary text-white font-bold text-lg">
                    {(user.name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Indicateur en ligne */}
                <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-background" />
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
