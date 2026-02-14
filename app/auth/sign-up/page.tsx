import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Sign Up | Capgemini",
  description: "Create your Capgemini account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-secondary/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Main Card */}
        <Card className="border border-border/50 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
          <div className="p-6 sm:p-8">
            <SignUpForm />
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-primary hover:text-primary/80 dark:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-primary/80 dark:text-primary">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
