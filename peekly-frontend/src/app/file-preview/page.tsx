import { Synapse } from "@filoz/synapse-sdk";
import Image from "next/image";

export default async function FilePreview() {
  const synapse = await Synapse.create({
    withCDN: true,
    privateKey: process.env.SYNAPSE_PRIVATE_KEY,
    rpcURL: "https://api.calibration.node.glif.io/rpc/v1",
  });

  // 2) Get proofset
  // const { providerId } = await getProofset(signer, network, address);

  const storage = await synapse.createStorage();

  // 4) Download file
  const uint8ArrayBytes = await storage.download(
    "baga6ea4seaqiflb6hgpdjarbinrbnoiqoat2q67lcqvfrxhvzfvycjmvjbssefa"
  );

  // Convert Uint8Array to Base64 string and create a data URL
  const base64String = Buffer.from(uint8ArrayBytes).toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64String}`;

  return (
    <div>
      <h1>File Preview</h1>
      <Image src={dataUrl} alt="File Preview" width={500} height={500} />
    </div>
  );
}
