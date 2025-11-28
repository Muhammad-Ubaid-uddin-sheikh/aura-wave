import { Order } from "@/types";
import { z } from "zod";

export const orderFormSchema = z.object({
    shippingMethod: z.string(),
    shippingCost: z.coerce.number().optional(),
    paymentMethod: z.string(),
    paymentStatus: z.string(),
    orderStatus: z.string(),
    subtotalAmount: z.coerce.number(),
    discountCode: z.string().optional(),
    discountAmount: z.coerce.number().optional(),
    totalAmount: z.coerce.number(),
    customer: z.object({
        name: z.string(),
        number: z.string(),
        address: z.string(),
        city: z.string(),
        province: z.string(),
        email: z.string().optional(),
        postalCode: z.string().optional().nullable(),
        _id: z.string(),
    }),
    billingInfo: z.object({
        name: z.string(),
        number: z.string().optional(),
        address: z.string(),
        city: z.string(),
        postalCode: z.string().optional().nullable(),
    }).optional(),
    orderItems: z.array(z.object({
        _key: z.string(),
        title: z.string(),
        variant: z.string().optional(),
        variantKey: z.string().optional(),
        price: z.coerce.number(),
        quantity: z.coerce.number(),
        discountPrice: z.coerce.number().optional(),
        productId: z.string().optional(),
        imageUrl: z.string().optional(),
        slug: z.string().optional().nullable(), // change slug validation to only this in future  z.string().optional()
    })),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const getOrderFormValues = (order: Order): OrderFormValues => ({
    customer: { ...order.customer },
    orderItems: order.orderItems.map((item) => ({ ...item })),
    billingInfo: order.billingInfo
        ? {
            name: order.billingInfo.name || "",
            number: order.billingInfo.number || "",
            address: order.billingInfo.address || "",
            city: order.billingInfo.city || "",
            postalCode: order.billingInfo.postalCode || "",
        }
        : undefined,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    discountAmount: order.discountAmount,
    paymentMethod: order.paymentMethod,
    shippingMethod: order.shippingMethod,
    shippingCost: order.shippingCost,
    subtotalAmount: order.subtotalAmount,
    totalAmount: order.totalAmount,
});