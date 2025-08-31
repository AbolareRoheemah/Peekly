"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { api, Post, formatDate } from "@/lib/api"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { usePayETH, usePayToken } from "@/hooks/use-contracts"
import { toast } from "sonner"

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { address, isConnected } = useAccount()
  const { payETH, isPayETHLoading } = usePayETH()
  const { payToken, isPayTokenLoading } = usePayToken()

  // Load posts on component mount
  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const result = await api.posts.getAll(pageNum, 6)
      if (pageNum === 1) {
        setPosts(result.posts)
      } else {
        setPosts(prev => [...prev, ...result.posts])
      }
      setHasMore(result.hasMore)
      setPage(pageNum)
    } catch (err) {
      setError("Failed to load posts")
      console.error("Error loading posts:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handles purchase using the contract
  const handlePurchase = async (post: Post) => {
    if (!isConnected || !address) {
      toast("Please connect your wallet to purchase.")
      return
    }
    try {
      // Payment logic: ETH or ERC20
      // Assume post.paymentToken: "ETH" or ERC20 address, post.price: string (in ETH or token units)
      if (!post.paymentToken || post.paymentToken === "ETH") {
        // ETH payment
        const value = BigInt(Math.floor(Number(post.price) * 1e18))
        await payETH(post.creator, post.id.toString(), value)
      } else {
        // ERC20 payment
        // For simplicity, assume post.price is in token decimals (e.g. 6 for USDC, 18 for LSK)
        // You may want to store decimals in post or have a mapping
        // Here, we assume 18 decimals for all tokens for demo
        const decimals = post.tokenDecimals ?? 18
        const value = BigInt(Math.floor(Number(post.price) * 10 ** decimals))
        await payToken(post.creator, post.id.toString(), value, post.paymentToken)
      }
      // Optimistically update UI (ideally, refetch after tx confirmation)
      setPosts(posts.map((p) => 
        p.id === post.id 
          ? { ...p, isPurchased: true, purchaseDate: new Date().toISOString() }
          : p
      ))
    } catch (err) {
      console.error("Purchase failed:", err)
      toast.error("Purchase failed. Please try again.")
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1)
    }
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

      {/* Wallet Connect */}
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-6">
        {!isConnected && (
          <div className="flex justify-center mb-6">
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Posts Feed */}
      <main className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
        {loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading posts...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => loadPosts(1)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
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
                    <div className="text-purple-400 font-normal text-xs">
                      {post.price}{" "}
                      {post.paymentToken && post.paymentToken !== "ETH"
                        ? (post.tokenSymbol || "TOKEN")
                        : ""}
                    </div>
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
                        {isConnected ? (
                          <button
                            onClick={() => handlePurchase(post)}
                            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                            disabled={isPayETHLoading || isPayTokenLoading}
                          >
                            {(isPayETHLoading || isPayTokenLoading)
                              ? "Processing..."
                              : `Buy for ${post.price} ${
                                  post.paymentToken && post.paymentToken !== "ETH"
                                    ? (post.tokenSymbol || "TOKEN")
                                    : ""
                                }`}
                          </button>
                        ) : (
                          <ConnectButton />
                        )}
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
                  <p className="text-gray-200 leading-relaxed mb-2">{post.caption}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>{post.fileType} • {post.fileSize}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button 
              onClick={loadMore}
              className="bg-gray-800 hover:bg-gray-700 border border-purple-900/30 px-8 py-3 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}

        {loading && posts.length > 0 && (
          <div className="text-center mt-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        )}
      </main>
    </div>
  )
}
