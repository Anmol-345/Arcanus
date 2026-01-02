"use client"

import { useParams } from "next/navigation"
import { useState } from "react"

export default function ChatRoom() {
  const { room } = useParams()
  const [copied, setCopied] = useState(false)

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(room)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-[#1a1a1a] p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-semibold">
          Arcanus Chat Room
        </h1>

        <div className="rounded-lg bg-[#111] p-4 text-center">
          <p className="mb-2 text-sm text-gray-400">Room Code</p>
          <p className="break-all font-mono text-lg">{room}</p>
        </div>

        <button
          onClick={copyRoomCode}
          className="mt-4 w-full rounded-lg border border-gray-600 px-4 py-2 text-sm hover:bg-gray-800 transition"
        >
          {copied ? "Copied!" : "Copy Room Code"}
        </button>
      </div>
    </div>
  )
}
