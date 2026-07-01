"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || "U")}&backgroundColor=0070AD&textColor=ffffff&fontWeight=700`}
              alt={user.name || "Avatar"}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {(user.name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Indicateur en ligne */}
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
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

        {user.userType === "employee" && (
          <>
            <DropdownMenuItem asChild>
              <a href="/dashboard/status-history">Historique statuts</a>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} disabled={loading} className="text-red-600 focus:text-red-600">
          {loading ? "Déconnexion..." : "Se déconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
