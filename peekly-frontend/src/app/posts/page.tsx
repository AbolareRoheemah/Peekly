"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { useAccount } from "wagmi"
import { usePayETH, usePayToken, useHasPaid, useApproveToken, useTokenAllowance } from "@/hooks/use-contracts"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import Header from "@/components/header"

// Supported tokens configuration
const SUPPORTED_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: null, // null for native ETH
    decimals: 18,
  },
  {
    symbol: 'LSK',
    name: 'Lisk',
    address: process.env.NEXT_PUBLIC_LSK_TOKEN_ADDRESS as `0x${string}`,
    decimals: 18,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS as `0x${string}`,
    decimals: 6,
  },
]

// Helper to format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Type for post (based on API response)
type User = {
  id: string
  username: string
  address: string
}

type Post = {
  likeCount: number
  id: string
  user: User
  ipfs: string
  description: string
  price: number
  creatorAddress?: string | undefined
  createdAt: string
  isPurchased?: boolean
  purchaseDate?: string
  isLiked: boolean
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [payingPostId, setPayingPostId] = useState<string | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [likingPostId, setLikingPostId] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0])

  const { address, isConnected } = useAccount()
  const { payETH, isPayETHLoading, isPayETHSuccess } = usePayETH()
  const { payToken, isPayTokenLoading, isPayTokenSuccess } = usePayToken()
  const { approve, isApproveLoading, isApproveSuccess } = useApproveToken()
  const router = useRouter()
  const payTokenContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const { 
    data: getAllowance, 
    isPending: isAllowanceLoading 
  } = useTokenAllowance(
    selectedToken.address, 
    address ?? "", 
    payTokenContractAddress
  );
  const { 
    data: hasPaidData, 
    isPending: hasPaidPending 
  } = useHasPaid(
    address ? address.toString() : "", 
    selectedPost?.id ?? ""
  );

  // Use Privy for authentication and wallet info
  const { ready, authenticated, user } = usePrivy()

  // State for allowance and approval
  const [allowance, setAllowance] = useState<bigint>(BigInt(0))
  const [needsApproval, setNeedsApproval] = useState(false)
  const [checkingAllowance, setCheckingAllowance] = useState(false)
  const [approvalCheckedToken, setApprovalCheckedToken] = useState<string | null>(null)

  // Fetch posts from API
  const fetchPosts = async (pageNum: number = 1, limit: number = 20) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      })
      // No need to include userAddress for purchase status, we'll use the hook
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch posts")
      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Failed to fetch posts")
      setPosts(prev => {
        // Avoid duplicates if API returns overlapping posts
        const existingIds = new Set(prev.map(p => p.id))
        const newPosts = data.posts.filter((p: Post) => !existingIds.has(p.id))
        return [...prev, ...newPosts]
      })
      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)
    } catch (err: any) {
      setError(err.message || "Failed to load posts")
      console.error("Error loading posts:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
  }, [address]) // Refetch when wallet connects

  // Infinite scroll: load more when near bottom
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return
    if (!loaderRef.current) return
    const rect = loaderRef.current.getBoundingClientRect()
    if (rect.top < window.innerHeight + 200) {
      fetchPosts(page + 1)
    }
  }, [hasMore, loading, page])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Update post purchase status after successful payment
  useEffect(() => {
    if ((isPayETHSuccess || isPayTokenSuccess) && payingPostId) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === payingPostId
            ? { ...post, isPurchased: true, purchaseDate: new Date().toISOString() }
            : post
        )
      )
      // setPaidMap(prev => ({
      //   ...prev,
      //   [payingPostId]: true,
      // }))
      setPayingPostId(null)
      setPaymentModalOpen(false)
      setSelectedPost(null)
    }
  }, [isPayETHSuccess, isPayTokenSuccess, payingPostId])

  // Check allowance for ERC20 tokens when payment modal opens or token changes
  useEffect(() => {
    const checkAllowance = async () => {
      if (
        !selectedPost ||
        !selectedToken ||
        !selectedToken.address ||
        !address ||
        !payTokenContractAddress
      ) {
        setNeedsApproval(false)
        setAllowance(BigInt(0))
        setApprovalCheckedToken(null)
        return
      }
      setCheckingAllowance(true)
      try {
        const token = SUPPORTED_TOKENS.find(t => t.address === selectedToken.address)
        if (!token) throw new Error("Unsupported token")
        const amount = BigInt(Math.floor(Number(selectedPost.price) * Math.pow(10, token.decimals)))
        setAllowance(BigInt(Number(getAllowance)))
        setApprovalCheckedToken(selectedToken.address)
        setNeedsApproval(Number(getAllowance) < amount)
      } catch (err) {
        setNeedsApproval(true)
        setAllowance(BigInt(0))
        setApprovalCheckedToken(selectedToken.address)
      } finally {
        setCheckingAllowance(false)
      }
    }

    if (
      paymentModalOpen &&
      selectedToken &&
      selectedToken.address &&
      address &&
      payTokenContractAddress
    ) {
      checkAllowance()
    } else {
      setNeedsApproval(false)
      setAllowance(BigInt(0))
      setApprovalCheckedToken(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentModalOpen, selectedToken, selectedPost, address, payTokenContractAddress])

  // Open payment modal
  const handlePurchaseClick = (post: Post) => {
    if (!isConnected || !address) {
      toast("Please sign in and connect your wallet to purchase.")
      return
    }
    setSelectedPost(post)
    setPaymentModalOpen(true)
    setSelectedToken(SUPPORTED_TOKENS[0])
  }

  // Handle approval for ERC20 tokens
  const handleApprove = async () => {
    if (!selectedToken || !selectedToken.address || !address || !payTokenContractAddress || !selectedPost) {
      toast.error("Missing information for approval.")
      return
    }
    try {
      const token = SUPPORTED_TOKENS.find(t => t.address === selectedToken.address)
      if (!token) throw new Error("Unsupported token")
      const amount = BigInt(Math.floor(Number(selectedPost.price) * Math.pow(10, token.decimals)))
      await approve(selectedToken.address, amount)
      setNeedsApproval(false)
      setAllowance(amount)
    } catch (err) {
      toast.error("Approval failed. Please try again.")
      setNeedsApproval(true)
    }
  }

  // Handle payment with selected method
  const handlePayment = async (post: Post, tokenAddress: string | null, tokenSymbol: string) => {
    if (!isConnected || !address) {
      toast("Please connect your wallet to purchase.")
      return
    }

    setPayingPostId(post.id)

    try {
      if (!tokenAddress) {
        if (!post.creatorAddress) {
          toast.error("Missing creator address for this post.")
          setPayingPostId(null)
          return
        }
        const value = BigInt(Math.floor(Number(post.price) * 1e18))
        await payETH(post.creatorAddress, post.id, value)
      } else {
        const token = SUPPORTED_TOKENS.find(t => t.address === tokenAddress)
        if (!token) throw new Error('Unsupported token')
        const amount = BigInt(Math.floor(Number(post.price) * Math.pow(10, token.decimals)))
        if (needsApproval) {
          toast.error("Please approve the token before paying.")
          setPayingPostId(null)
          return
        }
        await payToken(post.user.address, post.id, amount, tokenAddress)
      }

      toast.success(`Payment initiated with ${tokenSymbol}!`)
    } catch (err) {
      console.error("Payment failed:", err)
      setPayingPostId(null)
    }
  }

  // --- Like/Unlike API integration ---
  // Like/Unlike API calls using /api/handle-like
  const handleLike = async (postId: string, isCurrentlyLiked: boolean, userId: string) => {
    if (!isConnected || !address) {
      toast("Please connect your wallet to like posts.")
      return
    }
    setLikingPostId(postId)
    try {
      const res = await fetch("/api/handle-like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId,
          action: isCurrentlyLiked ? "unlike" : "like",
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update like")
      }
      // Update the post in state
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                isLiked: !isCurrentlyLiked,
                likeCount: isCurrentlyLiked
                  ? Math.max(0, (p.likeCount || 0) - 1)
                  : (p.likeCount || 0) + 1,
              }
            : p
        )
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to update like")
    } finally {
      setLikingPostId(null)
    }
  }

  // Helper for blurry effect
  const blurryImageClass =
    "w-full h-64 sm:h-72 md:h-80 object-cover transition-all duration-300 filter blur-lg saturate-150 brightness-110 scale-105"

  const HeartIcon = ({ filled = false, className = "" }) => (
    filled ? (
      <svg
        className={className}
        width="30"
        height="30"
        viewBox="0 0 20 20"
        fill="currentColor"
        style={{ color: "#e11d48" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.5 3.5 4 5.5 4c1.04 0 2.09.54 2.7 1.44C8.91 4.54 9.96 4 11 4 13 4 14.5 5.5 14.5 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z" />
      </svg>
    ) : (
      <svg
        className={className}
        width="30"
        height="30"
        viewBox="0 0 20 20"
        fill="none"
        stroke="#e11d48"
        strokeWidth="1.5"
        style={{ color: "#e11d48" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 17.5l-1.45-1.32C4.4 12.36 2 10.28 2 7.5 2 5.5 3.5 4 5.5 4c1.04 0 2.09.54 2.7 1.44C8.91 4.54 9.96 4 11 4 13 4 14.5 5.5 14.5 7.5c0 2.78-2.4 4.86-6.55 8.68L10 17.5z" />
      </svg>
    )
  )

  const isProcessing = isPayETHLoading || isPayTokenLoading || isApproveLoading || !!payingPostId

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      {/* <Header /> */}

      {/* Posts Feed */}
      <main className="max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4 py-8">
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
              onClick={() => fetchPosts(1)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-6">
            {posts.map((post) => {
              // Determine if the user has paid for this post
              const isPaid = post.isPurchased
              return (
                <div
                  key={post.id}
                  className="bg-gray-900/60 border border-purple-900/30 rounded-xl overflow-hidden hover:border-purple-700/50 transition-colors shadow-lg"
                >
                  {/* Post Header */}
                  <div className="p-4 border-b border-purple-900/20 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                      {post.user?.id ? post.user.id.slice(-3) : "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-200 text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                        {post.creatorAddress}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="ml-auto text-purple-400 font-normal text-xs flex items-center gap-1">
                      <span className="font-bold">{post.price}</span>
                      <span>ETH</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="relative">
                    {/* Show real image if purchased, else blurry */}
                    {isPaid ? (
                      <Image
                        src={post.ipfs || "/placeholder.svg"}
                        alt="Post content"
                        width={800}
                        height={300}
                        className="w-full h-64 sm:h-72 md:h-80 object-cover transition-all duration-300"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="relative">
                        <Image
                          src={post.ipfs || "/placeholder.svg"}
                          alt="Post content"
                          width={800}
                          height={300}
                          className={blurryImageClass}
                          style={{
                            objectFit: "cover",
                            filter: "blur(24px) saturate(1.5) brightness(1.1) contrast(1.1)",
                          }}
                        />
                        {/* Optional: a glassy overlay for extra effect */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "linear-gradient(120deg, rgba(80,0,120,0.10) 0%, rgba(0,0,0,0.18) 100%)",
                            backdropFilter: "blur(2px) saturate(1.2)",
                            borderRadius: "inherit",
                          }}
                        />
                      </div>
                    )}

                    {/* Blur overlay for unpurchased content */}
                    {!isPaid && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-2">🔒</div>
                          <p className="text-white font-medium mb-4">{post.description}</p>
                          <button
                            onClick={() => handlePurchaseClick(post)}
                            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                            disabled={isProcessing}
                          >
                            {payingPostId === post.id ? "Processing..." : `Buy for ${post.price} ETH`}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Purchased indicator */}
                    {isPaid && (
                      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow">
                        ✓ Owned
                      </div>
                    )}
                  </div>

                  {/* Post Caption */}
                  <div className="p-4 flex flex-row justify-between items-center gap-4">
                    <p className="text-gray-200 leading-relaxed break-words mb-0 flex-1">50 users already viewed this</p>
                    <div className="flex items-center text-xs text-gray-500 gap-2 flex-shrink-0">
                      <button
                        aria-label={post.isLiked ? "Unlike" : "Like"}
                        className="focus:outline-none flex items-center"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          marginRight: "0.25rem",
                          cursor: (likingPostId === post.id) ? "default" : (post.isLiked ? "pointer" : "pointer"),
                        }}
                        disabled={likingPostId === post.id}
                        onClick={() => handleLike(post.id, post.isLiked, post?.user.id)}
                        type="button"
                      >
                        <HeartIcon
                          filled={!!post.isLiked}
                          className={`transition-all duration-200 ${
                            post.isLiked ? "scale-110" : "opacity-80 hover:scale-110"
                          }`}
                        />
                      </button>
                      <span>
                        {post.likeCount || 0} {post.likeCount === 1 ? "like" : "likes"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load More (button fallback for non-infinite scroll) */}
        {hasMore && !loading && (
          <div className="text-center mt-12" ref={loaderRef}>
            <button
              onClick={() => fetchPosts(page + 1)}
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

      {/* Payment Modal */}
      {selectedPost && paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-900/30 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Choose Payment Method</h3>
              <button
                onClick={() => {
                  if (!isProcessing) {
                    setPaymentModalOpen(false)
                    setSelectedPost(null)
                  }
                }}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 text-sm mb-4">
                Purchase content for <span className="font-semibold">{selectedPost.price} ETH</span>
              </p>
              
              <div className="space-y-3">
                {SUPPORTED_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token)}
                    className={`w-full p-3 rounded-lg border transition-all ${
                      selectedToken.symbol === token.symbol
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                    disabled={isProcessing}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {token.symbol.slice(0, 2)}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">{token.name}</p>
                          <p className="text-gray-400 text-sm">{token.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{selectedPost.price}</p>
                        <p className="text-gray-400 text-sm">{token.symbol}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Approval and Payment Buttons */}
            {selectedToken && selectedToken.address && (
              <div className="mb-4">
                {checkingAllowance || isAllowanceLoading ? (
                  <div className="text-center text-gray-400 text-sm mb-2">Checking allowance...</div>
                ) : needsApproval ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-yellow-400 text-sm text-center mb-2">
                      You need to approve spending before paying with {selectedToken.symbol}.
                    </div>
                    <button
                      onClick={handleApprove}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 px-4 py-3 rounded-lg font-medium transition-all"
                      disabled={isProcessing || isApproveLoading}
                    >
                      {isApproveLoading ? `Approving ${selectedToken.symbol}...` : `Approve ${selectedToken.symbol}`}
                    </button>
                  </div>
                ) : (
                  <div className="text-green-400 text-sm text-center mb-2">
                    {/* Allowance sufficient for payment. */}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!isProcessing) {
                    setPaymentModalOpen(false)
                    setSelectedPost(null)
                  }
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-medium transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayment(selectedPost, selectedToken.address, selectedToken.symbol)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 px-4 py-3 rounded-lg font-medium transition-all"
                disabled={isProcessing}
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay with ${selectedToken.symbol}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}