"use client";

import { useAuth } from "@/frontend/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const profileHref = user.userType === "partner" ? "/partner/profile" : "/dashboard/profile";
  const dashboardHref = user.userType === "partner" ? "/partner" : "/dashboard";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border/60 bg-background p-0 overflow-hidden shadow-sm transition-colors hover:bg-muted"
          aria-label="Ouvrir le menu utilisateur"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-semibold text-foreground">
            <span>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-primary font-medium mt-1">
              {user.userType === "employee" ? `Employé · ${user.role}` : `Partenaire · ${user.category}`}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={dashboardHref}>Tableau de bord</a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href={profileHref}>Mon Profil</a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} disabled={loading} className="text-red-600 focus:text-red-600">
          {loading ? "Déconnexion..." : "Se déconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
