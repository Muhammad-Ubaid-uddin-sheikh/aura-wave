import { Review } from "@/types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import Image from "next/image";

type ReviewListProps = {
    reviews: Review[];
    selectedImage: string | null;
    setSelectedImage: (image: string | null) => void;
};

const ReviewList = ({ reviews, selectedImage, setSelectedImage }: ReviewListProps) => {
    return (
        <div className="space-y-4 mb-4">
            {reviews.map((review) => (
                <div key={review._id} className="border border-border p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-yellow-500">
                            {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                        </div>
                        <span className="text-muted-foreground text-sm">{review.date}</span>
                    </div>
                    <p className="text-secondary-foreground mt-1">{review.comment}</p>
                    <div className="text-sm text-muted-foreground mt-2">— {review.reviewerName}</div>

                    {/* Review Images */}
                    {(review.reviewImages?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Dialog>
                                {(review.reviewImages ?? []).map((image, index) => (
                                    <DialogTrigger key={index} asChild>
                                        <Image
                                            src={image}
                                            alt={`Review image ${index + 1}`}
                                            width={80}
                                            height={80}
                                            className="rounded max-w-[75px] xs:max-w-[100px] cursor-pointer"
                                            onClick={() => setSelectedImage(image)}
                                        />
                                    </DialogTrigger>
                                ))}
                                <DialogContent className="min-w-[50vw] max-w-[90vw] min-h-[70vh] max-h-[90vh] p-0">
                                    <DialogTitle className="sr-only">Selected Review Image</DialogTitle>
                                    <DialogDescription className="sr-only">
                                        This dialog shows a larger view of the selected review image.
                                    </DialogDescription>
                                    <Image
                                        src={selectedImage || (review.reviewImages?.[0] ?? "")}
                                        alt="Selected review image"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
};

export default ReviewList;