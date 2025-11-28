"use client";

import { Button } from "@/components/ui/button"
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import CommonButton from "@/components/Common/CommonButton";
import { motion } from "framer-motion"
import { usePathname } from 'next/navigation'
import { CartItem, ProductData } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import { siteConfig } from "@/constants/siteConfig";
import { useRouter } from "next/navigation"
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

type BuyNowProp = {
  product: ProductData;
  headerRender?: boolean
}

const BuyNow = ({ product, headerRender = false }: BuyNowProp) => {
  const [quantity, setQuantity] = useState(1);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/checkout') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-[85px] text-[12px] text-muted-foreground text-center"
      >
        Aura Oulm 1349
      </motion.div>
    );
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleBuyNow = () => {
    const buyNowItem: CartItem = {
      _id: product._id ?? "",
      title: product.title ?? "",
      slug: "",
      variant: "",
      originalPrice: product.baseOriginalPrice ?? 0,
      discountedPrice: product.baseDiscountedPrice,
      stockLevel: product.baseStock ?? 0,
      quantity: quantity,
      imageUrl: product.baseImages ? urlFor(product.baseImages[0]).url() : siteConfig.fallbackImage,
      variantKey: "",
    };

    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    router.push("/checkout");
  }

  return (
    <div className={`flex flex-col gap-6 ${headerRender ? "w-[80px] md:w-[120px]" : "w-full"}`}>
      {/* Quantity Button */}
      {!headerRender && (
        <div className={"w-full min-w-[110px] max-w-[140px] sm:max-w-[150px] border border-primary py-3 px-4 rounded-md flex items-center justify-between text-accent-foreground"}>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="h-6 sm:h-6 aspect-square text-xl hover:text-muted-foreground bg-transparent hover:bg-transparent"
            onClick={handleDecrease}
          >
            <Minus />
          </Button>
          <span className="font-medium text-base px-2 sm:text-lg">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="h-6 sm:h-6 aspect-square text-xl hover:text-muted-foreground bg-transparent hover:bg-transparent"
            onClick={handleIncrease}
          >
            <Plus />
          </Button>
        </div>
      )}

      {/* Buy Now Button */}
      {headerRender ? (
        <motion.div
          animate={{
            scale: [1, 0.95, 1.05, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 1.3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <CommonButton
            className="bg-primary text-secondary-foreground p-2 md:p-6 rounded-md text-sm md:text-lg font-normal md:font-semibold w-full transition-all duration-300 transform hover:bg-transparent hover:text-primary hover:border hover:border-primary hover:-translate-y-1"
            onClick={handleBuyNow}
          >
            Buy Now
          </CommonButton>
        </motion.div>
      ) : (
        <motion.div
          animate={{
            scale: [1, 0.95, 1.1, 1.1, 0.95, 1],
            rotate: [0, -2, 2, -2, 2, 0],
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 5,
          }}
        >
          <CommonButton
            className="bg-primary text-secondary-foreground  p-6 rounded-full text-lg font-semibold w-full transition-all duration-300 transform hover:bg-transparent hover:text-primary hover:border hover:border-primary hover:-translate-y-1"
            onClick={handleBuyNow}
          >
            Buy Now
          </CommonButton>
        </motion.div>
      )}

      {/* Order On Whatsapp */}
      {/* {!headerRender && (
        <Link
          href={`https://wa.me/${siteConfig.socials.whatsapp}?text=${encodeURIComponent(
            `Hello! I’m interested in placing an order.\n\nProduct: ${product.title}\nQuantity: ${quantity}\nTotal Price: Rs. ${(product.baseDiscountedPrice ?? product.baseOriginalPrice ?? 0) * quantity
            }\n\nPlease let me know how to proceed. Thank you.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-transparent text-primary hover:bg-green-600 hover:text-primary-foreground text-green-600 border-2 border-green-600 transition-colors duration-300 font-semibold py-3 rounded-full flex items-center justify-center space-x-2 group"
        >
          <FaWhatsapp className="w-5 h-5 text-green-600 group-hover:text-primary-foreground" />
          <span>Order on WhatsApp</span>
        </Link>
      )} */}
    </div>
  )
}

export default BuyNow