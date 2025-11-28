import { client } from "@/sanity/lib/client";

export async function deleteUnusedImageAsset(assetRef: string) {
  if (!assetRef) return;

  try {
    const isUsedElsewhere = await client.fetch(
      `*[_type != "sanity.imageAsset" && references($assetRef)][0]`,
      { assetRef }
    );

    if (!isUsedElsewhere) {
      await client.delete(assetRef);
      console.log("Image deleted successfully.");
    } else {
      console.log("Image still referenced by another document. Skipping asset delete.");
    }
  } catch (error) {
    console.error("Error deleting asset:", error);
  }
}