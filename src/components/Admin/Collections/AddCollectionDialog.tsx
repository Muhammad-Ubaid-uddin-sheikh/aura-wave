"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { slugifyInput } from "@/lib/helpers/slugifyInput";
import { OnlyCollections } from "@/types";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX } from "lucide-react";

interface AddCollectionDialogProps {
    open: boolean;
    onClose: () => void;
    existingSlugs: string[];
    onCreated?: (newCollection: OnlyCollections) => void;
}

const getSchema = (existingSlugs: string[]) => {
    return z.object({
        title: z.string().min(1, "Title is required"),
        slug: z.object({
            _type: z.literal("slug"),
            current: z.string()
                .min(1, "Slug is required")
                .refine((slug) => !existingSlugs.includes(slug), {
                    message: "Slug must be unique",
                }),
        }),
        description: z.string().optional(),
        image: z.object({
            _type: z.literal("image"),
            asset: z.object({
                _type: z.literal("reference"),
                _ref: z.string(),
            }),
        }),
    })
};

export function AddCollectionDialog({ open, onClose, existingSlugs, onCreated }: AddCollectionDialogProps) {
    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(getSchema(existingSlugs)),
        defaultValues: {
            title: "",
            slug: { _type: "slug", current: "" },
            description: "",
            image: {
                _type: "image",
                asset: { _ref: "", _type: "reference" },
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(""); // For Image Preview
    const [imageFile, setImageFile] = useState<File | null>(null); // For Image Upload

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setImageFile(file);
    };

    const handleDeleteImage = () => {
        setImagePreview("");
        setImageFile(null);
        setValue("image.asset._ref", "");
    }

    const onSubmit = async (data: any) => {

        // check if image is selected
        if (!imageFile) {
            toast.error("Please select an image");
            return;
        }
        try {
            setLoading(true);

            // Upload image first
            let assetId = "";
            if (imageFile) {
                const formDataImage = new FormData();
                formDataImage.append("image", imageFile);

                const uploadRes = await fetch("/api/admin/collections/upload-collection-image", {
                    method: "POST",
                    body: formDataImage,
                });

                if (!uploadRes.ok) {
                    toast.error("Image upload failed");
                    return;
                }

                const uploadData = await uploadRes.json();
                assetId = uploadData.assetId;
            }

            // Set the Image ref
            data.image.asset._ref = assetId;

            // Submit to backend
            const res = await fetch("/api/admin/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create");

            const created = await res.json();

            toast.success("Collection created!");
            reset();
            setImagePreview("");
            setImageFile(null);
            onClose();
            console.log("created collection", created.collection);
            onCreated?.(created.collection); // Pass the created collection to the parent
        } catch (err) {
            console.error(err);
            toast.error("Failed to create collection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-full flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add New Collection</DialogTitle>
                    <DialogDescription>Fill out the form to create a collection.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 hide-scrollbar overflow-y-auto px-1">
                    {/* Title */}
                    <div>
                        <Label>Title</Label>
                        <Input
                            {...register("title", {
                                onChange: (e) =>
                                    setValue(
                                        "slug.current",
                                        slugifyInput(e.target.value)
                                    ),
                            })}
                        />
                        {errors.title && <p className="text-destructive">{errors.title.message}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <Label>Slug (URL)</Label>
                        <Input {...register("slug.current", {
                            onChange: (e) =>
                                setValue(
                                    "slug.current",
                                    slugifyInput(e.target.value)
                                ),
                        })} />
                        {errors.slug?.current && <p className="text-destructive">{errors.slug.current.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <Textarea rows={3} {...register("description")} placeholder="Description (optional)" />
                    </div>

                    {/* Image */}
                    <div>
                        <Label>Image</Label>
                        {imagePreview ? (
                            <div className="relative w-fit">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    width={100}
                                    height={100}
                                    className="rounded border"
                                    unoptimized
                                />
                                <button onClick={handleDeleteImage} type="button" className="-top-2 -right-2 absolute">
                                    <CircleX className="text-destructive hover:text-destructive/80 bg-secondary rounded-full p-0" />
                                </button>
                            </div>
                        ) :
                            (
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="mt-2 cursor-pointer"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                />
                            )}
                    </div>

                    {/* Submit */}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Collection"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}