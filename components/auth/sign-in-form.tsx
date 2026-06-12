"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { CapgeminiLogo } from "@/components/icons";

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"employee" | "partner">("employee");
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError("L'email est requis");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Veuillez entrer un email valide");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Le mot de passe est requis");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await signIn(email, password, userType);

      if (!response.error) {
        toast.success("Connexion réussie !");
        onSuccess?.();
        router.replace(userType === "partner" ? "/partner" : "/dashboard");
        router.refresh();
      } else {
        setFormError(response.error);
        toast.error(response.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <CapgeminiLogo size="sm" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Connexion
            </h1>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Accédez à votre espace sécurisé de gestion des partenariats.
            </p>
          </div>
        </div>
        <div className="hidden rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
          Accès sécurisé
        </div>
      </div>

      {/* User Type Toggle */}
      <div
        className="relative grid grid-cols-2 rounded-xl border border-border bg-muted/45 p-1"
        role="radiogroup"
        aria-label="Type de compte"
      >
        <motion.div
          className="absolute bottom-1 top-1 rounded-lg bg-primary shadow-sm shadow-primary/20"
          initial={false}
          animate={{
            left: userType === "employee" ? "4px" : "50%",
            right: userType === "employee" ? "50%" : "4px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <button
          type="button"
          onClick={() => { setUserType("employee"); setFormError(null); }}
          role="radio"
          aria-checked={userType === "employee"}
          className={`relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
            userType === "employee"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon icon={UserGroupIcon} className="size-4" />
          Employé Capgemini
        </button>
        <button
          type="button"
          onClick={() => { setUserType("partner"); setFormError(null); }}
          role="radio"
          aria-checked={userType === "partner"}
          className={`relative z-10 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
            userType === "partner"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon icon={Login02Icon} className="size-4" />
          Partenaire
        </button>
      </div>

      {/* Error Alert */}
      {formError && (
        <Alert variant="destructive" className="text-sm">
          {formError}
        </Alert>
      )}

      {/* Email Field */}
      <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={
            userType === "employee"
              ? "prenom.nom@capgemini.com"
              : "contact@partenaire.tn"
          }
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          disabled={submitting}
          className={emailError ? "h-11 border-destructive focus-visible:ring-destructive" : "h-11"}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError && (
          <p id="email-error" className="text-xs text-destructive">
            {emailError}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
          }}
          disabled={submitting}
          className={passwordError ? "h-11 border-destructive focus-visible:ring-destructive" : "h-11"}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        {passwordError && (
          <p id="password-error" className="text-xs text-destructive">
            {passwordError}
          </p>
        )}
      </div>
      </div>

      {/* Submit Button */}
      <div className="pt-1">
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="h-11 w-full rounded-xl font-semibold"
        >
          {submitting ? (
            "Connexion en cours..."
          ) : (
            <>
              <HugeiconsIcon icon={Login02Icon} className="w-4 h-4 mr-2" />
              Se connecter
            </>
          )}
        </Button>
      </div>

      {/* Info text */}
      <p className="text-xs text-center text-muted-foreground">
        {userType === "employee"
          ? "Connectez-vous avec votre compte Capgemini"
          : "Connectez-vous avec l'email de votre organisation partenaire"}
      </p>
    </form>
  );
}
