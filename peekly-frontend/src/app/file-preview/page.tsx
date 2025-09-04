"use client";

import { useEffect, useState } from "react";
import { Synapse } from "@filoz/synapse-sdk";
import Image from "next/image";

export default function FilePreview() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFile() {
      setLoading(true);
      setError(null);
      try {
        const synapse = await Synapse.create({
          withCDN: true,
          privateKey: process.env.NEXT_PUBLIC_SYNAPSE_PRIVATE_KEY,
          rpcURL: "https://api.calibration.node.glif.io/rpc/v1",
        });

        let storage;
        try {
          storage = await synapse.createStorage();
        } catch (err: any) {
          setError(
            "Failed to create storage service. Please try again later or check your storage provider configuration."
          );
          setLoading(false);
          return;
        }

        let uint8ArrayBytes;
        try {
          uint8ArrayBytes = await storage.download(
            "baga6ea4seaqiflb6hgpdjarbinrbnoiqoat2q67lcqvfrxhvzfvycjmvjbssefa"
          );
        } catch (err: any) {
          setError(
            "Failed to download file. Please check if the file exists and your network connection."
          );
          setLoading(false);
          return;
        }

        // Convert Uint8Array to Base64 string and create a data URL
        const base64String = Buffer.from(uint8ArrayBytes).toString("base64");
        setDataUrl(`data:image/jpeg;base64,${base64String}`);
      } catch (err: any) {
        setError(
          "An unexpected error occurred. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFile();
  }, []);

  return (
    <div>
      <h1>File Preview</h1>
      {loading && <p>Loading...</p>}
      {error && (
        <div className="text-red-500">
          <p>Error: {error}</p>
        </div>
      )}
      {dataUrl && !error && (
        <Image src={dataUrl} alt="File Preview" width={500} height={500} />
      )}
    </div>
  );
}
