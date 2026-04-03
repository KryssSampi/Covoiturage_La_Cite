import { getPublicProfile } from "@/lib/services/profile.service"

type PublicProfile = {
  id: number
  firstName: string
  lastName: string
  bio?: string
  profileImageUrl?: string
  totalTrips: number
  rating: number
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  //const numericId = Number(id)
 

  let user: PublicProfile | null = null

  try {
    user = await getPublicProfile(id)
  } catch (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Profil introuvable ou privé 🚫
      </div>
    )
  }

  if (!user) {
  return (
    <div className="flex justify-center items-center h-screen text-red-500">
      Profil introuvable 🚫
    </div>
  )
}

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-6">

        {/* PHOTO */}
        <img
          src={
            `${process.env.NEXT_PUBLIC_API_URL}${user.profileImageUrl}` ||
            "https://via.placeholder.com/150"
          }
          alt="profile"
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border"
        />

        {/* INFOS */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h1>

          <p className="text-gray-500 mt-2">
            {user.bio || "Aucune description"}
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mt-8 text-center">

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-2xl font-bold">{user.totalTrips}</p>
          <p className="text-gray-500 text-sm">Trajets</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-2xl font-bold">⭐ {user.rating.toFixed(1)}</p>
          <p className="text-gray-500 text-sm">Note</p>
        </div>

      </div>

      {/* ACTION */}
      <div className="mt-8 text-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Contacter 🚗
        </button>
      </div>

    </div>
  )
}