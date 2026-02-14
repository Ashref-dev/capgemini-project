# Better Auth Setup Guide

This project uses **Better Auth** for authentication management. Better Auth is a modern, secure authentication library for Next.js applications.

## Installation

Better Auth has been installed using bun:

```bash
bun add better-auth
```

## Project Structure

The authentication system is organized as follows:

```
lib/
  ├── auth.ts              # Server-side auth configuration
  ├── auth-client.ts       # Client-side auth client
  ├── auth-types.ts        # TypeScript type definitions
  └── hooks/
      └── use-auth.ts      # React hook for auth management

components/auth/
  ├── sign-in-form.tsx     # Sign-in form component
  ├── sign-up-form.tsx     # Sign-up form component
  └── user-menu.tsx        # User menu dropdown component

app/
  └── api/auth/[...all]/route.ts  # API routes for auth endpoints

middleware.ts               # Auth middleware for protected routes
```

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# OAuth Providers (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Usage

### In React Components

Use the `useAuth` hook to access authentication state and methods:

```tsx
import { useAuth } from "@/lib/hooks/use-auth";

export function MyComponent() {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Sign-In Form

Use the `SignInForm` component:

```tsx
import { SignInForm } from "@/components/auth/sign-in-form";

export function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <SignInForm />
    </div>
  );
}
```

### Sign-Up Form

Use the `SignUpForm` component:

```tsx
import { SignUpForm } from "@/components/auth/sign-up-form";

export function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <SignUpForm />
    </div>
  );
}
```

### User Menu

Display authenticated user information:

```tsx
import { UserMenu } from "@/components/auth/user-menu";

export function Header() {
  return (
    <header className="flex justify-between">
      <h1>My App</h1>
      <UserMenu />
    </header>
  );
}
```

## Protected Routes

The middleware in `middleware.ts` automatically protects routes starting with `/dashboard` or `/admin`. To add more protected routes, update the `matcher` in the middleware configuration.

## API Endpoints

Better Auth provides the following API endpoints:

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/oauth/{provider}` - OAuth authentication

## Types

TypeScript types are available from `lib/auth-types.ts`:

```tsx
import type { User, Session, AuthError } from "@/lib/auth-types";

function handleUser(user: User): void {
  // Type-safe user handling
}
```

## Database

By default, Better Auth uses SQLite with the database file at `./auth.db`. The database is automatically created on first run.

## Security Considerations

1. Keep environment variables secure and never commit `.env.local`
2. Use HTTPS in production
3. Implement rate limiting on auth endpoints
4. Consider adding email verification
5. Use strong password policies

## Troubleshooting

### Session not persisting
- Ensure cookies are enabled in your browser
- Check that `NEXT_PUBLIC_APP_URL` matches your application URL

### OAuth authentication fails
- Verify OAuth provider credentials are correct
- Check redirect URIs in OAuth provider settings
- Ensure `NEXT_PUBLIC_APP_URL` is whitelisted

### Database errors
- Delete `auth.db` to reset the database
- Check file permissions in the project directory

## Documentation

For more information, visit [Better Auth Documentation](https://www.better-auth.com)
