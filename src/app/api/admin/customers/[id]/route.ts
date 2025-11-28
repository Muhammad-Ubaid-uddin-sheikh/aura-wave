import { client } from "@/sanity/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const patchData = await request.json();

    try {
        await client.patch(params.id).set(patchData).commit();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: `Failed to update customer, ${error}` }, { status: 500 });
    }
}