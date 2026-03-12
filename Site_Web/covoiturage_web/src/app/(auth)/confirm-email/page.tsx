"use client"

import { useSearchParams } from "next/navigation"
import { useConfirmEmail } from "@/lib/hooks/useConfirmEmail"
import ConfirmEmailView from "@/components/auth/ConfirmEmailView"

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const { status, message } = useConfirmEmail(token)

  return <ConfirmEmailView status={status} message={message} />
}