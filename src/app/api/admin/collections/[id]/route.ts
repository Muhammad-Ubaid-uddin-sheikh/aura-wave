import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { deleteUnusedImageAsset } from "@/sanity/lib/deleteUnusedImageAsset";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    // Patch the collection document in Sanity
    const updated = await client
      .patch(id)
      .set(body)
      .commit();

    return NextResponse.json({ success: true, collection: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Fetch the document to get the image reference
    const doc = await client.getDocument(params.id);

    // Check if doc exists
    if (!doc) {
      return NextResponse.json({ success: false, error: "Collection not found" }, { status: 404 });
    }

    // Extract the image asset ID
    const assetRef = doc.image?.asset?._ref;

    // Delete the collection document
    const deleted = await client.delete(params.id);

    // Delete the image if it exists and is not used elsewhere
    if (assetRef) {
      await deleteUnusedImageAsset(assetRef);
    }

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("DELETE collection error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}