"use client";

import React, { useState } from "react";
import FileUpload from "@/components/file-upload";
import SynapseFileUpload from "@/components/synapse-file-upload";

export default function FileUploadDemo() {
  const [basicUploadResults, setBasicUploadResults] = useState<string[]>([]);
  const [synapseUploadResults, setSynapseUploadResults] = useState<
    Array<{ fileId: string; commp: string }>
  >([]);

  const handleBasicUploadComplete = (fileId: string) => {
    setBasicUploadResults((prev) => [...prev, fileId]);
  };

  const handleBasicUploadError = (error: string) => {
    console.error("Basic upload error:", error);
    alert(`Upload error: ${error}`);
  };

  const handleSynapseUploadComplete = (fileId: string, commp: string) => {
    setSynapseUploadResults((prev) => [...prev, { fileId, commp }]);
  };

  const handleSynapseUploadError = (error: string) => {
    console.error("Synapse upload error:", error);
    alert(`Synapse upload error: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            File Upload Components Demo
          </h1>
          <p className="text-lg text-gray-600">
            Test both the basic file upload and server-side Filecoin integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic File Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic File Upload
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Simple file upload with drag & drop support and progress tracking.
            </p>

            <FileUpload
              onUploadComplete={handleBasicUploadComplete}
              onUploadError={handleBasicUploadError}
              maxFileSize={50 * 1024 * 1024} // 50MB
              acceptedFileTypes={["image/*", "application/pdf", "text/*"]}
              className="mb-6"
            />

            {basicUploadResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Upload Results:
                </h3>
                <div className="space-y-2">
                  {basicUploadResults.map((fileId, index) => (
                    <div
                      key={index}
                      className="text-xs bg-gray-100 p-2 rounded border"
                    >
                      File ID: {fileId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Synapse File Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Server-Side Filecoin Upload
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Advanced file upload using server-side processing with
              @filoz/synapse-sdk for decentralized storage on Filecoin.
            </p>

            <SynapseFileUpload
              onUploadComplete={handleSynapseUploadComplete}
              onUploadError={handleSynapseUploadError}
              maxFileSize={100 * 1024 * 1024} // 100MB
              acceptedFileTypes={["*/*"]}
              className="mb-6"
            />

            {synapseUploadResults.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Filecoin Upload Results:
                </h3>
                <div className="space-y-2">
                  {synapseUploadResults.map((result, index) => (
                    <div
                      key={index}
                      className="text-xs bg-green-50 p-2 rounded border border-green-200"
                    >
                      <div>File ID: {result.fileId}</div>
                      <div className="text-green-700">
                        CommP: {result.commp}
                      </div>
                      <div className="text-blue-600 text-xs">
                        Stored on Filecoin network via server
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Server-Side Configuration Required
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>For Server-Side Filecoin Integration:</strong> Set these
              environment variables on your server:
            </p>
            <div className="bg-blue-100 p-3 rounded font-mono text-xs">
              SYNAPSE_PRIVATE_KEY=your_private_key_here
              <br />
              SYNAPSE_RPC_URL=your_rpc_url_here (optional, defaults to
              calibration testnet)
            </div>
            <p>
              <strong>Install dependencies:</strong> Run{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">
                bun add @filoz/synapse-sdk next-safe-action zod
              </code>
            </p>
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> The server uses Filecoin&apos;s calibration
              testnet by default for testing. For production, use mainnet RPC
              URLs with proper Pandora service configuration.
            </p>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Examples
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Basic Usage:
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`<FileUpload
  onUploadComplete={(fileId) => console.log(fileId)}
  onUploadError={(error) => console.error(error)}
  maxFileSize={50 * 1024 * 1024}
  acceptedFileTypes={["image/*", "application/pdf"]}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Server-Side Filecoin Upload:
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`<SynapseFileUpload
  onUploadComplete={(fileId, commp) => {
    console.log("File uploaded to Filecoin:", fileId, commp);
    // commp is the Filecoin piece commitment
  }}
  onUploadError={(error) => console.error(error)}
  maxFileSize={100 * 1024 * 1024}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Filecoin Information */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            About Server-Side Filecoin Storage
          </h3>
          <div className="space-y-3 text-sm text-green-800">
            <p>
              <strong>Server-Side Processing:</strong> Files are first uploaded
              to your server, then processed and stored on the Filecoin network
              using the Synapse SDK.
            </p>
            <p>
              <strong>CommP (Piece Commitment):</strong> Each uploaded file gets
              a unique CommP (Piece Commitment) that serves as a cryptographic
              proof of the file&apos;s content and can be used to retrieve the
              file from any Filecoin storage provider.
            </p>
            <p>
              <strong>Security Benefits:</strong> Server-side processing ensures
              secure handling of private keys, better error handling, and
              centralized control over the upload process.
            </p>
            <p>
              <strong>Testnet:</strong> The server uses Filecoin&apos;s
              calibration testnet for testing purposes. For production use,
              switch to mainnet RPC URLs with proper Pandora service
              configuration.
            </p>
          </div>
        </div>

        {/* Server-Side Benefits */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">
            Server-Side Upload Benefits
          </h3>
          <div className="space-y-3 text-sm text-purple-800">
            <p>
              <strong>Security:</strong> Private keys are never exposed to the
              client, ensuring secure Filecoin operations.
            </p>
            <p>
              <strong>Reliability:</strong> Server-side processing provides
              better error handling and retry mechanisms for failed uploads.
            </p>
            <p>
              <strong>Control:</strong> Centralized control over upload limits,
              file validation, and storage policies.
            </p>
            <p>
              <strong>Scalability:</strong> Server can handle multiple
              concurrent uploads and implement rate limiting as needed.
            </p>
            <p>
              <strong>Monitoring:</strong> Better logging and monitoring of
              upload activities and Filecoin network interactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
