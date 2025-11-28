import { NextRequest, NextResponse } from "next/server";
import { uploadImageToSanity } from "@/sanity/lib/upload";
import { deleteUnusedImageAsset } from "@/sanity/lib/deleteUnusedImageAsset";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const oldAssetId = formData.get("oldAssetId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload new image to Sanity
  const asset = await uploadImageToSanity(buffer, file.name, file.type);

  // Delete old image if provided
  if (oldAssetId) {
      await deleteUnusedImageAsset(oldAssetId);
  }

  return NextResponse.json({ assetId: asset._id, url: asset.url });
}