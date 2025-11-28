import { client } from "@/sanity/lib/client";
import { uploadImageToSanity } from "@/sanity/lib/upload";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment")?.toString() || "";
        const reviewerName = formData.get("reviewerName")?.toString() || "";
        const reviewerEmail = formData.get("reviewerEmail")?.toString() || "";
        const productId = formData.get("productId")?.toString();

        const approved = false;
        const date = new Date().toISOString().split("T")[0];

        if (!productId || !comment || !reviewerName || !reviewerEmail || isNaN(rating)) {
            return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
        }

        const imageFiles = formData.getAll("reviewImages") as File[];

        const uploadedImageRefs = [];
        const uploadedImageUrls = [];

        // Upload each image and collect asset references
        for (let index = 0; index < imageFiles.length; index++) {
            const file = imageFiles[index];
            const buffer = Buffer.from(await file.arrayBuffer());
            const asset = await uploadImageToSanity(buffer, file.name, file.type);

            uploadedImageRefs.push({
                _type: "image",
                _key: `${Date.now()}-${index}`,
                asset: {
                    _type: "reference",
                    _ref: asset._id,
                },
            });

            // Collect the URL here
            uploadedImageUrls.push(asset.url);
        }

        const reviewDoc = {
            _type: "review",
            reviewerName,
            reviewerEmail,
            rating,
            comment,
            approved,
            date,
            product: {
                _type: "reference",
                _ref: productId,
            },
            reviewImages: uploadedImageRefs.length ? uploadedImageRefs : undefined,
        };

        const createdReview = await client.create(reviewDoc);

        return NextResponse.json({ 
            message: "Review submitted successfully",
            imageUrls: uploadedImageUrls,
            review: createdReview
         }, { status: 200 });
    } catch (error) {
        console.error("Review Submit Error:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}