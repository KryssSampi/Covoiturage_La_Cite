"use client";
import React from "react";
import { Language, useAppState } from "@/app/app_state"
import Link from "next/link"

export default function loginPage() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const appState = useAppState()
    return(
    <div className="bg-white">
        <Link href=" " >
{appState.lang === Language.FR ? "Connecter Vous" : "Sign In"}
        </Link>
    </div>
    )
}