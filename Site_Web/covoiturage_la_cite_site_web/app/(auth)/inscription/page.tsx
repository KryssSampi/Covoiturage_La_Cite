"use client";
import React, { useState } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import Link from "next/link";

export default function InscriptionPage() {
    const appState = useAppState();
    const isFR = appState.lang === Language.FR;

    const [form, setForm] = useState({
        prenom: "",
        nom: "",
        email: "",
        motDePasse: "",
        confirmation: "",
        role: "passager",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: appel API d'inscription
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-blue-800 mb-2 text-center">
                    {isFR ? "Créer un compte" : "Create an account"}
                </h1>
                <p className="text-center text-gray-500 mb-6">
                    {isFR ? "Rejoignez la communauté Covoiturage La Cité" : "Join the Covoiturage La Cité community"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isFR ? "Prénom" : "First name"}
                            </label>
                            <input
                                type="text"
                                name="prenom"
                                value={form.prenom}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={isFR ? "Prénom" : "First name"}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {isFR ? "Nom" : "Last name"}
                            </label>
                            <input
                                type="text"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={isFR ? "Nom" : "Last name"}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isFR ? "Adresse e-mail" : "Email address"}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="exemple@lacite.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isFR ? "Rôle" : "Role"}
                        </label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="passager">{isFR ? "Passager" : "Passenger"}</option>
                            <option value="conducteur">{isFR ? "Conducteur" : "Driver"}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isFR ? "Mot de passe" : "Password"}
                        </label>
                        <input
                            type="password"
                            name="motDePasse"
                            value={form.motDePasse}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isFR ? "Confirmer le mot de passe" : "Confirm password"}
                        </label>
                        <input
                            type="password"
                            name="confirmation"
                            value={form.confirmation}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-800 text-white py-3 rounded-full font-semibold text-lg
                                   hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        {isFR ? "Créer mon compte" : "Create my account"}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-6 text-sm">
                    {isFR ? "Vous avez déjà un compte ?" : "Already have an account?"}{" "}
                    <Link href="/login" className="text-blue-800 font-semibold hover:underline">
                        {isFR ? "Se connecter" : "Sign in"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
