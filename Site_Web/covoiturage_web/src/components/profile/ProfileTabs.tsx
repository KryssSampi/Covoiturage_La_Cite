

type Props = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function ProfileTabs({  activeTab, setActiveTab }: Props) {

  const tabs = [
    { id: "info", label: "Informations" },
    { id: "photo", label: "Photo de profil" },
    { id: "public", label: "Profil Public" },
    { id: "security", label: "Sécurité" },
    { id: "danger", label: "Danger" }
  ]

  return (
    <div className="flex gap-2 border-b mb-6">

      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === tab.id
              ? "bg-lacite text-white"
              : "text-gray-600 hover:bg-lacite/10"
          }`}
        >
          {tab.label}
        </button>
      ))}

    </div>
  )
}