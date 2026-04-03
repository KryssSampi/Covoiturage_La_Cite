import { useRef, useState } from "react"
import { backend } from "@/lib/api/backend"
import { useAuthStore } from "@/store/useAuthStore"

export const useProfilePhoto = (profile: any, setProfile: any) => {

  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  const [preview, setPreview] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [captured, setCaptured] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fileInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* -------- upload -------- */

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const res = await backend.post("/api/profile/upload-photo", formData)
      const imageUrl = res.data.imageUrl

      setPreview(imageUrl)

      setProfile({
        ...profile,
        profileImageUrl: imageUrl
      })

      if (user) {
        setUser({
          ...user,
          profileImageUrl: imageUrl
        })
      }

    } finally {
      setUploading(false)
    }
  }

  /* -------- camera -------- */

  const openCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })

    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }

    setCameraOpen(true)
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())

    setCameraOpen(false)
    setCaptured(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx?.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL("image/jpeg")

    setPreview(dataUrl)
    setCaptured(true)
  }

  const retakePhoto = () => {
    setCaptured(false)
  }

  const savePhoto = async () => {
    if (!canvasRef.current) return

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return

      try {
        setUploading(true)

        const formData = new FormData()
        formData.append("file", blob, "photo.jpg")

        const res = await backend.post("/api/profile/upload-photo", formData)
        const imageUrl = res.data.imageUrl

        setPreview(imageUrl)

        setProfile({
          ...profile,
          profileImageUrl: imageUrl
        })

        if (user) {
          setUser({
            ...user,
            profileImageUrl: imageUrl
          })
        }

        stopCamera()

      } finally {
        setUploading(false)
      }

    }, "image/jpeg")
  }

  return {
    preview,
    setPreview,
    fileInput,
    videoRef,
    canvasRef,
    uploadFile,
    openCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    savePhoto,
    cameraOpen,
    captured,
    uploading
  }
}