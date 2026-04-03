"use client"

import { useEffect, useRef, useState } from "react"
import { backend } from "@/lib/api/backend"
import { getProfile, updateProfile, ProfileDto } from "@/lib/services/profile.service"
import { useAuthStore } from "@/store/useAuthStore"
import { tr } from "zod/locales"


export default function ProfilePage() {

  const setUser = useAuthStore((s) => s.setUser)
const user = useAuthStore((s) => s.user)

  const [activeTab, setActiveTab] = useState("info")

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [preview, setPreview] = useState<string | null>(null)

  const [cameraOpen, setCameraOpen] = useState(false)
  const [captured, setCaptured] = useState(false)

  const [ passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }



  const fileInput = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)



  const [profile, setProfile] = useState<ProfileDto>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetNumber: "",
    streetName: "",
    apartment: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",

   isPublic: false,
   bio:"",
 
  })

  const tabs = [
    { id: "info", label: "Informations" },
    { id: "photo", label: "Photo profil" },
    { id: "security", label: "Sécurité" },
    { id: "public", label: "Profil Public" },
    
  ]

  {/*---------------- LOAD PROFILE ---------------- */}

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const data = await getProfile()

        setProfile(data)

        if (data.profileImageUrl) {
          setPreview(data.profileImageUrl)
        }

      } catch {

        setError("Erreur chargement profil")

      }

    }

    loadProfile()

  }, [])

  {/*---------------- UPDATE PROFILE ---------------- */}

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target

  setProfile(prev => ({
    ...prev,
    [name]: value
  }))
}

  const handleUpdate = async () => {

    try {

      setLoading(true)

      await updateProfile(profile)

      setMessage("Profil mis à jour avec succès ")

    } catch {

      setError("Erreur lors de la mise à jour")

    } finally {

      setLoading(false)

    }

  }

   {/* ---------------- UPLOAD FILE ---------------- */}

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

      setMessage("Photo mise à jour 📷")

    } catch {

      setError("Erreur upload photo")

    } finally {

      setUploading(false)

    }

  }

  {/* ---------------- OPEN CAMERA ---------------- */} 

  const openCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setCameraOpen(true)

    } catch {

      setError("Impossible d'accéder à la caméra")

    }

  }

  {/* ---------------- STOP CAMERA ---------------- */} 

  const stopCamera = () => {

    const stream = videoRef.current?.srcObject as MediaStream

    stream?.getTracks().forEach(track => track.stop())

    setCameraOpen(false)
    setCaptured(false)

  }

  {/* ---------------- CAPTURE PHOTO ---------------- */} 

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

  {/* ---------------- SAVE PHOTO ---------------- */} 

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

        setMessage("Photo enregistrée 📸")

        stopCamera()

      } catch {

        setError("Erreur sauvegarde photo")

      } finally {

        setUploading(false)

      }

    }, "image/jpeg")

  }

  {/* ---------------- Retake Photo ---------------- */}  

  const retakePhoto = () => {

    setCaptured(false)

  }

  {/* Modification du le mot de passe  */  }

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas")
      return
    }

  try {
    setLoading(true)

    // Appel à l'API pour changer le mot de passe

     await backend.post("/api/profile/change-password", passwordData)

    setMessage("Mot de passe changé avec succès ✅")

  } catch {


    setError("Erreur lors de la modification du mot de passe")

  } finally {


    setLoading(false)

  } 
  }

  
  return (

    <div className="p-6 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Gestion du Profil
      </h1>

      {/** Tabs */}

      <div className="flex gap-2 border-b mb-6 overflow-x-auto">

        {tabs.map(tab => (

          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === tab.id
                ? "bg-lacite text-white"
                : "text-gray-600"
            }`}
          >
            {tab.label}
          </button>

        ))}

      </div>
     

      <div className="bg-white p-6 rounded-2xl shadow">

 {/*---------------- INFO ---------------- */ }

{activeTab === "info" && (

  <div className="space-y-4">

    <div className="grid md:grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-medium mb-1">
          Prénom
        </label>
        <input
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          className="border p-3 rounded-xl w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Nom
        </label>
        <input
          name="lastName"
          value={profile.lastName}
          onChange={handleChange}
          className="border p-3 rounded-xl w-full"
        />
      </div>

    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Courriel
      </label>
      <input
        name="email"
        value={profile.email}
        disabled
        className="border p-3 rounded-xl w-full bg-gray-100"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Téléphone
      </label>
      <input
        name="phone"
        value={profile.phone}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full"
      />
    </div>
            {/*---------------- Adresse ---------------- */}

<div className="border-t pt-4 mt-4 space-y-4">

  <h2 className="text-lg font-semibold text-gray-700">
    Adresse
  </h2>

  <div className="grid md:grid-cols-2 gap-4">

    <div>
      <label className="block text-sm font-medium mb-1">
        Numéro de rue
      </label>
      <input
        name="streetNumber"
        value={profile.streetNumber || ""}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Nom de la rue
      </label>
      <input
        name="streetName"
        value={profile.streetName || ""}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
      />
    </div>

  </div>

  <div>
    <label className="block text-sm font-medium mb-1">
      Appartement / Unité
    </label>
    <input
      name="apartment"
      value={profile.apartment || ""}
      onChange={handleChange}
      className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
    />
  </div>

  <div className="grid md:grid-cols-2 gap-4">

    <div>
      <label className="block text-sm font-medium mb-1">
        Ville
      </label>
      <input
        name="city"
        value={profile.city || ""}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Province
      </label>
      <input
        name="province"
        value={profile.province || ""}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
      />
    </div>

  </div>

  <div className="grid md:grid-cols-2 gap-4">

    <div>
      <label className="block text-sm font-medium mb-1">
        Code postal
      </label>
      <input
        name="postalCode"
        value={profile.postalCode || ""}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Pays
      </label>
      <input
        name="country"
        value={profile.country || ""}
        onChange={handleChange}
        className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
      />
    </div>

  </div>

</div>

            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-lacite text-white px-6 py-2 rounded-xl"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>

          </div>

        )}

        {/*---------------- PHOTO ---------------- */ }

        {activeTab === "photo" && (

          <div className="space-y-4">

            {preview && (

              <img
                src={
                  preview.startsWith("data:")
                    ? preview
                    : `${process.env.NEXT_PUBLIC_API_URL}${preview}`
                }
                className="w-40 h-40 rounded-full object-cover border"
              />

            )}

            <input
              type="file"
              hidden
              ref={fileInput}
              accept="image/*"
              onChange={(e) => {

                if (e.target.files?.[0]) {
                  uploadFile(e.target.files[0])
                }

              }}
            />

            <div className="flex gap-3">

              <button
                onClick={() => fileInput.current?.click()}
                className="bg-lacite text-white px-4 py-2 rounded-xl"
              >
                Upload photo
              </button>

              <button
                onClick={openCamera}
                className="bg-gray-600 text-white px-4 py-2 rounded-xl"
              >
                Utiliser la caméra
              </button>

            </div>

            {cameraOpen && (

              <div className="space-y-3">

                {!captured && (

                  <video
                    ref={videoRef}
                    autoPlay
                    className="w-full max-w-sm rounded-xl border"
                  />

                )}

                {captured && preview && (

                  <img
                    src={preview}
                    className="w-24 h-24 md:w-40 md:h-40 rounded-full object-cover border"
                  />

                )}

                <div className="flex flex-col md:flex-row gap-3">

                  {!captured && (

                    <button
                      onClick={capturePhoto}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl"
                    >
                      📸 Prendre photo
                    </button>

                  )}

                  {captured && (

                    <>
                      <button
                        onClick={retakePhoto}
                        className="bg-gray-600 text-white px-4 py-2 rounded-xl"
                      >
                        🔄 Reprendre
                      </button>

                      <button
                        onClick={savePhoto}
                        disabled={uploading}
                        className="bg-lacite text-white px-4 py-2 rounded-xl"
                      >
                        {uploading ? "Envoi..." : "💾 Sauvegarder"}
                      </button>
                    </>

                  )}

                  <button
                    onClick={stopCamera}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl"
                  >
                    ❌ Annuler
                  </button>

                </div>

                <canvas ref={canvasRef} hidden />

              </div>

            )}

          </div>

        )}

        {/*---------------- SECURITY ---------------- */ }

        {activeTab === "security" && (

          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-semibold text-gray-700">
              Changer le mot de passe
            </h2>
            <input 
            type="password"
            name="currentPassword"
            placeholder="Mot de passe actuel"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
               />

            <input
            type="password"
            name="newPassword"  
            placeholder="Nouveau mot de passe"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
            />

            <input
            type="password"
            name="confirmNewPassword"
            placeholder="Confirmer le nouveau mot de passe" 
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-lacite"
            />

            <button
            onClick={updatePassword}
            className="bg-lacite text-white px-6 py-2 rounded-xl"
            >
               Mettre à jour le mot de passe   
            </button>
        </div>
        )}

        {/*---------------- PUBLIC PROFILE ---------------- */    }
        {activeTab === "public" && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-semibold text-gray-700">
              Profil Public
            </h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"   
                checked={profile.isPublic || false  }
                onChange={(e) => setProfile({
                  ...profile,
                  isPublic: e.target.checked
                })
              }
              />
              
                Rendre le profil public
                
            </label>

            <textarea
            name="bio"
            placeholder="Parle un peu de toi"
            value={profile.bio || ""}
            
            onChange={handleChange}
            className="border p-3 rounded-xl w-full h-32 focus:ring-2 focus:ring-lacite"
            />
             <button
            onClick={handleUpdate}
            className="bg-lacite text-white px-6 py-2 rounded-xl"
            >
           Enregistrer
            </button> 
            
              
          </div>
        )}


      </div>

    </div>

  )
}
