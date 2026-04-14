import { SignInForm } from "@/frontend/components/auth/sign-in-form";
import { Card } from "@/frontend/components/ui/card";

export const metadata = {
  title: "Sign In | Capgemini",
  description: "Sign in to your Capgemini account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-secondary/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Main Card */}
        <Card className="border border-border/50 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
          <div className="p-6 sm:p-8">
            <SignInForm />
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:text-primary/80 dark:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:text-primary/80 dark:text-primary">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
