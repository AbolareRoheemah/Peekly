"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { uploadFileToPinata, getUploadedFile } from "@/utils/pinata";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [price, setPrice] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<"idle" | "uploading" | "creatingPost">("idle");
  const { ready, authenticated, user } = usePrivy();
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const router = useRouter()

  // Generate preview when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setFilePreview(null);
      return;
    }
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (selectedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (selectedFile.type.startsWith("audio/")) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreview(null);
    }
  }, [selectedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated || !user) {
      setSubmitStatus({
        type: "error",
        message: "Please sign in to create a post",
      });
      return;
    }
    if (!selectedFile || !caption || !price) {
      setSubmitStatus({ type: "error", message: "All fields are required." });
      return;
    }

    setIsCreating(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      setCurrentStep("uploading");
      // 1. Upload file to Pinata
      const cid = await uploadFileToPinata(selectedFile);
      if (!cid) {
        throw new Error("Failed to upload file to IPFS/Pinata");
      }

      const url = await getUploadedFile(cid);
      if (!url) {
        throw new Error("Failed to get file URL from Pinata");
      }

      setCurrentStep("creatingPost");
      const response = await fetch("/api/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ipfs: url,
          description: caption,
          price: parseFloat(price),
          userId: user.id,
          creatorAddress: user.wallet?.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Post created successfully!",
        });
        setSelectedFile(null);
        setFilePreview(null);
        setCaption("");
        setPrice("");
        router.push("/posts")
      } else {
        throw new Error(result.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create post",
      });
    } finally {
      setIsCreating(false);
      setCurrentStep("idle");
    }
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "Image";
    if (file.type.startsWith("video/")) return "Video";
    if (file.type.startsWith("audio/")) return "Audio";
    return "Document";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Loader message for each step
  const getLoaderMessage = () => {
    if (currentStep === "uploading") {
      return "Uploading file to IPFS...";
    }
    if (currentStep === "creatingPost") {
      return "Creating your post...";
    }
    return "Creating Post...";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      {!ready ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="ml-2">Loading authentication...</span>
        </div>
      ) : !authenticated ? (
        <div className="text-center p-8">
          <p className="text-red-500">Please sign in to create a post.</p>
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-4 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/posts"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Back</span>
                </Link>
                <h1 className="text-lg md:text-xl font-bold">Create Post</h1>
                <div className="w-12 md:w-16"></div>{" "}
                {/* Spacer for centering */}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Upload Content
                </label>

                {!selectedFile ? (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors ${
                      dragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-300 mb-2 text-sm md:text-base">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      Supports images, videos, audio, and documents
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-600 rounded-lg p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 w-full">
                        {/* Preview */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {selectedFile.type.startsWith("image/") && filePreview && (
                            <img
                              src={filePreview}
                              alt={selectedFile.name}
                              className="object-cover w-full h-full"
                            />
                          )}
                          {selectedFile.type.startsWith("video/") && filePreview && (
                            <video
                              src={filePreview}
                              controls
                              className="object-cover w-full h-full"
                            />
                          )}
                          {selectedFile.type.startsWith("audio/") && filePreview && (
                            <audio
                              src={filePreview}
                              controls
                              className="w-full"
                            />
                          )}
                          {!selectedFile.type.startsWith("image/") &&
                            !selectedFile.type.startsWith("video/") &&
                            !selectedFile.type.startsWith("audio/") && (
                              <span className="text-xs md:text-sm font-medium">
                                {getFileType(selectedFile).charAt(0)}
                              </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1 ml-3">
                          <p className="font-medium text-white text-sm md:text-base truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs md:text-sm text-gray-400">
                            {getFileType(selectedFile)} •{" "}
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label
                  htmlFor="caption"
                  className="block text-sm font-medium text-gray-300"
                >
                  Caption
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for your post..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm md:text-base"
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-300"
                >
                  Price (ETH)
                </label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.001"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-xs md:text-sm">
                    ETH
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Note: 5% commission will be deducted from sales
                </p>
              </div>

              {/* Status Message */}
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === "success"
                      ? "bg-green-500/20 text-green-200"
                      : "bg-red-500/20 text-red-200"
                  }`}
                >
                  <p>{submitStatus.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile || !caption || !price || isCreating}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 md:py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {getLoaderMessage()}
                  </div>
                ) : (
                  "Create Post"
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
