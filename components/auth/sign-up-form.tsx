"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "./avatar-upload";
import { EmailVerificationBadge } from "./email-verification-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Error state
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Step state (optional - for tabbed interface)
  const [step, setStep] = useState<"basic" | "profile">("basic");

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = "Password must include at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = "Password must include at least one number";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!emailVerified) {
      errors.emailVerification = "Please verify your email to continue";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    try {
      const response = await signUp(email, password, name);

      if (response && !response.error) {
        toast.success("Compte créé avec succès !");
        onSuccess?.();
        router.push("/dashboard");
      } else {
        const msg =
          (typeof response?.error === "string"
            ? response.error
            : response?.error?.message) || "Sign up failed";
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

  const goToProfileStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate basic info
    const basicErrors: Record<string, string> = {};
    if (!name.trim()) basicErrors.name = "Name is required";
    if (!email) basicErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      basicErrors.email = "Invalid email";

    if (Object.keys(basicErrors).length === 0) {
      setStep("profile");
    } else {
      setFieldErrors(basicErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <HugeiconsIcon
            icon={UserAdd01Icon}
            className="w-5 h-5 text-primary"
          />
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <Alert
          variant="destructive"
          className="text-sm border-red-200 dark:border-red-900"
        >
          {formError}
        </Alert>
      )}

      {step === "basic" ? (
        <>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: "" }));
                }
              }}
              disabled={loading}
              className={fieldErrors.name ? "border-red-500 focus:ring-red-500" : ""}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              disabled={loading}
              className={fieldErrors.email ? "border-red-500 focus:ring-red-500" : ""}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              disabled={loading}
              className={
                fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""
              }
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <p
                id="password-error"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {fieldErrors.password}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              At least 8 characters, uppercase letter, and number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-semibold">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));
                }
              }}
              disabled={loading}
              className={
                fieldErrors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={
                fieldErrors.confirmPassword ? "confirm-error" : undefined
              }
            />
            {fieldErrors.confirmPassword && (
              <p
                id="confirm-error"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Email Verification */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="email-verification"
                checked={emailVerified}
                onCheckedChange={(checked) =>
                  setEmailVerified(checked as boolean)
                }
                disabled={loading}
              />
              <div className="flex-1">
                <Label
                  htmlFor="email-verification"
                  className="text-sm font-medium cursor-pointer"
                >
                  I verify my email address
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll receive a verification link via email
                </p>
              </div>
            </div>
            {fieldErrors.emailVerification && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.emailVerification}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              onClick={goToProfileStep}
              disabled={loading}
              className="flex-1 font-semibold"
            >
              Continue to Profile
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Step 2: Profile Information */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Complete Your Profile</h3>
            <p className="text-sm text-muted-foreground">
              Add a photo and bio (optional)
            </p>
          </div>

          {/* Avatar Upload */}
          <AvatarUpload
            value={undefined}
            onChange={setAvatarFile}
            disabled={loading}
          />

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/200 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              onClick={() => setStep("basic")}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 font-semibold"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </>
      )}

      {/* Footer link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/auth/sign-in"
            className="text-primary hover:text-primary/80 dark:hover:text-primary/80 font-semibold"
          >
            Sign in
          </a>
        </p>
      </div>
    </form>
  );
}
