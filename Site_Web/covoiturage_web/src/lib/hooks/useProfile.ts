import { useEffect, useState } from "react";
import { getProfile } from "@/lib/services/profile.service";
import type { ProfileDto } from "@/lib/services/profile.service";

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileDto| null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    refresh: fetchProfile,
  };
};