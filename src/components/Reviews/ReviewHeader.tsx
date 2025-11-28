import { StarIcon } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const ReviewHeader: React.FC<{
    averageRating: number;
    totalReviews: number;
    showForm: boolean;
    toggleForm: () => void;
}> = ({ averageRating, totalReviews, showForm, toggleForm }) => {
    return (
        <div className="text-center mb-8">
            <h2 className="text-2xl xs:text-3xl font-bold text-accent-foreground tracking-wide">Customer Reviews</h2>
            {totalReviews > 0 ? (
                <div className="mt-4 flex flex-wrap xs:flex-nowrap items-center justify-center space-y-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-6 w-6 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <p className="ml-2 text-lg text-muted-foreground">
                        {averageRating.toFixed(1)} based on {totalReviews} reviews
                    </p>
                </div>
            ) : (
                <div className="mt-4">
                    <p className="text-lg text-muted-foreground">Be the first to write a review</p>
                    <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-6 w-6 text-yellow-500" />
                        ))}
                    </div>
                </div>
            )}
            <motion.button
                onClick={toggleForm}
                className="mt-6 bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-md transition duration-300 relative w-[160px] h-[44px] overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={showForm ? 'cancel' : 'write'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="absoluteWQ3 absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center"
                    >
                        {showForm ? 'Cancel Review' : 'Write a review'}
                    </motion.span>
                </AnimatePresence>
            </motion.button>
        </div>
    )
};

export default ReviewHeader