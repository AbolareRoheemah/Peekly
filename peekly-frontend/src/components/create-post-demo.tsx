"use client";

import React, { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  DollarSign,
  FileText,
} from "lucide-react";

interface CreatePostDemoProps {
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "completed" | "error";
  progress?: number;
  error?: string;
  base64Data?: string;
}

export default function CreatePostDemo({
  className = "",
}: CreatePostDemoProps) {
  const { ready, authenticated, user } = usePrivy();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateFile = useCallback((file: File): string | null => {
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(
        maxFileSize / (1024 * 1024)
      )}MB limit`;
    }
    return null;
  }, []);

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate files first
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setSubmitStatus({
          type: "error",
          message: errors.join("\n"),
        });
        return;
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);

      // Add files to state for progress tracking
      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading" as const,
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      try {
        // Process each file
        for (let i = 0; i < newFiles.length; i++) {
          const file = validFiles[i];
          const fileId = newFiles[i].id;

          // Convert file to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(",")[1];
              resolve(base64);
            };
          });
          reader.readAsDataURL(file);
          const base64Data = await base64Promise;

          // Store the base64 data with the file for later use
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, progress: 50, base64Data } : f
            )
          );

          // Simulate upload delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Update to completed
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "completed", progress: 100 } : f
            )
          );
        }
      } catch (error) {
        console.error("File upload failed:", error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.status === "uploading"
              ? { ...f, status: "error", error: "Upload failed" }
              : f
          )
        );
        setSubmitStatus({
          type: "error",
          message: "File upload failed",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload]
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authenticated || !user) {
      setSubmitStatus({
        type: "error",
        message: "Please sign in to create a post",
      });
      return;
    }

    // Validate that user exists in database
    try {
      const userCheckResponse = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!userCheckResponse.ok) {
        setSubmitStatus({
          type: "error",
          message:
            "User not found in database. Please sign out and sign in again.",
        });
        return;
      }

      const userCheckResult = await userCheckResponse.json();
      if (!userCheckResult.exists) {
        setSubmitStatus({
          type: "error",
          message:
            "User not found in database. Please sign out and sign in again.",
        });
        return;
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to validate user. Please try again.",
      });
      return;
    }

    if (!description.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a description",
      });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid price",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      setSubmitStatus({
        type: "error",
        message: "Please upload at least one file",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Get the first completed file for demo purposes
      const completedFiles = uploadedFiles.filter(
        (f) => f.status === "completed"
      );

      if (completedFiles.length === 0) {
        throw new Error("Please wait for files to finish uploading");
      }

      const fileToUpload = completedFiles[0];

      if (!fileToUpload.base64Data) {
        throw new Error("File data not available");
      }

      const response = await fetch("/api/upload-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileData: fileToUpload.base64Data,
          description: description.trim(),
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
          message: "Post created successfully! File uploaded to Filecoin.",
        });

        // Reset form
        setDescription("");
        setPrice("");
        setUploadedFiles([]);
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
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!ready) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p className="text-gray-600 mb-4">Please sign in to create a post</p>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Post
          </h2>
          <p className="text-gray-600">
            Upload a file, add description and set a price for your content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              User Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">User ID:</span>
                <p className="text-blue-600 font-mono text-xs break-all">
                  {user?.id}
                </p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">
                  Wallet Address:
                </span>
                <p className="text-blue-600 font-mono text-xs break-all">
                  {user?.wallet?.address || "Not connected"}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                disabled={isUploading}
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Choose File
              </label>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Files
              </h3>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === "uploading" && (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-xs text-blue-600">
                            {file.progress}%
                          </span>
                        </div>
                      )}
                      {file.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {file.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <FileText className="h-4 w-4 inline mr-1" />
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your content..."
              required
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              <DollarSign className="h-4 w-4 inline mr-1" />
              Price (USDFC)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          {/* Status Message */}
          {submitStatus.type && (
            <div
              className={`p-4 rounded-lg ${
                submitStatus.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center">
                {submitStatus.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <p
                  className={`text-sm ${
                    submitStatus.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading || uploadedFiles.length === 0}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Post...
              </>
            ) : (
              "Create Post with Filecoin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
