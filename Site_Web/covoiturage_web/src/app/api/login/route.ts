import { NextResponse } from "next/server"
import { z } from "zod"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const backendUrl = process.env.BACKEND_URL

    const res = await axios.post(
      `${backendUrl}/api/Auth/login`,
      {
        email: body.email,
        password: body.password,
      },
      {
        withCredentials: true,
      }
    )

    return NextResponse.json(res.data, { status: 200 })

  } catch (err: any) {

    if (err.response) {
      return NextResponse.json(
        {
          error: err.response.data?.message || "Erreur backend",
          code: err.response.data?.code
        },
        { status: err.response.status }
      )
    }

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { errors: err.flatten().fieldErrors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: err?.message || "Erreur serveur, veuillez réessayer" },
      { status: 500 }
    )
  }
}