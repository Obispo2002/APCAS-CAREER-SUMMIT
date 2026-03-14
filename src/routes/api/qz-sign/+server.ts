import fs from "fs";
import crypto from "crypto";
import path from "path";

const privateKey = fs.readFileSync(
  path.resolve("src/lib/qz/private-key.pem"),
  "utf8"
);
export async function GET({ url }) {

  const request = url.searchParams.get("request");

  if (!request) {
    return new Response("Missing request", { status: 400 });
  }

  const signer = crypto.createSign("RSA-SHA512");
  signer.update(request);

  const signature = signer.sign(privateKey, "base64");

  return new Response(signature, {
    headers: { "Content-Type": "text/plain" }
  });
}