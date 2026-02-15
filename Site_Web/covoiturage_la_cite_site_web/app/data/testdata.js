import { UserModel } from "../models";
import { UserRole } from "../models/UserModel";

export const Testusers  = [
    {
        id: "1",
        nom: "Doe",
        prenom: "John",
        email: "010101@collegelacite.ca",
        role: UserRole.PASSENGER,
        created_at: new Date(),
        updated_at: new Date(),
        microsoft_id: "",
        is_active: false,
        profile_verified: false,

    },
    {
        id: "2",
        nom: "Smith",
        prenom: "Jane",
        email: "020202@collegelacite.ca",
        role: UserRole.DRIVER,
        created_at: new Date(),
        updated_at: new Date(),
        microsoft_id: "",
        is_active: false,
        profile_verified: false,
    },
    {
        id: "3",
        nom: "Admin",
        prenom: "User",
        email: "030303@collegelacite.ca",
        role: UserRole.ADMIN,
        created_at: new Date(),
        updated_at: new Date(),
        microsoft_id: "",
        is_active: false,
        profile_verified: false,

    }
]