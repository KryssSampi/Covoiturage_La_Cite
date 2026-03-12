import { backend } from "../api/backend"

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}
export interface LoginDto {
  email: string
  password: string
}
export interface AuthResponse {
  accessToken: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
    profileImageUrl?:string
    
  }
}
/**
 * Appelle l'API .NET pour login
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
  const response = await backend.post<AuthResponse>(
    "/api/auth/login",
    data
  )

  return response.data
}

/**
 * Appelle l'API .NET pour register
 */

export async function register(
  data: RegisterDto
): Promise<{ message: string }> {
  const response = await backend.post(
    "/api/auth/register",
    data
  )

  return response.data
}


/**
 * Appelle l'API .NET pour renvoyer Email confirmation
 */

export async function resendConfirmation(email: string) {
  const response = await backend.post(
    "/api/auth/resend-confirmation",
   { email}
  )

  return response.data
}

