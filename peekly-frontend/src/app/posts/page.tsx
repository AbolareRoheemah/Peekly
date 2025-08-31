"use client"

import Image from "next/image"
import { useState } from "react"

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    thumbnail: "/abstract-digital-composition.png",
    caption: "Exclusive digital artwork - Limited edition NFT collection",
    price: "0.05 ETH",
    creator: "artist_crypto",
    isPurchased: false,
  },
  {
    id: 2,
    thumbnail: "/music-waveform-visualization.png",
    caption: "Unreleased track from my upcoming album 🎵",
    price: "0.02 ETH",
    creator: "musicmaker_eth",
    isPurchased: false,
  },
  {
    id: 3,
    thumbnail: "/photography-landscape.png",
    caption: "Behind the scenes content from my latest photoshoot",
    price: "0.01 ETH",
    creator: "photographer_pro",
    isPurchased: true,
  },
  {
    id: 4,
    thumbnail: "/video-thumbnail.png",
    caption: "Tutorial: Advanced trading strategies revealed",
    price: "0.08 ETH",
    creator: "crypto_trader",
    isPurchased: false,
  },
  {
    id: 5,
    thumbnail: "/document-preview.png",
    caption: "My complete guide to DeFi investing (50+ pages)",
    price: "0.03 ETH",
    creator: "defi_expert",
    isPurchased: false,
  },
]

export default function PostsPage() {
  const [posts, setPosts] = useState(mockPosts)

  const handlePurchase = (postId: number) => {
    // Mock purchase functionality - in real app this would trigger smart contract
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isPurchased: true } : post)))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-purple-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/peekly-logo.png" alt="Peekly" width={32} height={32} className="invert" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Peekly
            </h1>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Create Post
          </button>
        </div>
      </header>

      {/* Posts Feed */}
      <main className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-900/50 border border-purple-900/30 rounded-xl overflow-hidden hover:border-purple-700/50 transition-colors"
            >
              {/* Post Header */}
              <div className="p-4 border-b border-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {post.creator[0].toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm">@{post.creator}</span>
                  </div>
                  <div className="text-purple-400 font-semibold">{post.price}</div>
                </div>
              </div>

              {/* Post Content */}
              <div className="relative">
                <div className={`relative ${!post.isPurchased ? "blur-xl" : ""}`}>
                  <Image
                    src={post.thumbnail || "/placeholder.svg"}
                    alt="Post content"
                    width={800}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                </div>

                {/* Blur overlay for unpurchased content */}
                {!post.isPurchased && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔒</div>
                      <p className="text-white font-medium mb-4">Purchase to unlock content</p>
                      <button
                        onClick={() => handlePurchase(post.id)}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                      >
                        Buy for {post.price}
                      </button>
                    </div>
                  </div>
                )}

                {/* Purchased indicator */}
                {post.isPurchased && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Owned
                  </div>
                )}
              </div>

              {/* Post Caption */}
              <div className="p-4">
                <p className="text-gray-200 leading-relaxed">{post.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-gray-800 hover:bg-gray-700 border border-purple-900/30 px-8 py-3 rounded-lg text-gray-300 hover:text-white transition-colors">
            Load More Posts
          </button>
        </div>
      </main>
    </div>
  )
}
