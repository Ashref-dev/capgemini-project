"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login02Icon } from "@hugeicons/core-free-icons";
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <CapgeminiLogo size="md" />
      </div>

      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold text-foreground">Connexion</h2>
        <p className="text-sm text-muted-foreground">
          Accédez à votre espace de gestion des partenariats
        </p>
      </div>

      {/* User Type Toggle */}
      <div className="relative flex rounded-lg bg-muted/50 border border-border p-1">
        <motion.div
          className="absolute top-1 bottom-1 rounded-md bg-primary shadow-sm"
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
          className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            userType === "employee"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Employé Capgemini
        </button>
        <button
          type="button"
          onClick={() => { setUserType("partner"); setFormError(null); }}
          className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            userType === "partner"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
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
          className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
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
          className={passwordError ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        {passwordError && (
          <p id="password-error" className="text-xs text-destructive">
            {passwordError}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
