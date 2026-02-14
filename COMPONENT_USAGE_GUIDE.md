# 🎯 Guide d'Utilisation - Composants Refactorisés

## Table des Matières
1. [SignInForm](#signin-form)
2. [SignUpForm](#signup-form)
3. [UserProfile](#user-profile)
4. [AvatarUpload](#avatar-upload)
5. [EmailVerificationBadge](#email-verification-badge)
6. [AuthModal](#auth-modal)

---

## SignInForm

### Description
Formulaire de connexion professionnel avec validation granulaire et styles d'entreprise.

### Installation
```tsx
import { SignInForm } from "@/components/auth/sign-in-form";
```

### Utilisation Basique
```tsx
<SignInForm />
```

### Avec Callback de Succès
```tsx
<SignInForm 
  onSuccess={() => console.log("User signed in!")}
/>
```

### Props
```typescript
interface SignInFormProps {
  onSuccess?: () => void;  // Optionnel: callback après connexion réussie
}
```

### États et Validations

#### Email
- ✅ Requis
- ✅ Format valid email (RFC 5322)
- ✅ Message d'erreur contextuel

#### Password
- ✅ Requis
- ✅ Message d'erreur contextuel

#### Features
- 🎯 Remember Me checkbox
- 🔗 Forgot Password link
- 📊 Loading state avec spinner
- 🚫 Disabled state pendant l'envoi
- ⚠️ Alert error si problème

### Exemple Complet
```tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
      <SignInForm 
        onSuccess={() => {
          console.log("Successfully signed in!");
        }}
      />
    </div>
  );
}
```

### Sorties
```
Email input → validation on blur/change
Password input → validation on change
Remember me → boolean state
Submit → Server Action (signIn)
Success → redirect to /dashboard
Error → display in alert
```

---

## SignUpForm

### Description
Formulaire d'inscription en 2 étapes avec validation de password strength, upload d'image et vérification d'email.

### Installation
```tsx
import { SignUpForm } from "@/components/auth/sign-up-form";
```

### Utilisation Basique
```tsx
<SignUpForm />
```

### Avec Callback
```tsx
<SignUpForm 
  onSuccess={() => alert("Account created!")}
/>
```

### Props
```typescript
interface SignUpFormProps {
  onSuccess?: () => void;  // Callback après inscription
}
```

### States & Validation

#### Step 1: Basic Information
```
Name
├─ Required
├─ Trim whitespace
└─ Error msg: "Name is required"

Email
├─ Required
├─ Valid format (RFC 5322)
└─ Error msg: "Please enter a valid email"

Password
├─ Required
├─ Min 8 characters
├─ At least 1 uppercase
├─ At least 1 number
└─ Error msg: "Password must include..."

Confirm Password
├─ Required
├─ Must match password
└─ Error msg: "Passwords do not match"

Email Verification
├─ Checkbox (required)
└─ Error msg: "Please verify your email"
```

#### Step 2: Profile Information (Optionnel)
```
Avatar Upload
├─ Drag & drop
├─ File types: JPG, PNG, WebP
├─ Max size: 5MB
├─ Preview with overlay

Bio
├─ Max 200 characters
├─ Free text
└─ Optional
```

### Flow Navigation
```
Step 1
├─ Validate basic info
├─ If valid → Continue to Profile
└─ If invalid → show specific errors

Step 2
├─ Upload avatar (optional)
├─ Add bio (optional)
└─ Back or Submit

Success
└─ Redirect to /dashboard
```

### Exemple Complet
```tsx
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <SignUpForm 
        onSuccess={() => {
          // toast.success("Account created!");
        }}
      />
    </div>
  );
}
```

### Intégration Base de Données
```javascript
// Server Action (lib/auth-server.ts)
async function signUp(email: string, password: string, name: string) {
  // 1. Hash password avec bcryptjs (10 rounds)
  // 2. Check for duplicate email
  // 3. Insert user into DB
  // 4. Create session
  // 5. Set auth_token cookie
  // 6. Return user data
}
```

---

## UserProfile

### Description
Composant complet pour afficher et éditer les informations de profil utilisateur.

### Installation
```tsx
import { UserProfile } from "@/components/auth/user-profile";
```

### Utilisation
```tsx
import { UserProfile } from "@/components/auth/user-profile";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <UserProfile />
    </div>
  );
}
```

### Sections Actuelles

#### 1. Welcome Card
```
┌─────────────────────────────────────┐
│ 👤 Welcome, [User Name]!            │
│    Manage your account              │ → [Sign Out]
│    and preferences                  │
└─────────────────────────────────────┘
```

#### 2. Profile Information Card
**View Mode:**
```
Name:          John Doe
Account Type:  Standard
Member Since:  February 14, 2026
```

**Edit Mode:**
```
[Name Input Field]
[Bio Textarea - 200 char limit]
[Avatar Upload with preview]
[Cancel] [Save Changes]
```

#### 3. Email Address Card
```
┌─────────────────────────────────────┐
│ 📧 Email Address                    │
│                                     │
│ john@example.com  [Verified ✓]     │
│                                     │
│ If not verified:                    │
│ [Send Verification Email]           │
└─────────────────────────────────────┘
```

#### 4. Security Card
```
┌─────────────────────────────────────┐
│ 🔒 Security                         │
│                                     │
│ Manage password and security        │
│ [Change Password]                   │
└─────────────────────────────────────┘
```

### State Management
```javascript
// Local state
const [isEditing, setIsEditing] = useState(false);
const [name, setName] = useState(user?.name || "");
const [bio, setBio] = useState("");
const [avatarFile, setAvatarFile] = useState(null);
const [successMessage, setSuccessMessage] = useState(null);
const [errorMessage, setErrorMessage] = useState(null);

// Auth context
const { session, user, signOut, loading } = useAuth();
```

### Handlers

#### Save Profile
```typescript
const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Validate name not empty
  // 2. Call updateProfile Server Action
  // 3. On success: show success msg, exit edit mode
  // 4. On error: show error msg, stay in edit mode
}
```

#### Sign Out
```typescript
const handleSignOut = async () => {
  try {
    await signOut();  // Server Action
    // Cookie cleared, session deleted
    // User redirected to /auth/sign-in
  } catch (err) {
    // Display error
  }
}
```

### Styling

#### Colors
```css
/* Headers */
.gradient-header {
  background: linear-gradient(
    to right,
    rgb(16, 185, 129),  /* teal-600 */
    transparent
  );
}

/* Badges */
.verified-badge {
  background-color: rgb(240, 253, 250);  /* teal-50 */
  color: rgb(5, 150, 105);               /* teal-700 */
}

.pending-badge {
  background-color: rgb(254, 243, 235);  /* amber-50 */
  color: rgb(180, 83, 9);                /* amber-700 */
}
```

#### Responsive Layout
```
Mobile (< 640px):
- Single column
- Full-width cards
- Stacked buttons (flex-col)

Desktop (>= 640px):
- 2 columns for profile info
- Inline buttons
- Better spacing
```

### Exemple Complet
```tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Header */}
      <div className="border-b sticky top-0">
        <h1>Dashboard</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12">
        <UserProfile />
      </div>
    </div>
  );
}
```

---

## AvatarUpload

### Description
Composant de téléchargement d'image avec drag & drop, validations et aperçu.

### Installation
```tsx
import { AvatarUpload } from "@/components/auth/avatar-upload";
```

### Utilisation Basique
```tsx
const [avatar, setAvatar] = useState(null);

<AvatarUpload 
  value={undefined}
  onChange={setAvatar}
  disabled={loading}
/>
```

### Props
```typescript
interface AvatarUploadProps {
  value?: string;           // URL de l'image existante (pour preview)
  onChange: (file: File | null) => void;  // Callback quand fichier change
  disabled?: boolean;       // Désactiver le composant
}
```

### Validations

```javascript
// File Type
✗ Accepté: image/jpeg, image/png, image/webp
✓ Rejeté: gif, svg, bmp, tiff, etc.
→ Message: "Please upload a JPG, PNG, or WebP image"

// File Size
✓ Max: 5MB
✗ > 5MB rejeté
→ Message: "File size must be less than 5MB"
```

### Features

#### Drag & Drop
```
Hover state:
- Border change: border → teal-500
- Background: transparent → teal-50
- Cursor: pointer

Drop:
- Read file
- Validate type/size
- Show preview
```

#### Preview
```
Without image:
├─ Icon (CloudUpload)
├─ Text: "Drop or click to upload"
└─ Subtext: "JPG, PNG or WebP • Max 5MB"

With image:
├─ Image display
├─ Hover overlay: "Change"
└─ [Remove image] button
```

#### Remove
```tsx
<button 
  type="button"
  onClick={() => handleFileChange(null)}
  disabled={disabled}
>
  Remove image
</button>
```

### Styling
```css
/* Upload Area */
.upload-area {
  border: 2px dashed;
  border-color: hsl(var(--border));
  border-radius: 0.5rem;
  
  @hover {
    border-color: #14b8a6;  /* teal-400 */
    background-color: hsl(var(--muted)) / 0.5;
  }
  
  @drag-active {
    border-color: #10b981;  /* teal-500 */
    background-color: rgb(240, 253, 250);  /* teal-50 */
  }
}

/* Image Preview */
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
  
  @hover {
    opacity: 0.4;
  }
}
```

### Exemple Intégration
```tsx
export function SignUpForm() {
  const [avatarFile, setAvatarFile] = useState(null);

  const handleSubmit = async (e) => {
    // 1. Prepare form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    
    // 2. Add avatar if selected
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    // 3. Submit
    const response = await signUp(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <AvatarUpload 
        onChange={setAvatarFile}
        disabled={loading}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

---

## EmailVerificationBadge

### Description
Badge pour afficher le statut de vérification d'email (Verified ✓ ou Pending).

### Installation
```tsx
import { EmailVerificationBadge } from "@/components/auth/email-verification-badge";
```

### Utilisation

#### Basique
```tsx
<EmailVerificationBadge verified={true} />
```

#### Avec Taille Personnalisée
```tsx
<EmailVerificationBadge 
  verified={true} 
  size="lg"  // sm | md | lg
/>
```

### Props
```typescript
interface EmailVerificationBadgeProps {
  verified: boolean;        // true = Verified, false = Pending
  size?: 'sm' | 'md' | 'lg'; // Optional, default: 'md'
}
```

### États

#### Verified (Vert/Teal)
```
┌──────────────────────┐
│ ✓ Verified           │  Background: teal-50
│                      │  Text: teal-700
└──────────────────────┘  Icon: CheckCircle
```

#### Pending (Amber/Orange)
```
┌──────────────────────┐
│ ⚠ Pending            │  Background: amber-50
│                      │  Text: amber-700
└──────────────────────┘  Icon: AlertCircle
```

### Tailles
```
sm (small):
- Icon: w-4 h-4
- Text: text-xs
- Padding: px-2 py-1

md (medium):        // default
- Icon: w-5 h-5
- Text: text-sm
- Padding: px-3 py-1.5

lg (large):
- Icon: w-6 h-6
- Text: text-base
- Padding: px-4 py-2
```

### Exemple Utilisation
```tsx
export function EmailCard({ user }) {
  return (
    <div className="card p-6">
      <h2>Email Address</h2>
      
      <div className="flex items-center justify-between">
        <p className="font-medium">{user.email}</p>
        
        <EmailVerificationBadge 
          verified={user.emailVerified}
          size="md"
        />
      </div>

      {!user.emailVerified && (
        <button className="mt-4">
          Send Verification Email
        </button>
      )}
    </div>
  );
}
```

### Dark Mode Support
```
Verified (Dark):
- Background: rgba(5, 150, 105, 0.3)  // teal-950/30
- Text: rgb(45, 212, 191)              // teal-300

Pending (Dark):
- Background: rgba(180, 83, 9, 0.3)   // amber-950/30
- Text: rgb(251, 146, 60)              // amber-400
```

---

## AuthModal

### Description
Composant modal réutilisable pour les formulaires d'authentification.

### Installation
```tsx
import { AuthModal } from "@/components/auth/auth-modal";
```

### Utilisation

#### Basique avec SignInForm
```tsx
const [isOpen, setIsOpen] = useState(false);

<AuthModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Sign In"
  subtitle="Welcome back!"
>
  <SignInForm />
</AuthModal>
```

#### Avec Icône Personnalisée
```tsx
import { Login02Icon } from "@hugeicons/core-free-icons";

<AuthModal
  open={isOpen}
  onOpenChange={setIsOpen}
  icon={<HugeiconsIcon icon={Login02Icon} />}
  title="Sign In"
  subtitle="Access your account"
>
  <SignInForm />
</AuthModal>
```

### Props
```typescript
interface AuthModalProps {
  open?: boolean;                    // État du modal
  onOpenChange?: (open: boolean) => void;  // Callback changement état
  icon?: ReactNode;                  // Icône optionnelle
  title: string;                     // Titre requis
  subtitle?: string;                 // Sous-titre optionnel
  children: ReactNode;               // Contenu du modal
  className?: string;                // Classes Tailwind additionnelles
}
```

### Structure Interne
```
Modal
├─ Header Section
│  ├─ Icon (avec background teal-50)
│  ├─ Title (text-2xl font-bold)
│  └─ Subtitle (text-sm muted-foreground)
│
├─ Content Section (children)
│  └─ [Formulaire auth ou autre contenu]
│
└─ Close Button (X en haut à droite)
```

### Styling

#### Header
```css
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;  /* 3 in Tailwind */
  text-align: center;
}

.modal-icon {
  width: 48px;  /* w-12 */
  height: 48px;
  border-radius: 9999px;  /* rounded-full */
  background-color: rgb(240, 253, 250);  /* teal-50 */
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### Close Button
```css
.modal-close {
  position: absolute;
  right: 16px;  /* top-4 */
  top: 16px;
  opacity: 0.7;
  
  @hover {
    opacity: 1;
  }
  
  @focus {
    outline: 2px solid ring;
    outline-offset: 2px;
  }
}
```

### Responsive
```
Mobile (< 640px):
- max-width: 100%
- width: full
- Padding: 16px

Desktop (>= 640px):
- max-width: 28rem  /* lg */
- width: auto
- Centered horizontally
```

### Exemple Complet
```tsx
export default function AuthPage() {
  const [isSignInOpen, setIsSignInOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <AuthModal
        open={isSignInOpen}
        onOpenChange={setIsSignInOpen}
        icon={<Login02Icon />}
        title="Welcome Back"
        subtitle="Sign in to your account to continue"
        className="w-full max-w-lg"
      >
        <SignInForm />
      </AuthModal>
    </div>
  );
}
```

---

## 🎯 Patterns Communs

### Pattern 1: Form avec Validation
```tsx
const [email, setEmail] = useState("");
const [error, setError] = useState("");

const validate = () => {
  if (!email) {
    setError("Email is required");
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Invalid email format");
    return false;
  }
  return true;
};

const handleChange = (value) => {
  setEmail(value);
  setError("");  // Clear error on change
};
```

### Pattern 2: Loading States
```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await submitForm();
    // Success
  } catch (err) {
    // Error handling
  } finally {
    setLoading(false);
  }
};

// Use loading state
<button disabled={loading}>
  {loading ? "Loading..." : "Submit"}
</button>
```

### Pattern 3: Error Handling
```tsx
const [errorFields, setErrorFields] = useState({
  email: "",
  password: "",
});

const validateForm = () => {
  const errors = {};
  if (!email) errors.email = "Required";
  if (!password) errors.password = "Required";
  setErrorFields(errors);
  return Object.keys(errors).length === 0;
};

// Display errors
{errorFields.email && (
  <p className="text-xs text-red-600">{errorFields.email}</p>
)}
```

---

## 📱 Responsive Breakpoints

```javascript
// Tailwind Breakpoints
{
  'sm': '640px',      // Tablet
  'md': '768px',      // Medium
  'lg': '1024px',     // Desktop
  'xl': '1280px',     // Large Desktop
  '2xl': '1536px',    // Extra Large
}
```

### Usage Examples
```tsx
// Mobile first
<div className="p-4 sm:p-6 md:p-8">
  {/* 16px mobile, 24px tablet, 32px desktop */}
</div>

<div className="flex flex-col sm:flex-row gap-4">
  {/* Stack on mobile, horizontal on tablet+ */}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* 1 col mobile, 2 cols tablet, 3 cols desktop */}
</div>
```

---

## ✅ Checklist d'Implémentation

- [ ] Importer les composants nécessaires
- [ ] Configurer les états (useState)
- [ ] Connecter les callbacks
- [ ] Valider les props TypeScript
- [ ] Tester les validations
- [ ] Tester sur mobile/tablet/desktop
- [ ] Vérifier l'accessibilité (clavier, screen reader)
- [ ] Vérifier le dark mode
- [ ] Tester les états d'erreur/loading
- [ ] Intégrer les Server Actions
- [ ] Tester en production

---

*Dernière mise à jour: 14 Février 2026*
*Pour les mises à jour de composants, veuillez fusionner avec ce guide*
