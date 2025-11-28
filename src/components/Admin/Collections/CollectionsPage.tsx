"use client";

import { useState } from "react";
import { OnlyCollections } from "@/types";
import { Button } from "@/components/ui/button";
import { EditCollectionDialog } from "@/components/Admin/Collections/EditCollectionDialog";
import Image from "next/image";
import { siteConfig } from "@/constants/siteConfig";
import { AddCollectionDialog } from "./AddCollectionDialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { urlFor } from "@/sanity/lib/image";

export default function CollectionsPage({ collections }: { collections: OnlyCollections[] }) {
  const [collectionList, setCollectionList] = useState<OnlyCollections[]>(collections);
  const [selectedCollection, setSelectedCollection] = useState<OnlyCollections | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<OnlyCollections | null>(null);
  const [loading, setLoading] = useState(false);

  // console.log("Collections: ", collectionList);

  const handleOpen = (collection: OnlyCollections) => {
    setSelectedCollection(collection);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedCollection(null);
  };

  const handleDelete = async (collectionId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      const deleted = await res.json();
      console.log("Deleted Collection", deleted.deleted);
      
      setCollectionList((prev) => prev.filter((c) => c._id !== collectionId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false)
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 p-6 my-6">
      <div className="flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button variant={"outline"} onClick={() => setAddOpen(true)}>Add Collection</Button>
      </div>
      {collectionList.map((collection) => (
        <div
          key={collection._id}
          className="flex items-start space-x-6 border-b pb-4"
        >
          <Image
            src={urlFor(collection.image).url() || siteConfig.fallbackImage}
            alt={collection.title}
            width={150}
            height={150}
            className="rounded-md object-cover"
          />

          <div className="flex-1">
            <p className="font-semibold text-xl">
              Title: {collection.title}
            </p>
            <p className="text-lg text-muted-foreground">
              Url: {collection.slug.current}
            </p>
            {collection.description && (
              <p className="text-sm mt-1 text-gray-700">
                Description: {collection.description}
              </p>
            )}

            <div className="mt-4 flex space-x-2">
              <Button variant="outline" onClick={() => handleOpen(collection)}>
                Edit
              </Button>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setDeleting(collection)}>
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the collection <strong>{deleting?.title}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleting(null)}>Cancel</AlertDialogCancel>
                    <Button
                      variant={"destructive"}
                      onClick={() => handleDelete(deleting!._id)}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Collection Dialog */}
      {selectedCollection && (
        <EditCollectionDialog
          open={dialogOpen}
          onClose={handleClose}
          collection={selectedCollection}
          existingSlugs={
            collectionList
              .filter((c) => c._id !== selectedCollection._id)
              .map((c) => c.slug.current)
          }
          onUpdated={(updatedCollection) => {
            setCollectionList((prev) =>
              prev.map((c) =>
                c._id === updatedCollection._id ? updatedCollection : c
              )
            );
          }}
        />
      )}

      {/* Add Collection Dialog */}
      <AddCollectionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingSlugs={collectionList.map((c) => c.slug.current)}
        onCreated={(newCollection) => {
          setCollectionList((prev) => [newCollection, ...prev]);
          setAddOpen(false);
        }}
      />
    </div>
  );
}