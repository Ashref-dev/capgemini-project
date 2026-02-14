// DEPRECATED: Better Auth types are no longer used.
// Use the types from lib/auth-utils.ts instead (AuthUser, AuthSession)

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  token: string;
  redirect: boolean;
  url?: string;
  user: User;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export type AuthResponse<T = unknown> = {
  data?: T;
  error?: AuthError;
};
