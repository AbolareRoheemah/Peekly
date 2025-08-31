"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { uploadFileToFilecoin } from "@/app/actions/file-upload";

interface SynapseFileUploadProps {
  onUploadComplete?: (fileId: string, commp: string) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
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
  commp?: string; // Filecoin piece commitment
}

export default function SynapseFileUpload({
  onUploadComplete,
  onUploadError,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  acceptedFileTypes = ["*/*"],
  className = "",
}: SynapseFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxFileSize) {
        return `File size exceeds ${Math.round(
          maxFileSize / (1024 * 1024)
        )}MB limit`;
      }

      if (acceptedFileTypes[0] !== "*/*") {
        const isValidType = acceptedFileTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", ""));
          }
          return file.type === type;
        });

        if (!isValidType) {
          return `File type ${file.type} is not supported`;
        }
      }

      return null;
    },
    [maxFileSize, acceptedFileTypes]
  );

  const uploadToServer = useCallback(
    async (
      file: File,
      fileId: string
    ): Promise<{ fileId: string; commp: string }> => {
      try {
        // Convert file to base64 for server transmission
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // Call server action
        const result = await uploadFileToFilecoin({
          fileData: base64Data,
          description: "Test description",
          price: 10,
          userId: "123",
          creatorAddress: "0x123",
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Ensure we have the required data
        if (!result.fileId || !result.commp) {
          throw new Error("Server response missing required data");
        }

        return {
          fileId: result.fileId,
          commp: result.commp,
        };
      } catch (error) {
        console.error("Server upload failed:", error);
        throw new Error(
          `Upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    []
  );

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
        onUploadError?.(errors.join("\n"));
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
        // Upload files to server
        for (const file of validFiles) {
          const fileIndex = newFiles.findIndex((f) => f.name === file.name);
          if (fileIndex === -1) continue;

          const fileId = Math.random().toString(36).substr(2, 9);

          // Update progress to show upload starting
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFiles[fileIndex].id ? { ...f, progress: 10 } : f
            )
          );

          try {
            // Upload to server
            const result = await uploadToServer(file, fileId);

            // Update progress to show completion
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === newFiles[fileIndex].id
                  ? {
                      ...f,
                      status: "completed" as const,
                      progress: 100,
                      commp: result.commp,
                    }
                  : f
              )
            );

            // Call success callback with fileId and commp
            onUploadComplete?.(result.fileId, result.commp);
          } catch (uploadError) {
            const errorMessage =
              uploadError instanceof Error
                ? uploadError.message
                : "Upload failed";

            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === newFiles[fileIndex].id
                  ? { ...f, status: "error" as const, error: errorMessage }
                  : f
              )
            );

            onUploadError?.(`${file.name}: ${errorMessage}`);
          }
        }
      } catch (error) {
        console.error("Upload process failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        onUploadError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, uploadToServer, onUploadComplete, onUploadError]
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "uploading":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <File className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isUploading
              ? "Uploading to Filecoin via server..."
              : "Drop files here or click to upload"}
          </p>
          <p className="text-sm text-gray-500">
            {acceptedFileTypes[0] === "*/*"
              ? "All file types supported"
              : `Supported formats: ${acceptedFileTypes.join(", ")}`}
          </p>
          <p className="text-xs text-gray-400">
            Max file size: {Math.round(maxFileSize / (1024 * 1024))}MB
          </p>
          <p className="text-xs text-blue-600 font-medium">
            Files are uploaded to server and stored on Filecoin network
          </p>
          <p className="text-xs text-green-600 font-medium">
            Server-side processing ensures secure and reliable uploads
          </p>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>

          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(
                file.status
              )}`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(file.status)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>

                  {file.status === "uploading" &&
                    file.progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {file.progress}% complete
                        </p>
                      </div>
                    )}

                  {file.status === "completed" && file.commp && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-green-600">
                        CommP: {file.commp}
                      </p>
                      <p className="text-xs text-blue-600">
                        Stored on Filecoin network via server
                      </p>
                    </div>
                  )}

                  {file.status === "error" && file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeFile(file.id)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={file.status === "uploading"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
