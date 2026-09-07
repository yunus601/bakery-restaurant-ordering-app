import { v2 as cloudinary } from "cloudinary";

import { requireAdmin } from "@/lib/auth/require-admin";

const uploadFolder = "confirm-bakery/products";
const allowedParameters = new Set(["timestamp", "folder", "source"]);

export async function POST(request: Request) {
  await requireAdmin();

  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) {
    console.error("CLOUDINARY_API_SECRET is not configured.");

    return Response.json(
      { error: "Image uploads are not configured." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("paramsToSign" in body) ||
    !body.paramsToSign ||
    typeof body.paramsToSign !== "object" ||
    Array.isArray(body.paramsToSign)
  ) {
    return Response.json(
      { error: "Upload parameters are required." },
      { status: 400 },
    );
  }

  const params = body.paramsToSign as Record<string, unknown>;
  const containsUnsupportedParameter = Object.keys(params).some(
    (key) => !allowedParameters.has(key),
  );

  if (containsUnsupportedParameter) {
    return Response.json(
      { error: "Unsupported upload parameters." },
      { status: 400 },
    );
  }

  const timestamp = Number(params.timestamp);

  if (
    !Number.isInteger(timestamp) ||
    Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300
  ) {
    return Response.json(
      { error: "The upload request has expired." },
      { status: 400 },
    );
  }

  if (params.folder !== uploadFolder) {
    return Response.json(
      { error: "Invalid upload destination." },
      { status: 400 },
    );
  }

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder: uploadFolder,
  };

  if (typeof params.source === "string") {
    paramsToSign.source = params.source;
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret,
  );

  return Response.json({ signature });
}
