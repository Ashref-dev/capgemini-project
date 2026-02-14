"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, getSession } from "@/lib/auth-server";
import type { AuthUser, AuthSession } from "@/lib/auth-utils";

export interface UseAuthReturn {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSession();
        setSession(sessionData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch session"));
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authSignIn(email, password);
        
        if ("error" in response) {
          const error = new Error(response.error);
          setError(error);
          throw error;
        }
        
        setSession({
          id: response.session.id,
          userId: response.session.userId,
          token: response.session.token,
          expiresAt: response.session.expiresAt,
          user: response.user,
        });
        
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Sign in failed");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authSignUp(email, password, name || email.split("@")[0]);
        
        if ("error" in response) {
          const error = new Error(response.error);
          setError(error);
          throw error;
        }
        
        setSession({
          id: response.session.id,
          userId: response.session.userId,
          token: response.session.token,
          expiresAt: response.session.expiresAt,
          user: response.user,
        });
        
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Sign up failed");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authSignOut();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Sign out failed"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const user = session?.user || null;
  const isAuthenticated = !!session;

  return {
    session,
    user,
    isAuthenticated,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
}
