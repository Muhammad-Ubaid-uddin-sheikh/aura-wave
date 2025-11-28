import { ProductData } from "@/types";
import { Badge } from "../ui/badge";
import BuyNow from "./BuyNow";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["700"],
  //   display: "swap",
});

const FEATURES = [
  "Active + Environmental Noise Cancellation",
  "Game & Music Dual Mode (30ms Low Latency)",
  "IPX5 Waterproof + Sweatproof",
  "3-4 Hours Playtime + Digital Display Case",
  "USB-C Fast Charging",
];

const Hero = ({ product }: { product: ProductData }) => {
  const {
    _id,
    title,
    tags,
    baseVideo,
    baseOriginalPrice,
    baseDiscountedPrice,
  } = product;
  return (
    <section aria-label="Hero" className="max-w-[1300px] mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-start gap-4 border-2 border-accent-foreground/90 rounded-2xl p-3 m-4 lg:mx-16">
        {/* Video */}
        <div className="relative w-full md:w-[60%] h-[400px] flex justify-center items-center overflow-hidden rounded-lg">
          {/* Blurred background */}
          <video
            src={baseVideo?.asset?.url}
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover blur-lg scale-110"
          />

          {/* Main video (no zoom, centered) */}
          <video
            src={baseVideo?.asset?.url}
            autoPlay
            loop
            muted
            aria-label="Product video"
            className="relative z-10 h-full object-contain"
          />
        </div>
        {/* <div className=" w-full h-[400px] md:w-[60%] flex justify-center items-center">
                    <video
                        src={baseVideo?.asset?.url}
                        autoPlay
                        loop
                        muted
                        aria-label="Product video"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div> */}

        {/* Details */}
        <div className="w-full md:w-[40%] flex flex-col justify-start items-start gap-4 md:gap-6">
          {/* Title */}
          <h1 className="text-[26px] md:text-4xl font-poppinsBold text-primary tracking-wider">
            {title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-3">
            {tags?.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-sm rounded-full border-accent-foreground text-accent-foreground font-light"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Price */}
          <div className="flex gap-1 items-center">
            {baseDiscountedPrice && (
              <p className="text-base xs:text-lg text-muted-foreground line-through">
                Rs.{baseOriginalPrice}
              </p>
            )}
            <p
              className={`text-3xl font-bold text-primary ${inter.className}`}
            >
              Rs.{baseDiscountedPrice ?? baseOriginalPrice}
            </p>
          </div>

          {/* Features */}
          {/* <ul className="text-sm xs:text-base text-muted-foreground font-light list-disc pl-5 space-y-1">
                        {FEATURES.map((f, i) => <li key={i}>{f}</li>)}
                    </ul> */}

          {/* Buy Now */}
          <BuyNow product={product} />
          <p className="text-sm text-muted-foreground mt-2">
  ✔ Free Shipping | ✔ Secure Payment | ✔ Easy Returns
</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
