"use client";

import { useState } from "react";
import { useAuth } from "../../lib/hooks/use-auth";
import { updateProfile, changePassword } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AvatarUpload } from "./avatar-upload";
import { EmailVerificationBadge } from "./email-verification-badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkSquare01Icon, LockIcon, Logout02Icon, Mail01Icon, User02Icon } from "@hugeicons/core-free-icons";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserProfile() {
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Name is required");
      return;
    }

    setProfileLoading(true);
    try {
      let imageBase64: string | undefined;
      if (avatarFile) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
      }

      const result = await updateProfile(user!.id, {
        name: name.trim(),
        ...(imageBase64 !== undefined && { image: imageBase64 }),
      });

      if ("error" in result) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Profile updated successfully!");
        setAvatarFile(null);
        // Re-fetch user data or update context if necessary
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
      setErrorMessage(errorMsg);
    } finally {
      setProfileLoading(false);
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

    setPasswordLoading(true);
    try {
      const result = await changePassword(user!.id, currentPassword, newPassword);
      if ("error" in result) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to change password";
      setErrorMessage(errorMsg);
    } finally {
      setPasswordLoading(false);
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

  const loading = authLoading || profileLoading || passwordLoading;

  return (
    <div className="space-y-6">
      <Card className="border border-border/50 shadow-lg bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent">
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                <HugeiconsIcon icon={User02Icon} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}!</h1>
                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
            <Button onClick={handleSignOut} disabled={loading} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">
              <HugeiconsIcon icon={Logout02Icon} className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      {successMessage && <Alert variant="default" className="border-primary/20 dark:border-primary/30 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary">{successMessage}</Alert>}
      {errorMessage && <Alert variant="destructive" className="text-sm border-red-200 dark:border-red-900">{errorMessage}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4 border border-border/50 shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="w-full flex-col items-start h-auto bg-transparent p-0">
                <TabsTrigger value="profile" className="w-full justify-start text-sm font-medium gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <HugeiconsIcon icon={User02Icon} className="w-4 h-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="password" className="w-full justify-start text-sm font-medium gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <HugeiconsIcon icon={LockIcon} className="w-4 h-4" /> Password
                </TabsTrigger>
                <TabsTrigger value="email" className="w-full justify-start text-sm font-medium gap-2 px-3 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4" /> Email
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="profile" className="mt-0">
              <Card className="border border-border/50 shadow-lg">
                <form id="profileForm" onSubmit={handleSaveProfile}>
                  <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"><HugeiconsIcon icon={User02Icon} className="w-4 h-4 text-primary" /></div>
                      <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="submit" form="profileForm" disabled={profileLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        {profileLoading ? "Saving..." : <><HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />Save Changes</>}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
                        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className="focus:ring-primary focus:border-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
                        <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <AvatarUpload value={user.image} onChange={setAvatarFile} disabled={loading} />
                        <p className="text-xs text-muted-foreground">Upload a new photo. We recommend a 200x200px image.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-semibold text-foreground">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} disabled={loading} className="resize-none focus:ring-primary focus:border-primary" rows={3} />
                      <p className="text-xs text-muted-foreground">{bio.length}/200 characters</p>
                    </div>
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="password" className="mt-0">
              <Card className="border border-border/50 shadow-lg">
                <form id="passwordForm" onSubmit={handleChangePassword}>
                  <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"><HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-primary" /></div>
                      <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="submit" form="passwordForm" disabled={passwordLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        {passwordLoading ? "Updating..." : <><HugeiconsIcon icon={CheckmarkSquare01Icon} className="w-4 h-4 mr-2" />Update Password</>}
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" >Current Password</Label>
                      <Input id="current-password" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loading} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                      </div>
                    </div>
                     <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <Card className="border border-border/50 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10"><HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-primary" /></div>
                    <h2 className="text-xl font-semibold text-foreground">Email Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">PRIMARY EMAIL</Label>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{user.email}</p>
                        <EmailVerificationBadge verified={user.emailVerified || false} size="sm" />
                      </div>
                    </div>
                    {!user.emailVerified && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Verify your email to unlock all features.</p>
                        <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/10 dark:text-primary dark:border-primary/30 dark:hover:bg-primary/20">
                          Send Verification Email
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
