"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AvatarUpload } from "./avatar-upload";
import { EmailVerificationBadge } from "./email-verification-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { User02Icon, Mail01Icon, Logout02Icon, CheckmarkSquare01Icon } from "@hugeicons/core-free-icons";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserProfile() {
  const { session, user, signOut, loading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Name is required");
      return;
    }

    // TODO: Implement profile update API
    try {
      // await updateProfile({ name, bio, avatar: avatarFile });
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
      setErrorMessage(errorMsg);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    // TODO: Implement password change API
    try {
      // await changePassword(currentPassword, newPassword);
      setSuccessMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to change password";
      setErrorMessage(errorMsg);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign out";
      setErrorMessage(errorMsg);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border border-border/50 shadow-lg bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary dark:bg-primary">
                <HugeiconsIcon
                  icon={User02Icon}
                  className="w-6 h-6 text-white"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome, {user.name}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              disabled={loading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <HugeiconsIcon icon={Logout02Icon} className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages */}
      {successMessage && (
        <Alert
          variant="default"
          className="border-primary/20 dark:border-primary/30 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
        >
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert
          variant="destructive"
          className="text-sm border-red-200 dark:border-red-900"
        >
          {errorMessage}
        </Alert>
      )}

      {/* Profile Form Card */}
      <Card className="border border-border/50 shadow-lg">
        <div className="w-full max-w-7xl mx-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon
                  icon={User02Icon}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarFile(null);
                }}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="profileForm"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mx-6 mt-4">
              <Alert
                variant="destructive"
                className="text-sm border-red-200 dark:border-red-900"
              >
                {errorMessage}
              </Alert>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mx-6 mt-4">
              <Alert
                variant="default"
                className="text-sm border-primary/20 dark:border-primary/30 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
              >
                {successMessage}
              </Alert>
            </div>
          )}

          <form id="profileForm" onSubmit={handleSaveProfile} className="space-y-6">
            <div className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Email Field (Readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold text-foreground">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  className="resize-none focus:ring-primary focus:border-primary"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/200 characters
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Profile Picture
                </Label>
                <AvatarUpload
                  value={undefined}
                  onChange={setAvatarFile}
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* Email Card */}
      <Card className="border border-border/50 shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <HugeiconsIcon
              icon={Mail01Icon}
              className="w-5 h-5 text-primary dark:text-primary"
            />
            <h2 className="text-lg font-semibold">Email Address</h2>
          </div>

          <div className="space-y-4">
            {/* Email Display */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                PRIMARY EMAIL
              </Label>
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <p className="text-sm font-medium">{user.email}</p>
                <EmailVerificationBadge
                  verified={user.emailVerified || false}
                  size="sm"
                />
              </div>
            </div>

            {/* Email Verification Actions */}
            {!user.emailVerified && (
              <div className="flex flex-col gap-3 pt-3">
                <p className="text-xs text-muted-foreground">
                  Verify your email to unlock all features
                </p>
                <Button
                  variant="outline"
                  className="text-primary border-primary/20 hover:bg-primary/10 dark:text-primary dark:border-primary/30 dark:hover:bg-primary/20"
                >
                  Send Verification Email
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Password Change Form Card */}
      <Card className="border border-border/50 shadow-lg">
        <div className="w-full max-w-7xl mx-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <HugeiconsIcon
                  icon={User02Icon}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="passwordForm"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </div>

          <form id="passwordForm" onSubmit={handleChangePassword} className="space-y-6">
            <div className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-semibold text-foreground">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
