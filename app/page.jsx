"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation" // <-- Added this import

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, KeyRound } from "lucide-react";

export default function Home() {
  const router = useRouter()

  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roomToken, setRoomToken] = useState("")
  const [userEmail, setUserEmail] = useState(null); // New state for user email

  // -----------------------------
  // Fetch authenticated user
  // -----------------------------
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Auth error:", error)
      }

      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? null); // Set user email
      setLoading(false)
    }

    initAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setUserEmail(session?.user?.email ?? null); // Update user email on auth state change
    })

    return () => subscription.unsubscribe()
  }, [])

  // -----------------------------
  // Create room
  // -----------------------------
  const createRoom = async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from("Chatroom")
      .insert({})
      .select("token")
      .single()

    if (error) {
      console.error("Create room failed:", error)
      return
    }

    // Redirect creator directly into room
    router.push(`/chatroom/${data.token}`)
  }

  // -----------------------------
  // Join room
  // -----------------------------
  const enterRoom = async (e) => {
    e.preventDefault()
    if (!roomToken) return

    const { data, error } = await supabase.rpc("join_chatroom", {
      room_token: roomToken
    })

    if (error) {
      console.error("Join room error:", error)
      return
    }

    if (!data) {
      alert("Room is full or invalid")
      return
    }

    router.push(`/chatroom/${roomToken}`)
  }

  // -----------------------------
  // Logout
  // -----------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // -----------------------------
  // UI
  // -----------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e1e1e] text-white p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-[#2a2a2a] rounded-lg shadow-lg text-center">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/apple-touch-icon.png"
            alt="Arcanus Logo"
            className="size-20 rounded-lg"
          />
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Arcanus</h1>
          <p className="text-sm sm:text-base text-gray-400">Your secure chat portal.</p>
        </div>

        <div className="space-y-4">
          {!userId && (
            <div className="text-center text-gray-400 pb-4">
              <p>You must be logged in to create or join a room.</p>
              <a href="/login" className="text-blue-500 hover:underline">
                Go to Login
              </a>
            </div>
          )}
          <Button
            onClick={createRoom}
            disabled={!userId}
            className="w-full"
            size="lg"
          >
            Create a New Room
          </Button>

          <div className="flex items-center before:flex-1 before:border-t before:border-gray-600 before:me-6 after:flex-1 after:border-t after:border-gray-600 after:ms-6">
            <p className="text-sm text-gray-400">OR</p>
          </div>

          <form onSubmit={enterRoom} className="flex flex-col space-y-4">
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter Room Token"
                  value={roomToken}
                  onChange={(e) => setRoomToken(e.target.value)}
                  disabled={!userId}
                  className="pl-10 bg-white text-black placeholder:text-gray-500"
                />
            </div>
            <Button
              type="submit"
              disabled={!userId}
              variant="secondary"
            >
              Join a Room
            </Button>
          </form>
        </div>

        {userId && (
          <div className="text-xs text-gray-500 pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="mx-auto flex items-center gap-1 text-xs text-gray-500">
                  <span className="truncate">{userEmail || userId}</span>
                  <LogOut className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium leading-none">Logged In As</p>
                  <p className="truncate text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
