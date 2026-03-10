"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login02Icon } from "@hugeicons/core-free-icons";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    try {
      const response = await signIn(email, password);

      if (response && !response.error) {
        toast.success("Connexion réussie !");
        onSuccess?.();
        router.push("/dashboard");
      } else {
        const responseError = response?.error;
        const msg =
          (typeof responseError === "string"
            ? responseError
            : responseError && typeof responseError === "object" && "message" in responseError && typeof responseError.message === "string"
              ? responseError.message
              : "Invalid email or password");
        setFormError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <HugeiconsIcon
            icon={Login02Icon}
            className="w-5 h-5 text-primary"
          />
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <Alert
          variant="destructive"
          className="text-sm"
        >
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
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          disabled={loading}
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <a
            href="#"
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
          }}
          disabled={loading}
          className={passwordError ? "border-destructive focus-visible:ring-destructive" : ""}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        {passwordError && (
          <p
            id="password-error"
            className="text-xs text-destructive"
          >
            {passwordError}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={loading}
        />
        <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer">
          Remember me
        </Label>
      </div>

      {/* Bottom spacing */}
      <div className="h-2" />

      {/* Buttons */}
      <div className="flex gap-3 pt-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </div>

      {/* Footer link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/auth/sign-up"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
}
