import crypto from "crypto";

import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.QZ_PRIVATE_KEY!;
if (!privateKey) throw new Error("QZ_PRIVATE_KEY environment variable is not set");

export async function GET({ url }) {
  const request = url.searchParams.get("request");
  if (!request) return new Response("Missing request", { status: 400 });

  const signer = crypto.createSign("RSA-SHA512");
  signer.update(request);

  const signature = signer.sign(privateKey, "base64");

  return new Response(signature, {
    headers: { "Content-Type": "text/plain" }
  });
}