"use client";

import { useCallback } from "react";
import { authClient, useSession } from "@/lib/auth-client";

type AuthResult = { error?: unknown } | undefined;

export interface UseAuthReturn {
  session: ReturnType<typeof useSession>["data"];
  user: ReturnType<typeof useSession>["data"] extends infer T
    ? T extends { user: infer U }
      ? U
      : null
    : null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

function normalizeError(error: unknown): Error | null {
  if (!error) return null;
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error("Authentication error");
}

export function useAuth(): UseAuthReturn {
  const sessionState = useSession();
  const session = sessionState.data;
  const user = session?.user ?? null;
  const error = normalizeError(sessionState.error);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    return result;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name: name?.trim() || email.split("@")[0],
    });

    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  return {
    session,
    user,
    isAuthenticated: !!session?.user,
    loading: sessionState.isPending,
    error,
    signIn,
    signUp,
    signOut,
  };
}