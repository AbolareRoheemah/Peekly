"use client";

import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  FileText,
  Eye,
  Heart,
  DollarSign,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  X,
  Download,
  Play,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { getUserContent } from "@/app/actions/file-upload";
import { Synapse } from "@filoz/synapse-sdk";

interface UserPost {
  id: string;
  ipfs: string;
  description: string;
  price: number;
  creatorAddress: string;
  createdAt: string;
  LikeCount: number;
  user: {
    id: string;
    username: string;
    address: string;
  };
  _count: {
    Like: number;
    View: number;
  };
}

interface UserContentData {
  posts: UserPost[];
  stats: {
    totalPosts: number;
    totalEarnings: number;
    totalLikes: number;
    totalViews: number;
  };
  user: {
    id: string;
    username: string;
    address: string;
  };
}

interface UserPostsDemoProps {
  className?: string;
}

interface FilePreviewData {
  dataUrl: string;
  fileType: string;
  fileName: string;
  isLoading: boolean;
  error: string | null;
}

export default function UserPostsDemo({ className = "" }: UserPostsDemoProps) {
  const { ready, authenticated, user } = usePrivy();
  const [userContent, setUserContent] = useState<UserContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    post: UserPost | null;
  }>({ isOpen: false, post: null });
  const [filePreview, setFilePreview] = useState<FilePreviewData | null>(null);

  const fetchUserContent = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserContent(user.id);

      if (result.success) {
        setUserContent(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch user content");
      console.error("Error fetching user content:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const previewFile = async (post: UserPost) => {
    setPreviewModal({ isOpen: true, post });
    setFilePreview({
      dataUrl: "",
      fileType: "",
      fileName: "",
      isLoading: true,
      error: null,
    });

    try {
      const synapse = await Synapse.create({
        withCDN: true,
        privateKey: process.env.NEXT_PUBLIC_SYNAPSE_PRIVATE_KEY,
        rpcURL: "https://api.calibration.node.glif.io/rpc/v1",
      });

      const storage = await synapse.createStorage();

      // Download file from Filecoin
      const uint8ArrayBytes = await storage.download(post.ipfs);

      // Determine file type based on content or use a default
      const fileType = determineFileType(uint8ArrayBytes, post.description);
      const fileName = post.description || `file_${post.id}`;

      // Convert to base64 and create data URL
      const base64String = Buffer.from(uint8ArrayBytes).toString("base64");
      const dataUrl = `data:${fileType};base64,${base64String}`;

      setFilePreview({
        dataUrl,
        fileType,
        fileName,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error previewing file:", err);
      setFilePreview({
        dataUrl: "",
        fileType: "",
        fileName: "",
        isLoading: false,
        error: "Failed to load file preview",
      });
    }
  };

  const determineFileType = (
    bytes: Uint8Array,
    description: string
  ): string => {
    // Check for common file signatures
    const header = bytes.slice(0, 4);

    // JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return "image/jpeg";
    }
    // PNG
    if (
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47
    ) {
      return "image/png";
    }
    // GIF
    if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
      return "image/gif";
    }
    // PDF
    if (
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46
    ) {
      return "application/pdf";
    }
    // MP4
    if (
      header[0] === 0x00 &&
      header[1] === 0x00 &&
      header[2] === 0x00 &&
      header[3] === 0x18
    ) {
      return "video/mp4";
    }
    // MP3
    if (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) {
      return "audio/mpeg";
    }

    // Fallback based on description or default to binary
    if (description?.toLowerCase().includes("image")) return "image/jpeg";
    if (description?.toLowerCase().includes("video")) return "video/mp4";
    if (description?.toLowerCase().includes("audio")) return "audio/mpeg";
    if (description?.toLowerCase().includes("pdf")) return "application/pdf";

    return "application/octet-stream";
  };

  const renderFilePreview = () => {
    if (!filePreview) return null;

    if (filePreview.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-gray-600">Loading file preview...</p>
        </div>
      );
    }

    if (filePreview.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Preview Error
          </h3>
          <p className="text-gray-600 mb-4">{filePreview.error}</p>
          <button
            onClick={() => previewFile(previewModal.post!)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    const { dataUrl, fileType, fileName } = filePreview;

    // Image preview
    if (fileType.startsWith("image/")) {
      return (
        <div className="text-center">
          <img
            src={dataUrl}
            alt={fileName}
            className="max-w-full max-h-[500px] rounded-lg shadow-lg mx-auto"
          />
          <p className="text-sm text-gray-600 mt-2">{fileName}</p>
        </div>
      );
    }

    // Video preview
    if (fileType.startsWith("video/")) {
      return (
        <div className="text-center">
          <video
            controls
            className="max-w-full max-h-[500px] rounded-lg shadow-lg mx-auto"
          >
            <source src={dataUrl} type={fileType} />
            Your browser does not support video playback.
          </video>
          <p className="text-sm text-gray-600 mt-2">{fileName}</p>
        </div>
      );
    }

    // Audio preview
    if (fileType.startsWith("audio/")) {
      return (
        <div className="text-center">
          <audio controls className="w-full max-w-md mx-auto">
            <source src={dataUrl} type={fileType} />
            Your browser does not support audio playback.
          </audio>
          <p className="text-sm text-gray-600 mt-2">{fileName}</p>
        </div>
      );
    }

    // PDF preview (fallback to download)
    if (fileType === "application/pdf") {
      return (
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              PDF Document
            </h3>
            <p className="text-gray-600 mb-4">{fileName}</p>
            <a
              href={dataUrl}
              download={fileName}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </div>
        </div>
      );
    }

    // Generic file preview
    return (
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            File Preview
          </h3>
          <p className="text-gray-600 mb-4">{fileName}</p>
          <p className="text-sm text-gray-500 mb-4">File type: {fileType}</p>
          <a
            href={dataUrl}
            download={fileName}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </a>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (ready && authenticated && user?.id) {
      fetchUserContent();
    }
  }, [ready, authenticated, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatEarnings = (earnings: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
    }).format(earnings);
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Authentication Required
        </h2>
        <p className="text-gray-600 max-w-md">
          Please sign in to view your uploaded content and posts.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Loading your content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Error Loading Content
        </h2>
        <p className="text-gray-600 max-w-md mb-4">{error}</p>
        <button
          onClick={fetchUserContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!userContent || userContent.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          No Content Yet
        </h2>
        <p className="text-gray-600 max-w-md mb-4">
          You haven&apos;t uploaded any content yet. Start by creating your
          first post!
        </p>
        <button
          onClick={fetchUserContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`max-w-6xl mx-auto p-6 ${className}`}>
        {/* Header with Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userContent.user.username || "User"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here&apos;s an overview of your content performance
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>
                {userContent.user.address?.slice(0, 6)}...
                {userContent.user.address?.slice(-4)}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Posts
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {userContent.stats.totalPosts}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatEarnings(userContent.stats.totalEarnings)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Total Likes
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {userContent.stats.totalLikes}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {userContent.stats.totalViews}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Your Posts</h2>
            <button
              onClick={fetchUserContent}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userContent.posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {post.description || "Untitled Post"}
                    </h3>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(post.price)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(post.createdAt)}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {post.description || "No description provided"}
                    </p>
                  </div>

                  {/* IPFS Link */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">IPFS:</span>
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {post.ipfs.slice(0, 8)}...{post.ipfs.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span>{post._count.Like}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{post._count.View}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">
                        {post.LikeCount > 0 ? "Earning" : "Free"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => previewFile(post)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  File Preview
                </h2>
                <p className="text-sm text-gray-600">
                  {previewModal.post?.description || "Untitled Post"}
                </p>
              </div>
              <button
                onClick={() => {
                  setPreviewModal({ isOpen: false, post: null });
                  setFilePreview(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
