"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/helpers/formatCurrency";
import { Loader2 } from "lucide-react";
import Link from "next/link"
import { useEffect, useState } from "react"

const Success = () => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // console.log("Order Details:", order);

  // Load order details from sessionStorage & remove buyNowItem
  useEffect(() => {
    sessionStorage.removeItem("buyNowItem");
    const data = sessionStorage.getItem("orderDetails");
    if (data) setOrder(JSON.parse(data));
    setLoading(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-background/60 backdrop-blur-sm flex items-center justify-center min-h-screen gap-2">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Finalizing your order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div>
        <div className="max-w-3xl mx-auto p-4 min-h-screen flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-semibold">Order Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn't find your order details. Please try again later.
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto p-4 my-4">

      {/* Mobile View: Accordion */}
      <div className="block md:hidden mx-auto max-w-[600px] mb-6 px-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="summary">
            {/* Trigger */}
            <AccordionTrigger className="text-base font-medium justify-between">
              <div className="space-x-3">
                <span>Show Order Summary</span>
                <span className="font-bold">{order ? formatCurrency(order.totalAmount) : ""}</span>
              </div>
            </AccordionTrigger>

            {/* Content */}
            <AccordionContent className="space-y-4 pt-4">
              <OrderSummaryContent order={order} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop Order Page */}
      <div className="flex mx-auto w-full max-w-[600px] md:max-w-5xl gap-2">

        <div className="max-w-3xl mx-auto flex-grow px-4 ">

          {/* Thank You */}
          <div className="space-y-2">
            <p className="text-lg">Your Order ID {order?.orderId ? `#${order.orderId}` : ""}</p>
            <p className="text-sm text-muted-foreground">Save this ID for Order Tracking</p>
            <h2 className="text-2xl font-semibold mt-1">Thank you,  {order?.name?.split(" ")[0] || "Customer"}!</h2>
            <p className="mt-2 text-xl font-bold">Your order is confirmed</p>
            <p className="text-sm text-muted-foreground">
              You’ll receive a confirmation email / call when your order is ready.
            </p>
          </div>

          {/* Order Details */}
          <div className="border border-border rounded-md p-4 space-y-6 text-sm mt-4">

            <h3 className="text-lg">Order Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Info */}
              <div className="grid-flow-col">
                <h4 className="font-bold mb-1">Contact information</h4>
                <p>{order?.email || order?.number || "-"}</p>
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="font-bold mb-1">Payment method</h4>
                <p>{order?.paymentMethod || "-"} -{" "}<span className="font-bold">{order ? formatCurrency(order?.totalAmount) : ""}</span></p>
              </div>

              {/* Shipping address */}
              <div>
                <h4 className="font-bold mb-1">Shipping address</h4>
                <p>{order?.name}</p>
                <p>{order?.address}</p>
                <p>{order?.city}</p>
                <p>{order?.province}</p>
                <p>{order?.number}</p>
              </div>

              {/* Billing address */}
              <div>
                <h4 className="font-bold mb-1">Billing address</h4>
                <p>{order?.billingInfo?.name || order?.name}</p>
                <p>{order?.billingInfo?.address || order?.address}</p>
                <p>{order?.billingInfo?.city || order?.city}</p>
                <p>{order?.billingInfo?.province || order?.province}</p>
                <p>{order?.billingInfo?.number || order?.number}</p>
              </div>

              {/* Shipping method */}
              <div>
                <h4 className="font-bold mb-1">Shipping method</h4>
                <p>{order?.shippingMethod}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Desktop View: Expanded summary */}
        <div className="hidden md:block max-w-2xl">
          <OrderSummaryContent order={order} />
        </div>
      </div>

    </div>
  )
}

export default Success

function OrderSummaryContent({ order }: { order: any }) {
  if (!order) {
    return <p className="text-muted-foreground">No order details available</p>
  }
  return (
    <div className="space-y-4">
      {/* Product Row */}
      {order.orderItems?.map((item: any, idx: number) => (
        <div key={idx} className="flex items-start gap-4">
          <img
            src={item.imageUrl || "/fallback-image.png"}
            alt={item.title}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {item.title}
            </p>
            {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
          </div>
          <p className="text-sm font-medium">{formatCurrency(item.discountPrice ?? item.price) || 0}</p>
        </div>
      ))}

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatCurrency(order.subtotalAmount) || 0}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span className="font-medium">{order.shippingCost > 0
          ? `${formatCurrency(order.shippingCost)}`
          : "Free"}</span>
      </div>

      {/* Discount */}
      {order.discountAmount > 0 && (
        <div className="flex justify-between text-s">
          <span>Discount</span>
          <span className="font-bold">
            {formatCurrency(order.discountAmount) || 0}
          </span>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between text-base font-bold border-t pt-2">
        <span>Total (PKR)</span>
        <span>{formatCurrency(order.totalAmount)}</span>
      </div>
    </div>
  )
}