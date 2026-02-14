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
import { User02Icon, Mail01Icon, Logout02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { CheckCircle as CheckCircleIcon } from "@hugeicons/core-free-icons";
import { Alert } from "@/components/ui/alert";

export function UserProfile() {
  const { session, user, signOut, loading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      {/* Profile Card */}
      <Card className="border border-border/50 shadow-lg">
        <div className="p-6 sm:p-8">
          {/* Header with Title and Action Buttons */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={User02Icon}
                className="w-5 h-5 text-primary dark:text-primary"
              />
              <h2 className="text-lg font-semibold">Profile Information</h2>
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                  }}
                  disabled={loading}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="Cancel"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                </Button>
                <button
                  type="submit"
                  form="profileForm"
                  disabled={loading}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  title="Save Changes"
                >
                  <HugeiconsIcon icon={CheckCircleIcon} className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <form id="profileForm" onSubmit={handleSaveProfile} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
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
                  className="resize-none focus:ring-primary focus:border-primary"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/200 characters
                </p>
              </div>

              {/* Avatar Upload */}
              <AvatarUpload
                value={undefined}
                onChange={setAvatarFile}
                disabled={loading}
              />
            </form>
          ) : (
            <div className="space-y-4">
              {/* Name Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    NAME
                  </Label>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    ACCOUNT TYPE
                  </Label>
                  <p className="text-sm font-medium">Standard</p>
                </div>
              </div>

              {/* Created At */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">
                  MEMBER SINCE
                </Label>
                <p className="text-sm font-medium">
                  {new Date(
                    user.createdAt || new Date()
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
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

      {/* Password Card */}
      <Card className="border border-border/50 shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Manage your password and security settings
          </p>

          <Button
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/10 dark:border-primary/30 dark:text-primary dark:hover:bg-primary/20"
          >
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
}
