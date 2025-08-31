"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"owned" | "purchased">("owned")

  // Mock user data
  const user = {
    name: "Alex Chen",
    profilePicture: "/diverse-group-profile.png",
    totalPosts: 12,
    totalPurchases: 8,
  }

  // Mock owned posts
  const ownedPosts = [
    {
      id: 1,
      thumbnail: "/abstract-digital-composition.png",
      caption: "Digital art collection #1",
      price: "0.05 ETH",
      sales: 3,
    },
    {
      id: 2,
      thumbnail: "/music-waveform-visualization.png",
      caption: "Exclusive beat pack",
      price: "0.08 ETH",
      sales: 7,
    },
    {
      id: 3,
      thumbnail: "/photography-landscape.png",
      caption: "Sunset photography series",
      price: "0.03 ETH",
      sales: 2,
    },
  ]

  // Mock purchased posts
  const purchasedPosts = [
    {
      id: 4,
      thumbnail: "/video-thumbnail.png",
      caption: "Tutorial: Advanced editing",
      creator: "Sarah Kim",
      purchaseDate: "2 days ago",
    },
    {
      id: 5,
      thumbnail: "/document-preview.png",
      caption: "Business strategy guide",
      creator: "Mike Johnson",
      purchaseDate: "1 week ago",
    },
  ]

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
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <span>{user.totalPosts} Posts</span>
            <span>{user.totalPurchases} Purchases</span>
          </div>
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
                      <span className="text-xs text-gray-500">{post.sales} sales</span>
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
                      <span>{post.purchaseDate}</span>
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
      </div>
    </div>
  )
}
