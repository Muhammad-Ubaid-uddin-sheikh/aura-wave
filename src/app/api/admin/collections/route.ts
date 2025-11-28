import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // validate required fields
    if (!body.title || !body.slug || !body.image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newCollection = {
      _type: "collection",
      ...body,
    };

    const created = await client.create(newCollection);

    return NextResponse.json({ success: true, collection: created });
  } catch (error) {
    console.error("error creating collection:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}