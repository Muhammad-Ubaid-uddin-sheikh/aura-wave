import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MAX_IMAGES } from "@/constants/review";
import { ReviewFormValues } from "@/schemas/review";
import { useForm } from "react-hook-form";
import { UPLOAD_IMAGE_URL } from "@/constants/urls";

type ReviewFormProps = {
  form: ReturnType<typeof useForm<ReviewFormValues>>;
  imagePreviews: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageRemove: (index: number) => void;
  onSubmit: (values: ReviewFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
};

const ReviewForm = ({
  form,
  imagePreviews,
  handleImageUpload,
  handleImageRemove,
  onSubmit,
  onCancel,
  isLoading,
}: ReviewFormProps) => {
  const { register, handleSubmit, formState } = form;

  return (
    <div className="bg-gray-50 p-4 rounded shadow-md mb-3">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="reviewerName">Your Name</Label>
          <Input
            id="reviewerName"
            placeholder="Enter your name"
            {...register("reviewerName")}
          />
          {formState.errors.reviewerName && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.reviewerName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("reviewerEmail")}
          />
          {formState.errors.reviewerEmail && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.reviewerEmail.message}
            </p>
          )}
        </div>

        {/* Rating */}
        <div>
          <Label>Rating</Label>
          <div className="flex space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => form.setValue("rating", star)}
                className={`text-2xl transition-colors ${
                  form.watch("rating") >= star ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {formState.errors.rating && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.rating.message}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="comment">Comment</Label>
          <Textarea
            id="comment"
            placeholder="Write your review..."
            {...register("comment")}
          />
          {formState.errors.comment && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.comment.message}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <Label>Upload Images (Max {MAX_IMAGES})</Label>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  className="max-w-24 rounded border"
                  alt={`preview-${index}`}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5"
                  onClick={() => handleImageRemove(index)}
                >
                  ×
                </button>
              </div>
            ))}
            {imagePreviews.length < MAX_IMAGES && (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
                <img
                  src={UPLOAD_IMAGE_URL}
                  alt="uploadArea"
                  width={100}
                  height={100}
                  className="max-w-24 border rounded"
                />
              </label>
            )}
          </div>
          {formState.errors.reviewImages && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.reviewImages.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel Review
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;