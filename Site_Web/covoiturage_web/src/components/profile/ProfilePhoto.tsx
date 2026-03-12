"use client"

import { useRef, useState } from "react"
import { uploadProfilePhoto } from "@/lib/services/profile.service"

export default function ProfilePhoto({ onUploadSuccess }: any) {

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 🔹 Convertir Base64 en File
  function dataURLtoFile(dataurl: string, filename: string) {

    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]

    const bstr = atob(arr[1])
    let n = bstr.length

    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  // 🔹 Ouvrir la caméra
  const startCamera = async () => {

    try {

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      })

      if (videoRef.current)
        videoRef.current.srcObject = mediaStream

      setStream(mediaStream)

    } catch {
      alert("Impossible d'accéder à la caméra")
    }
  }

  // 🔹 Prendre photo
  const takePhoto = () => {

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx?.drawImage(video, 0, 0)

    const image = canvas.toDataURL("image/png")

    setPhoto(image)

    // arrêter caméra
    stream?.getTracks().forEach(track => track.stop())
  }

  // 🔹 Réessayer
  const retry = () => {

    setPhoto(null)

    startCamera()
  }

  // 🔹 Upload vers backend
  const uploadPhoto = async () => {

    if (!photo) return

    try {

      setLoading(true)

      const file = dataURLtoFile(photo, "profile.png")

      await uploadProfilePhoto(file)

      onUploadSuccess?.()

    } catch {

      alert("Erreur lors de l'upload")

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="flex flex-col items-center gap-4">

      {/* CAMERA */}
      {!photo && (
        <>
          <video
            ref={videoRef}
            autoPlay
            className="w-48 h-48 rounded-lg object-cover border"
          />

          {!stream && (
            <button
              onClick={startCamera}
              className="bg-lacite text-white px-4 py-2 rounded-xl"
            >
              Ouvrir la caméra
            </button>
          )}

          {stream && (
            <button
              onClick={takePhoto}
              className="bg-green-600 text-white px-4 py-2 rounded-xl"
            >
              Prendre la photo
            </button>
          )}
        </>
      )}

      {/* PREVIEW */}
      {photo && (
        <>
          <img
            src={photo}
            className="w-48 h-48 rounded-lg object-cover border"
          />

          <div className="flex gap-3">

            <button
              onClick={retry}
              className="bg-gray-500 text-white px-4 py-2 rounded-xl"
            >
              Réessayer
            </button>

            <button
              onClick={uploadPhoto}
              disabled={loading}
              className="bg-lacite text-white px-4 py-2 rounded-xl"
            >
              {loading ? "Upload..." : "Utiliser cette photo"}
            </button>

          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

    </div>
  )
}