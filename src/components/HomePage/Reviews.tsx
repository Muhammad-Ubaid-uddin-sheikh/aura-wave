"use client";

import { Pencil, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    name: "Ali Raza",
    rating: 5,
    text: "This watch turns heads everywhere I go. The oversized dial and rugged design make it stand out. It feels solid and premium on the wrist.",
  },
  {
    name: "Hamza Sheikh",
    rating: 4,
    text: "The leather strap is surprisingly comfortable. I wore it the whole day without any irritation. Looks even better in person than in the pictures.",
  },
  {
    name: "Mariam Fatima",
    rating: 5,
    text: "Bought it as a gift for my brother — he absolutely loved the big dial and bold look. The decorative compass adds a unique touch.",
  }
];

const CustomerReviews = () => {
    return (
        <section id="reviews" aria-label="Customer Reviews" className="scroll-mt-24 max-w-[1300px] mx-auto py-12 space-y-12">
            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center space-y-4 px-4"
            >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold md:font-extrabold font-poppinsBold tracking-wider text-primary relative inline-block">
                    Customer Reviews
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-accent-foreground rounded-full" />
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                    Honest feedback from real users who tried and tested the product.
                </p>
            </motion.div>

            {/* Review Cards */}
            <div className="grid gap-6 md:grid-cols-3 m-4 lg:mx-16">
                {reviews.map((review, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        className="rounded-xl border border-muted bg-background p-6 shadow-md transition-all duration-300 ease-in-out hover:bg-accent-foreground/5 hover:shadow-xl hover:border-accent-foreground group"
                    >
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    className={`transition-colors duration-300 ${i < review.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-muted-foreground group-hover:text-yellow-400"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Text */}
                        <p className="text-base text-muted-foreground group-hover:text-primary mb-4 transition-colors duration-300">
                            “{review.text}”
                        </p>

                        {/* Name */}
                        <p className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors duration-300">
                            {review.name}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Write a Review Button */}
            <div className="text-center mt-4">
                <Link href="/reviews">
                    <Button variant="outline" className="rounded-full px-6 py-4 text-sm sm:text-base hover:bg-primary hover:text-white transition-colors duration-500">
                        Write a Review <Pencil className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </section>
    );
};

export default CustomerReviews;