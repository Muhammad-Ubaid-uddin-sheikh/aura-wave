"use client";

import { ReviewFormValues, reviewSchema } from "@/schemas/review";
import { Review } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { MAX_IMAGES, REVIEWS_PER_PAGE } from "@/constants/review";
import ReviewHeader from "./ReviewHeader";
import { CheckCircle } from "lucide-react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import ReviewPagination from "./ReviewPagination";

type ReviewSectionProps = {
    reviews: Review[];
    productId: string;
};

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, productId }) => {
    const [currentPage, setCurrentPage] = useState(1); // Review Current Page
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Review Selected Image
    const [showForm, setShowForm] = useState(true); // Form Show State
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Form Image Previews
    const [showSuccess, setShowSuccess] = useState(false);
    const [allReviews, setAllReviews] = useState<Review[]>([]); // Merged Reviews
    const [isLoading, setIsLoading] = useState(false); // Loading State

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: '',
            reviewerName: '',
            reviewerEmail: '',
            reviewImages: [],
        },
    });

    // Merge local and server reviews
    useEffect(() => {
        const localKey = `local-reviews-${productId}`;
        const localReviews: Review[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const approved = reviews.filter((r) => r.approved !== false);

        // Remove from local if same _id is found in approved
        const filteredLocal = localReviews.filter(
            (local) => !approved.some((approvedReview) => approvedReview._id === local._id)
        );

        // Save filtered local reviews back to storage
        if (filteredLocal.length > 0) {
            localStorage.setItem(localKey, JSON.stringify(filteredLocal));
        } else {
            // Optional: remove empty key from storage
            localStorage.removeItem(localKey);
        }

        // Combine both lists
        setAllReviews([...filteredLocal, ...approved]);
    }, [reviews, productId]);

     // Average rating
    const averageRating = useMemo(
        () =>
            allReviews.length > 0
                ? allReviews.reduce((acc, cur) => acc + cur.rating, 0) / allReviews.length
                : 0,
        [allReviews]
    );

    // Paginated reviews
    const paginatedReviews = useMemo(
        () =>
            allReviews.slice(
                (currentPage - 1) * REVIEWS_PER_PAGE,
                currentPage * REVIEWS_PER_PAGE
            ),
        [allReviews, currentPage]
    );

    const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE); // Total number of pages

    // Handle Image Upload
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const currentFiles = form.getValues('reviewImages') as File[];
        const newFiles = [...currentFiles, ...files].slice(0, MAX_IMAGES);
        form.setValue('reviewImages', newFiles);

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(newPreviews);
    }, [form]);

    // Handle Image Remove
    const handleImageRemove = useCallback(
        (index: number) => {
            const newPreviews = imagePreviews.filter((_, i) => i !== index);
            const newFiles = (form.getValues('reviewImages') as File[]).filter((_, i) => i !== index);
            setImagePreviews(newPreviews);
            form.setValue('reviewImages', newFiles);
        },
        [form, imagePreviews]
    );

    // Handle Form Submission
    const onSubmit = useCallback(
        async (values: ReviewFormValues) => {
            const formData = new FormData();
            formData.append('rating', values.rating.toString());
            formData.append('comment', values.comment);
            formData.append('reviewerName', values.reviewerName);
            formData.append('reviewerEmail', values.reviewerEmail);
            formData.append('productId', productId);
            (values.reviewImages || []).forEach((file) => {
                formData.append('reviewImages', file);
            });

            setIsLoading(true);

            try {
                const res = await fetch('/api/submit-review', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Failed to submit review');

                const result = await res.json();
                const backendReview = result.review;

                // Create a local preview review object
                const localReview = {
                    _id: backendReview._id,
                    reviewerName: values.reviewerName,
                    reviewerEmail: values.reviewerEmail,
                    rating: values.rating,
                    comment: values.comment,
                    approved: false,
                    date: new Date().toISOString().split('T')[0],
                    product: { _ref: productId },
                    reviewImages: result.imageUrls, // use uploaded URLs
                };

                // Save to localStorage
                const localKey = `local-reviews-${productId}`;
                const existing: Review[] = JSON.parse(localStorage.getItem(localKey) || '[]');
                const updatedLocalReviews = [localReview, ...existing];

                // Save only if not empty
                if (updatedLocalReviews.length > 0) {
                    localStorage.setItem(localKey, JSON.stringify(updatedLocalReviews));
                } else {
                    localStorage.removeItem(localKey);
                }

                // Update state immediately
                setAllReviews((prev) => {
                    const approved = reviews.filter((r) => r.approved !== false);
                    return [...updatedLocalReviews, ...approved];
                });

                // Reset form and show message
                setShowForm(false);
                setShowSuccess(true);
                form.reset();
                setImagePreviews([]);
            } catch (error) {
                console.error('Submit Error:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [form, productId, reviews]
    );

    // Auto-dismiss the success message
    useEffect(() => {
        if (showSuccess) {
            const timeout = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timeout);
        }
    }, [showSuccess]);

    return (
        <div className="p-3 xs:p-6 rounded-md shadow-lg max-w-5xl md:mx-auto mt-8 sm:mx-4 mx-2 my-6">
            <ReviewHeader
                averageRating={averageRating}
                totalReviews={allReviews.length}
                showForm={showForm}
                toggleForm={() => setShowForm(!showForm)}
            />
            {showSuccess && (
                <div className="flex items-center justify-center text-green-600 font-medium mb-4 gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Your review has been submitted.
                </div>
            )}
            {showForm && (
                <ReviewForm
                    form={form}
                    imagePreviews={imagePreviews}
                    handleImageUpload={handleImageUpload}
                    handleImageRemove={handleImageRemove}
                    onSubmit={onSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        form.reset();
                        setImagePreviews([]);
                    }}
                    isLoading={isLoading}
                />
            )}
            {allReviews.length > 0 && (
                <ReviewList
                    reviews={paginatedReviews}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                />
            )}
            {totalPages > 1 && (
                <ReviewPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
            )}
        </div>
    );
};

export default ReviewSection;