"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { OnlyCollections } from "@/types";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { get, set } from "lodash";
import { slugifyInput } from "@/lib/helpers/slugifyInput";
import { z } from "zod";
import { CircleX } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { urlFor } from "@/sanity/lib/image";

interface EditCollectionDialogProps {
    open: boolean;
    onClose: () => void;
    collection: OnlyCollections;
    existingSlugs: string[];
    onUpdated?: (updatedCollection: OnlyCollections) => void;
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

export function EditCollectionDialog({ open, onClose, collection, existingSlugs, onUpdated }: EditCollectionDialogProps) {
    const schema = getSchema(existingSlugs);
    type CollectionFormValues = z.infer<typeof schema>;
    const {
        register,
        handleSubmit,
        formState: { dirtyFields, isDirty, errors },
        reset,
        setValue,
    } = useForm<CollectionFormValues>({
        resolver: zodResolver(schema),
        defaultValues: collection,
        values: collection, // ensures reset when dialog opens
    });

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(urlFor(collection.image).url());
    const [imageAssetId, setImageAssetId] = useState(collection.image.asset._ref);

    useEffect(() => {
        reset(collection);
        setImagePreview(urlFor(collection.image).url());
        setImageFile(null)
        setImageAssetId(collection.image.asset._ref)
    }, [collection, reset]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setImageFile(file);
        setValue("image.asset._ref", "", { shouldDirty: true });
    }

    const handleDeleteImage = () => {
        setImagePreview("");
        setImageFile(null);
        setValue("image.asset._ref", "", { shouldDirty: true });
    }

    const onError = (errors: any) => console.log("errors,", errors)

    const onSubmit = async (data: CollectionFormValues) => {

        // Check if image is deleted but not replaced
        if (dirtyFields.image?.asset?._ref && !imageFile) {
            toast.error("Please select an image");
            return;
        }

        // Collect only changed fields
        const changedFields: Partial<OnlyCollections> = {};
        const collectChanges = (dirtyFields: any, path: string[] = []): void => {
            for (const key in dirtyFields) {
                const value = dirtyFields[key]
                const currentPath = [...path, key];

                if (typeof value === "object" && value !== true) {
                    collectChanges(value, currentPath);
                } else if (value === true) {
                    const pathString = currentPath.join(".");
                    const changedValue = get(data, pathString);
                    set(changedFields, pathString, changedValue);
                }
            }
        }
        collectChanges(dirtyFields);

        // Ensure slug._type is always sent if slug.current is being updated
        if (changedFields.slug?.current && !changedFields.slug._type) {
            changedFields.slug._type = "slug";
        }

        // if no changes, show toast message
        if (Object.keys(changedFields).length === 0) {
            toast.info("No changes to update.");
            return;
        }

        // Start Loading
        setLoading(true);

        try {
            // Image Upload (if image was changed)
            if (dirtyFields.image?.asset?._ref && imageFile) {
                try {
                    const formData = new FormData();
                    formData.append("image", imageFile);
                    formData.append("oldAssetId", imageAssetId);

                    const uploadRes = await fetch("/api/admin/collections/upload-collection-image", {
                        method: "POST",
                        body: formData,
                    })

                    if (!uploadRes.ok) {
                        toast.error("Image upload failed");
                        return;
                    }

                    const uploadData = await uploadRes.json();
                    const newAssetId = uploadData.assetId;

                    set(changedFields, "image", {
                        _type: "image",
                        asset: { _type: "reference", _ref: newAssetId }
                    });
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);
                    toast.error("Failed to upload new image.");
                    return;
                }
            }

            // Patch the collection
            const res = await fetch(`/api/admin/collections/${collection._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(changedFields),
            });
            if (!res.ok) throw new Error("Update failed");

            const updated = await res.json();
            console.log("Updated collection:", updated.collection);
            toast.success("Collection updated!");
            onClose();
            onUpdated?.(updated.collection);
        } catch (err) {
            console.error("Collection update error:", err);
            toast.error("Failed to update collection.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-full flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                    <DialogDescription className="sr-only"></DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4 hide-scrollbar overflow-y-auto px-1">
                    {/* Title */}
                    <div>
                        <Label>Title</Label>
                        <Input {...register("title")} />
                        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <Label>Slug (URL)</Label>
                        <Input
                            {...register("slug.current", {
                                onChange: (e) =>
                                    setValue(
                                        "slug.current",
                                        slugifyInput(e.target.value),
                                        { shouldDirty: true }
                                    ),
                            })}
                        />
                        {errors.slug?.current && <p className="text-red-500">{errors.slug.current.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <Textarea rows={3} {...register("description")} />
                    </div>

                    {/* Image */}
                    <div>
                        <Label>Image Preview</Label>
                        {imagePreview ? (
                            <div className="relative w-fit">
                                <Image
                                    src={imagePreview}
                                    alt={collection.title}
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

                    {/* Save Button */}
                    <Button type="submit" disabled={loading || !isDirty}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}