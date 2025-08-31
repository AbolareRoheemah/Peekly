"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { api, User, Post, formatDate } from "@/lib/api"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"owned" | "purchased">("owned")
  const [user, setUser] = useState<User | null>(null)
  const [ownedPosts, setOwnedPosts] = useState<Post[]>([])
  const [purchasedPosts, setPurchasedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user data on component mount
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      // In a real app, you'd get the current user ID from auth context
      const currentUserId = "user_1" // Mock user ID
      
      const [userData, owned, purchased] = await Promise.all([
        api.profile.getUserProfile(currentUserId),
        api.profile.getOwnedPosts(currentUserId),
        api.profile.getPurchasedPosts(currentUserId)
      ])

      setUser(userData)
      setOwnedPosts(owned)
      setPurchasedPosts(purchased)
    } catch (err) {
      setError("Failed to load profile data")
      console.error("Error loading profile:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-purple-900/30">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/posts" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back
          </Link>
          <Image src="/peekly-logo.png" alt="Peekly" width={32} height={32} className="h-8 w-auto" />
          <div className="w-12" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={loadUserData}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && user && (
          <>
            {/* Profile Section */}
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <Image
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className="rounded-full object-cover border-2 border-purple-500"
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
              <div className="flex justify-center gap-6 text-sm text-gray-400 mb-4">
                <span>{user.totalPosts} Posts</span>
                <span>{user.totalPurchases} Purchases</span>
              </div>
              {user.bio && (
                <p className="text-gray-300 text-sm max-w-md mx-auto mb-4">{user.bio}</p>
              )}
              {user.totalEarnings && (
                <div className="text-purple-400 font-semibold">
                  Total Earnings: {user.totalEarnings}
                </div>
              )}
            </div>

        {/* Toggle Tabs */}
        <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("owned")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "owned" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab("purchased")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "purchased" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Purchased
          </button>
        </div>

            {/* Toggle Tabs */}
            <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab("owned")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "owned" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                My Posts
              </button>
              <button
                onClick={() => setActiveTab("purchased")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "purchased" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Purchased
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTab === "owned"
                ? // Owned Posts
                  ownedPosts.map((post) => (
                    <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={post.thumbnail || "/placeholder.svg"}
                          alt={post.caption}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{post.caption}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 font-semibold">{post.price}</span>
                          <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                : // Purchased Posts
                  purchasedPosts.map((post) => (
                    <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={post.thumbnail || "/placeholder.svg"}
                          alt={post.caption}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Owned</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{post.caption}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>by {post.creator}</span>
                          <span>{post.purchaseDate ? formatDate(post.purchaseDate) : "Recently"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Empty State */}
            {((activeTab === "owned" && ownedPosts.length === 0) ||
              (activeTab === "purchased" && purchasedPosts.length === 0)) && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">
                  {activeTab === "owned" ? "No posts created yet" : "No purchases yet"}
                </div>
                <p className="text-sm text-gray-600">
                  {activeTab === "owned"
                    ? "Start creating content to monetize your posts"
                    : "Explore the feed to discover amazing content"}
                </p>
              </div>
            )}
          </>
        )}


      </div>
    </div>
  )
}
