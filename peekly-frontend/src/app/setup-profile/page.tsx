"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function SetupProfile() {
  const [name, setName] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)

    try {
      // In a real app, you'd get the current user ID from auth context
      const currentUserId = "user_1" // Mock user ID
      
      const result = await api.setup.createProfile({
        name,
        profileImage,
        bio: undefined, // Could add bio field to the form
        website: undefined // Could add website field to the form
      }, currentUserId)

      if (result.success) {
        // Redirect to posts page
        router.push("/posts")
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      alert("Failed to create profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <img src="/peekly-logo.png" alt="Peekly Logo" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">Add your photo and name to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-6 border border-purple-500/20">
          {/* Profile Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Profile Photo</label>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {previewUrl ? (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Choose Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </main>
  )
}
