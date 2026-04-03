import { backend } from "../api/backend"
export interface ProfileDto {
  firstName: string
  lastName: string
  email: string
  phone: string

  streetNumber?: string
  streetName?: string
  apartment?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
   profileImageUrl?: string
   role?: string

   isPublic?: boolean
bio?: string
}

export async function getProfile(): Promise<ProfileDto> {
  const response = await backend.get("/api/Auth/me")
  return response.data
}

export async function updateProfile(data: ProfileDto) {
  const response = await backend.put("/api/Auth/update-profile", data)
  return response.data
}

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await backend.post(
    "/api/Auth/upload-photo",
    formData
  );

  return data;
};

// Get public profile
export const getPublicProfile = async (id: string) => {
  const response = await backend.get(`/api/profile/public/${id}`)
  return response.data
}
// Change password
export const changePassword = async (data: {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}) => {
  const response = await backend.post("/api/profile/change-password", data)
  return response.data
}


