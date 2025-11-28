import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1) Verify the secret header
  const secret = req.headers.get("x-sanity-secret");
  if (!process.env.SANITY_WEBHOOK_SECRET || secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  // 2) Parse payload (optional, useful if you want to branch by _type)
  let body: any = null;
  try { body = await req.json(); } catch {}

  // 3) Revalidate – use either tags +/or paths
  // If your policies query is tagged, this instantly busts that cache:
  revalidateTag("policies");

  // And revalidate the specific routes that read those policies:
  revalidatePath("/privacy-policy");
  revalidatePath("/shipping-policy");
  revalidatePath("/terms-and-conditions");
  revalidatePath("/complaints-and-feedback");

  return NextResponse.json({ revalidated: true, type: body?._type ?? null, now: Date.now() });
}