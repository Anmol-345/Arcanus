"use client"

import { useEffect, useState } from "react"

export default function ArcanusLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f0f0f] text-white">
      {/* Logo */}
      <img
        src="/android-chrome-192x192.png"
        alt="Arcanus Logo"
        className="mb-6 h-20 w-20"
      />

      {/* Message */}
      <p className="mb-6 text-sm text-gray-400 tracking-wide">
        Entering the Arcane Network…
      </p>

      {/* Loader */}
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
    </div>
  )
}
