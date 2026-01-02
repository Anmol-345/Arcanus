"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Chrome } from "lucide-react"

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push("/")
    })
  }, [router])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
          redirectTo: "https://arcanus-chi.vercel.app/"
      },
    })

    if (error) console.error("Login error:", error.message)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] px-4">
      <Card className="w-full max-w-md bg-[#2a2a2a] border-gray-700 text-white shadow-xl">
        <CardHeader className="flex flex-col items-center space-y-4">
          <img
            src="/apple-touch-icon.png"
            alt="Arcanus Logo"
            className="size-16 rounded-xl"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold">Arcanus</h1>
            <p className="mt-1 text-sm text-gray-400">
              Secure, ephemeral chat rooms
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator className="bg-gray-700" />

          <p className="text-center text-sm text-gray-400">
            Sign in to create or join private rooms
          </p>

          <Button
            onClick={handleGoogleLogin}
            className="w-full gap-2"
            size="lg"
          >
            <Chrome className="size-5" />
            Continue with Google
          </Button>

          <p className="text-center text-xs text-gray-500">
            By continuing, you agree to Arcanus’ ephemeral room policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
