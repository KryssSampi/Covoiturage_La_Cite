import {NextResponse} from "next/server";
import { registerSchema } from "@/lib/validation/auth.schema";
import { z } from "zod";
import { register } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const body = await request.json()   
     const response = await register(body)
    return NextResponse.json({ message: response.message }, { status: 201 })
  }
    catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ errors: err.flatten().fieldErrors }, { status: 400 })
        }
        return NextResponse.json({ error: err?.message || "Erreur serveur, veuillez réessayer" }, { status: 500 })
    }
}