"use client";

import { CartItem } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/helpers/formatCurrency";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Home,
  Landmark,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { GrDown } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { provinces } from "@/constants/order";
import { shippingOptions } from "@/constants/order";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { siteConfig } from "@/constants/siteConfig";

const checkoutFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  number: z
    .string()
    .regex(/^(\+92|92|0)?\d{10}$/, "Enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  province: z.enum(provinces, {
    errorMap: () => ({ message: "Province is required" }),
  }),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),

  shippingMethod: z.enum(["Free Delivery", "Fast Delivery"], {
    required_error: "Shipping method is required",
  }),
  paymentMethod: z.enum(
    ["Cash On Delivery (COD)", "Bank Transfer", "JazzCash / EasyPaisa"],
    {
      required_error: "Payment method is required",
    }
  ),
  saveInfo: z.boolean().optional(),
  billingSameAsShipping: z.boolean(),
  billing: z
    .object({
      firstName: z.string().min(2, "First name is required"),
      lastName: z.string().optional(),
      address: z.string().min(3, "Address required"),
      city: z.string().min(2, "City required"),
      postalCode: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

type FormData = z.infer<typeof checkoutFormSchema>;

const Checkout = () => {
  const router = useRouter();

  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [orderTotals, setOrderTotals] = useState({
    totalAmount: 0,
    discountCode: "",
    discountAmount: 0,
    shippingCost: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingMethod: "Free Delivery",
      paymentMethod: "Cash On Delivery (COD)",
      billingSameAsShipping: true,
      saveInfo: false,
    },
  });

  const itemsToCheckout = buyNowItem && [buyNowItem];

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("customer-info");
    if (savedData) {
      const parsedData: Partial<{
        firstName: string;
        lastName: string;
        address: string;
        province: string;
        city: string;
        number: string;
      }> = JSON.parse(savedData);

      // Manually set only allowed keys
      if (parsedData.firstName) setValue("firstName", parsedData.firstName);
      if (parsedData.lastName) setValue("lastName", parsedData.lastName);
      if (parsedData.address) setValue("address", parsedData.address);
      if (parsedData.city) setValue("city", parsedData.city);
      if (parsedData.number) setValue("number", parsedData.number);
      if (parsedData.province) {
        setValue("province", parsedData.province as (typeof provinces)[number]);
      }
      setValue("saveInfo", true); // Set saveInfo to true if data exists
    }
  }, [setValue]);

  // Load Buy Now item from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("buyNowItem");
    if (stored) {
      const parsed = JSON.parse(stored);
      setBuyNowItem(parsed);
    }
    setIsPageLoading(false);
  }, []);

  // Loading spinner till cartItems are loaded
  if (isPageLoading) {
    return (
      <div className="w-full bg-background/60 backdrop-blur-sm flex items-center justify-center min-h-screen gap-2">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p>Loading Checkout...</p>
      </div>
    );
  }

  // If no items to checkout, show empty cart message
  if (!itemsToCheckout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground">
          Add some products to your cart to continue shopping.
        </p>
        <Button asChild>
          <Link href="/">Go to Shop</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsOrderLoading(true);
    try {
      const payload = {
        // customer details
        name: `${data.firstName} ${data.lastName || ""}`.trim(),
        email: data.email || "",
        number: data.number,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode || "",

        // order details
        shippingMethod: data.shippingMethod,
        shippingCost: orderTotals.shippingCost,
        paymentMethod: data.paymentMethod,
        subscribe: false,

        subtotalAmount:
          orderTotals.totalAmount +
          orderTotals.discountAmount -
          orderTotals.shippingCost,
        discountCode: orderTotals.discountCode || "",
        discountAmount: orderTotals.discountAmount,
        totalAmount: orderTotals.totalAmount,

        // billing details
        billingInfo: showBilling
          ? {
              name: `${data.billing?.firstName} ${data.billing?.lastName || ""}`.trim(),
              address: data.billing?.address,
              city: data.billing?.city,
              postalCode: data.billing?.postalCode || "",
              number: data.billing?.phone || "",
            }
          : null,

        // Order Items
        orderItems: itemsToCheckout?.map((item) => ({
          productId: item._id,
          slug: item.slug,
          title: item.title,
          variant: item.variant,
          price: item.originalPrice,
          discountPrice: item.discountedPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          variantKey: item.variantKey || "",
        })),
      };
      console.log("Submitting order payload:", payload);

      const res = await fetch("/api/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order failed");

      const result = await res.json();
      const payloadWithOrderId = { ...payload, orderId: result.orderId };
      sessionStorage.setItem(
        "orderDetails",
        JSON.stringify(payloadWithOrderId)
      ); // Store order details in sessionStorage
      router.push("/success");

      // Save delivery info if saveInfo is checked
      if (data.saveInfo) {
        localStorage.setItem(
          "customer-info",
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            province: data.province,
            city: data.city,
            number: data.number,
          })
        );
      } else {
        localStorage.removeItem("customer-info");
      }

      reset();
    } catch (error) {
      toast.error("Failed to submit order");
    } finally {
      setIsOrderLoading(false);
    }
  };

  const selectedPaymentMethod = watch("paymentMethod");
  const selectedShippingMethod = watch("shippingMethod");

  const handleTotalUpdate = (
    totalAmount: number,
    discountCode: string,
    discountAmount: number,
    shippingCost: number
  ) => {
    setOrderTotals({
      totalAmount,
      discountCode,
      discountAmount,
      shippingCost,
    });
  };

  return (
    <div className="mx-auto p-2 xs:p-4 my-4 min-h-[600px]">
      {/* Mobile View: Accordion */}
      <div className="block md:hidden mx-auto max-w-[600px] mb-6 px-2 sm:px-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="summary">
            <AccordionTrigger className="text-base font-medium justify-between">
              <div className="space-x-3">
                <span>Show Order Summary</span>
                <span className="font-bold">
                  {formatCurrency(orderTotals.totalAmount)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <CartSummaryContent
                cartItems={itemsToCheckout || []}
                selectedShippingMethod={selectedShippingMethod}
                onTotalUpdate={handleTotalUpdate}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop Order Page */}
      <div className="flex mx-auto w-full max-w-[600px] md:max-w-6xl">
        <div className="max-w-3xl mx-auto flex-grow px-0 sm:px-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto px-4 space-y-8"
          >
            {/* Contact */}
            <div className="space-y-2">
              <h2 className="font-semibold text-xl">Contact</h2>
              <Input placeholder="Email (optional)" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Delivery */}
            <div className="space-y-2">
              <h2 className="font-semibold text-xl">Delivery</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/*  First Name */}
                <div>
                  <Input placeholder="First name" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                {/* Last Name */}
                <div>
                  <Input
                    placeholder="Last name (Optional)"
                    {...register("lastName")}
                  />
                </div>
              </div>

              <div>
                {/* Address */}
                <Input placeholder="Address" {...register("address")} />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Province */}
              <Select
                value={watch("province")}
                onValueChange={(value) =>
                  setValue("province", value as (typeof provinces)[number], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger
                  className={`w-full ${
                    watch("province")
                      ? "text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.province && (
                <p className="text-sm text-red-500">
                  {errors.province.message}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <Input placeholder="City" {...register("city")} />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                {/* Postal Code */}
                {/* <div>
                                    <Input placeholder="Postal code (optional)" {...register("postalCode")} />
                                </div> */}
                <div>
                  {/* Phone */}
                  <Input placeholder="Phone" {...register("number")} />
                  {errors.number && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.number.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Save Customer Info */}
              <div className="flex items-center space-x-2 mt-2">
                <Controller
                  name="saveInfo"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="saveInfo"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="saveInfo"
                  className="ml-2 text-base font-medium text-muted-foreground select-none cursor-pointer"
                >
                  Save this information for next time
                </Label>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="space-y-2">
              <h2 className="font-semibold text-xl">Shipping method</h2>
              {shippingOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() =>
                    setValue(
                      "shippingMethod",
                      option.value as "Free Delivery" | "Fast Delivery"
                    )
                  }
                  className={`flex items-center justify-between border rounded-lg p-4 transition-all cursor-pointer ${
                    selectedShippingMethod === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Label className="flex items-center space-x-3 cursor-pointer">
                    <Input
                      type="radio"
                      value={option.value}
                      checked={selectedShippingMethod === option.value}
                      {...register("shippingMethod")}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="font-medium text-base">
                      {option.label}
                    </span>
                  </Label>
                  <span className="font-semibold">
                    {option.cost === 0 ? "Free" : `Rs. ${option.cost}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <h2 className="font-semibold text-xl">Payment</h2>
              {/* Cash on Delivery */}
              <div
                className={`border rounded-lg transition-all ${
                  selectedPaymentMethod === "Cash On Delivery (COD)"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <label className="flex items-center space-x-3 p-4 cursor-pointer">
                  <input
                    type="radio"
                    value="Cash On Delivery (COD)"
                    {...register("paymentMethod")}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="flex items-center font-medium">
                    <Truck className="mr-2 h-5 w-5" />
                    Cash on Delivery (COD)
                  </span>
                </label>

                <AnimatePresence>
                  {selectedPaymentMethod === "Cash On Delivery (COD)" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground bg-muted/50">
                        <div className="flex items-start">
                          <AlertCircle className="mr-2 h-4 w-4 mt-0.5 text-amber-500" />
                          <p>
                            If the order is refused at the time of delivery,
                            your order will not be entertained next time or you
                            must pay the delivery amount first.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bank Transfer */}
              <div
                className={`border rounded-lg transition-all ${
                  selectedPaymentMethod === "Bank Transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <label className="flex items-center space-x-3 p-4 cursor-pointer">
                  <input
                    type="radio"
                    value="Bank Transfer"
                    {...register("paymentMethod")}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="flex items-center font-medium">
                    <Landmark className="mr-2 h-5 w-5" />
                    Bank Transfer
                  </span>
                </label>

                <AnimatePresence>
                  {selectedPaymentMethod === "Bank Transfer" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 text-sm bg-muted/50">
                        <p className="mb-2 text-muted-foreground">
                          Please transfer the total amount to:
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Bank Name:</span> Demo
                          Bank Limited
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Account Title:</span>{" "}
                          John Doe
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Account Number:</span>{" "}
                          12345678901234
                        </p>
                        <p className="mt-2">
                          Please make sure your payment directly into our bank
                          account (John Doe), use Order ID as the payment
                          reference. Kindly share screenshot as payment proof on
                          our WhatsApp No. ({siteConfig.socials.whatsapp}) or
                          Email {siteConfig.email}
                        </p>
                           {/* ⚠️ Fake data caption */}
                        <p className="text-sm text-amber-600 mt-6">
                          ⚠️ Note: This is demo/fake payment info. Do not use
                          for real transactions.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* JazzCash OR Easypaisa */}
              <div
                className={`border rounded-lg transition-all ${
                  selectedPaymentMethod === "JazzCash / EasyPaisa"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <label className="flex items-center space-x-3 p-4 cursor-pointer">
                  <input
                    type="radio"
                    value="JazzCash / EasyPaisa"
                    {...register("paymentMethod")}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="flex items-center font-medium">
                    <CreditCard className="mr-2 h-5 w-5" />
                    JazzCash OR Easypaisa
                  </span>
                </label>

                <AnimatePresence>
                  {selectedPaymentMethod === "JazzCash / EasyPaisa" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 text-sm bg-muted/50">
                        {/* <p className="text-emerald-600 font-medium mb-2">Get 10% Discount</p> */}
                        <p className="mb-2 text-muted-foreground">
                          Pay with JazzCash or Easypaisa
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Account Title:</span>{" "}
                          Jane Doe
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">Account No:</span>{" "}
                          03001234567
                        </p>
                        <p className="mt-2 text-muted-foreground">
                          Kindly share the screenshot of the payment for further
                          processing. Thank you!
                        </p>
                        {/* ⚠️ Fake data caption */}
                        <p className="text-sm text-amber-600 mt-6">
                          ⚠️ Note: This is demo/fake payment info. Do not use
                          for real transactions.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {errors.paymentMethod && (
                <p className="text-sm text-destructive mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Billing Address */}
            <div className="space-y-2">
              <h2 className="font-semibold text-xl">Billing address</h2>

              <div className="space-y-3">
                {[
                  {
                    value: "same",
                    label: "Same as shipping address",
                    icon: <Home className="mr-2 h-5 w-5" />,
                  },
                  {
                    value: "different",
                    label: "Use a different billing address",
                    icon: <MapPin className="mr-2 h-5 w-5" />,
                  },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setShowBilling(option.value === "different")}
                    className={`border rounded-lg transition-all cursor-pointer ${
                      showBilling === (option.value === "different")
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Label className="flex items-center space-x-3 p-4 cursor-pointer">
                      <Input
                        type="radio"
                        value={option.value}
                        checked={showBilling === (option.value === "different")}
                        onChange={() =>
                          setShowBilling(option.value === "different")
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="flex items-center font-medium">
                        {option.icon}
                        {option.label}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>

              {/* Conditionally show billing form */}
              <AnimatePresence>
                {showBilling && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-20 p-1 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="First name"
                          {...register("billing.firstName")}
                        />
                        {errors?.billing?.firstName && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.billing.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Last name (optional)"
                          {...register("billing.lastName")}
                        />
                      </div>
                    </div>

                    <div>
                      <Input
                        placeholder="Address"
                        {...register("billing.address")}
                      />
                      {errors?.billing?.address && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.billing.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="City"
                          {...register("billing.city")}
                        />
                        {errors?.billing?.city && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.billing.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Postal code (optional)"
                          {...register("billing.postalCode")}
                        />
                      </div>
                    </div>

                    <Input
                      placeholder="Phone (optional)"
                      {...register("billing.phone")}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full rounded text-base"
              disabled={isOrderLoading}
            >
              {isOrderLoading
                ? "Submitting Order..."
                : `Complete order – ${formatCurrency(orderTotals.totalAmount)}`}
            </Button>
          </form>
        </div>

        {/* Desktop View: Expanded summary */}
        <div className="hidden md:block w-full max-w-xs lg:max-w-md">
          <CartSummaryContent
            cartItems={itemsToCheckout || []}
            selectedShippingMethod={selectedShippingMethod}
            onTotalUpdate={handleTotalUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;

type Props = {
  cartItems: CartItem[];
  selectedShippingMethod?: "Free Delivery" | "Fast Delivery";
  onTotalUpdate?: (
    total: number,
    discountCode: string,
    discountAmount: number,
    shippingCost: number
  ) => void;
};

function CartSummaryContent({
  cartItems,
  selectedShippingMethod = "Free Delivery",
  onTotalUpdate,
}: Props) {
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [prevTotals, setPrevTotals] = useState({
    totalAmount: 0,
    discountCode: "",
    discountAmount: 0,
    shippingCost: 0,
  });

  const handleApplyDiscount = (code: string) => {
    // Example discount logic
    // if (code.toLowerCase() === "5") {
    //     setDiscountAmount(subtotal * 0.05) // 5% discount
    //     toast.success("Discount applied successfully!")
    // } else {
    setDiscountAmount(0);
    toast.error("Invalid discount code");
    // }
  };

  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.discountedPrice ?? item.originalPrice) * item.quantity,
    0
  );

  const shippingOption = shippingOptions.find(
    (opt) => opt.value === selectedShippingMethod
  );
  const shippingCost = shippingOption?.cost ?? 0;
  const totalAmount = subtotal - discountAmount + shippingCost;

  // Notify parent component about total updates
  useEffect(() => {
    // Only update if values have actually changed
    if (
      totalAmount !== prevTotals.totalAmount ||
      discountCode !== prevTotals.discountCode ||
      discountAmount !== prevTotals.discountAmount ||
      shippingCost !== prevTotals.shippingCost
    ) {
      onTotalUpdate?.(totalAmount, discountCode, discountAmount, shippingCost);
      setPrevTotals({
        totalAmount,
        discountCode,
        discountAmount,
        shippingCost,
      });
    }
  }, [
    totalAmount,
    discountCode,
    discountAmount,
    shippingCost,
    onTotalUpdate,
    prevTotals,
  ]);

  return (
    <div className="space-y-4 p-2">
      {/* Cart Items */}
      {cartItems.map((item: CartItem) => (
        <div
          className="flex items-start gap-4"
          key={`${item._id}-${item.variantKey}`}
        >
          <Image
            src={item.imageUrl}
            width={64}
            height={64}
            alt={item.title}
            className="w-16 h-16 object-cover rounded-md bg-muted"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium break-words leading-snug whitespace-normal text-wrap">
              {item.title}
            </p>
            {item.variant && (
              <p className="text-sm text-muted-foreground">{item.variant}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Qty: {item.quantity}
            </p>
          </div>
          <p className="text-sm font-medium">
            {formatCurrency(
              Number(item.discountedPrice ?? item.originalPrice) * item.quantity
            )}
          </p>
        </div>
      ))}

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span className={shippingCost === 0 ? "text-primary font-medium" : ""}>
          {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
        </span>
      </div>

      {/* Discount Code */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            id="discountCode"
            placeholder="Discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground"
            onClick={() => handleApplyDiscount(discountCode)}
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Discount Amount */}
      {discountAmount > 0 && (
        <div className="flex justify-between text-base text-primary">
          <span>Discount</span>
          <span className="font-semibold">
            -{formatCurrency(discountAmount)}
          </span>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between text-lg font-bold border-t pt-2">
        <span>Total (PKR)</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
