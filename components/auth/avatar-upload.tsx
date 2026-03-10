"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit02Icon, User02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface AvatarUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format de fichier invalide", {
        description: "Utilisez une image JPG, PNG ou WebP.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse", {
        description: "La taille maximale autorisée est de 5 Mo.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
          {preview ? (
            <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <HugeiconsIcon icon={User02Icon} className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <HugeiconsIcon icon={Edit02Icon} className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Change
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={handleRemove}
            disabled={disabled}
          >
            <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-1.5" />
            Remove
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}
