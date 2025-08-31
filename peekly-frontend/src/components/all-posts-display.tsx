"use client";

import { useState, useEffect } from "react";
import { getAllPosts, PostWithUser } from "../app/actions/posts";
import {
  handleViewContentPurchase,
  hasUserViewedPost,
  formatAmount,
} from "../lib/view-content-utils";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface AllPostsDisplayProps {
  currentUserId?: string; // Optional: to check if user has already viewed posts
}

export default function AllPostsDisplay({
  currentUserId,
}: AllPostsDisplayProps) {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "likeCount">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [purchasingPostId, setPurchasingPostId] = useState<string | null>(null);
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());

  const limit = 12; // Posts per page

  // Load posts
  const loadPosts = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllPosts({
        page,
        limit,
        search: searchTerm,
        sortBy,
        sortOrder,
      });

      if (response.success && response.posts) {
        setPosts(response.posts);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
        setCurrentPage(page);
      } else {
        setError(response.error || "Failed to load posts");
      }
    } catch (err) {
      setError("Failed to load posts");
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check which posts the current user has already viewed
  const checkViewedPosts = async () => {
    if (!currentUserId || posts.length === 0) return;

    const viewedSet = new Set<string>();

    for (const post of posts) {
      try {
        const hasViewed = await hasUserViewedPost(currentUserId, post.id);
        if (hasViewed) {
          viewedSet.add(post.id);
        }
      } catch (error) {
        console.error(`Error checking view status for post ${post.id}:`, error);
      }
    }

    setViewedPosts(viewedSet);
  };

  // Handle post purchase
  const handlePurchase = async (post: PostWithUser) => {
    if (!currentUserId) {
      setError("Please sign in to purchase content");
      return;
    }

    if (viewedPosts.has(post.id)) {
      setError("You have already purchased this content");
      return;
    }

    setPurchasingPostId(post.id);

    try {
      const result = await handleViewContentPurchase({
        userId: currentUserId,
        postId: post.id,
        amount: post.price,
        isBasePay: true,
      });

      if (result.success) {
        // Add to viewed posts
        setViewedPosts((prev) => new Set(prev).add(post.id));
        setError(null);
        // You could show a success message here
      } else {
        setError(result.error || "Failed to purchase content");
      }
    } catch (err) {
      setError("Failed to process purchase");
      console.error("Purchase error:", err);
    } finally {
      setPurchasingPostId(null);
    }
  };

  // Load posts on component mount and when dependencies change
  useEffect(() => {
    loadPosts(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Check viewed posts when posts or currentUserId changes
  useEffect(() => {
    checkViewedPosts();
  }, [posts, currentUserId]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        loadPosts(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPosts(page);
    }
  };

  const handleSort = (field: "createdAt" | "price" | "likeCount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Content
        </h1>
        <p className="text-gray-600">
          Browse and purchase premium content from creators around the world
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSort("createdAt")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === "createdAt"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => handleSort("price")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === "price"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Price
            </button>
            <button
              onClick={() => handleSort("likeCount")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === "likeCount"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No posts found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {posts.map((post) => {
              const hasViewed = viewedPosts.has(post.id);
              const isPurchasing = purchasingPostId === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Eye className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Content Preview</p>
                    </div>
                  </div>

                  {/* Post Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {post.description || "Untitled Post"}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="h-4 w-4" />
                        {post.likeCount}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      By{" "}
                      {post.user.username ||
                        post.user.address?.slice(0, 8) + "..." ||
                        "Anonymous"}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {formatAmount(post.price)}
                      </span>

                      {hasViewed ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <EyeOff className="h-4 w-4" />
                          <span className="text-sm">Viewed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(post)}
                          disabled={isPurchasing || !currentUserId}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isPurchasing
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : currentUserId
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isPurchasing ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : currentUserId ? (
                            "Purchase"
                          ) : (
                            "Sign In to Buy"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {posts.length} of {totalCount} posts
          </div>
        </>
      )}
    </div>
  );
}
