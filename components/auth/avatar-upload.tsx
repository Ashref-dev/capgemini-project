"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { Label } from "@/components/ui/label";

interface AvatarUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.length) {
      handleFileChange(files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="avatar">Profile Photo</Label>
      
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/10 dark:bg-primary/20"
            : "border-border hover:border-primary hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          id="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          disabled={disabled}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-md">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <HugeiconsIcon
              icon={CloudUploadIcon}
              className="w-6 h-6 text-muted-foreground"
            />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WebP • Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => handleFileChange(null)}
          disabled={disabled}
          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
