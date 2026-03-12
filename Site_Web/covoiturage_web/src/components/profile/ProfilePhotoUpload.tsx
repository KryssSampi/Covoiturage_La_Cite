"use client";

import { useState } from "react";
import { uploadProfilePhoto } from "@/lib/services/profile.service";

interface Props {
  onUploadSuccess: () => void;
}

export default function ProfilePhotoUpload({ onUploadSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await uploadProfilePhoto(file);
      onUploadSuccess();
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
      {loading ? "Upload..." : "Changer la photo"}
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </label>
  );
}