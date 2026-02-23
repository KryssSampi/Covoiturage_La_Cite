import { UserModel,  UserRole } from "../../domain/models/UserModel";

export const Testusers : UserModel[] = [
    {
        id: "1",
        nom: "Doe",
        prenom: "John",
        email: "010101@collegelacite.ca",
        role: UserRole.PASSENGER,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        microsoft_id: "",
        can_be_driver: false,
        is_active: false,
        profile_verified: false,

    },
    {
        id: "2",
        nom: "Smith",
        prenom: "Jane",
        email: "020202@collegelacite.ca",
        role: UserRole.DRIVER,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        microsoft_id: "",
        can_be_driver: true,
        is_active: false,
        profile_verified: false,
    },
    {
        id: "3",
        nom: "Admin",
        prenom: "User",
        email: "030303@collegelacite.ca",
        role: UserRole.ADMIN,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        microsoft_id: "",
        can_be_driver: false,
        is_active: false,
        profile_verified: false,

    }
]