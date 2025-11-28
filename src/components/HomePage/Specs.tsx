"use client";

import { Specification } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "../ui/badge";

const Specifications = ({ specs }: { specs: Specification[] }) => {
    return (
        <section id="specs" aria-label="Specifications" className={`scroll-mt-24 max-w-[1300px] mx-auto py-12 space-y-12 overflow-x-hidden`}>

            {/* Section Heading */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center space-y-4 px-4"
            >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold md:font-extrabold font-poppinsBold tracking-wider text-primary relative inline-block">
                    Specifications
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-accent-foreground rounded-full" />
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
                    Explore the standout features that make these earbuds exceptional.
                </p>
            </motion.div>

            {/* Another Heading Design */}
            {/* <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold font-poppinsBold tracking-wide bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent"
            >
                Specifications
            </motion.h1> */}

            {specs.map((spec, index) => {
                const isEven = index % 2 === 0;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isEven ? -100 : 100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.2 }}
                        className={`flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16 border-2 border-accent-foreground/90 rounded-2xl p-3 m-4 lg:mx-16 pb-10 ${isEven ? "" : "md:flex-row-reverse"
                            }`}
                    >
                        {/* Text Block */}
                        <div className="md:w-1/2 space-y-4">
                            <h3 className="text-2xl md:text-3xl font-poppinsBold text-primary tracking-tight">
                                {spec.title}
                            </h3>
                            <p className="text-muted-foreground text-base leading-relaxed">
                                {spec.description}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {spec?.tags?.map((tag, i) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-sm rounded-full border-accent-foreground text-accent-foreground font-light"
                                    >{tag}</Badge>
                                ))}
                            </div>
                        </div>

                        {/* Image Block */}
                        <div className="md:w-1/2 w-full">
                            <div className="relative h-[50vh] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
                                <Image
                                    src={spec.image ? urlFor(spec.image).url() : ""}
                                    alt={spec.title ?? "Specification Image"}
                                    fill
                                    className="object-cover"
                                    sizes="(min-width: 768px) 50vw, 100vw"
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </section>
    );
};

export default Specifications;