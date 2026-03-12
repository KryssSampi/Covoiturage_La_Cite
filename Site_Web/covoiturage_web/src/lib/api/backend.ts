import axios from "axios"

export const backend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
})

 backend.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)