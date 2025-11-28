import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // console.log("Order Submit Body:", body)

    // 1. Check if customer exists by name (lowercase) and last 10 digits of number
    let customerDoc = await client.fetch(
      `*[_type == "customer" && lower(name) == $name && number match $number][0]`,
      {
        name: (body.name || "").toLowerCase(),
        number: `*${(body.number || "").slice(-10)}`,
      }
    );

    // 2. If not found, create new customer
    if (!customerDoc) {
      customerDoc = await client.create({
        _type: "customer",
        name: body.name,
        email: body.email || '',
        number: body.number,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode || '',
      });
    }

    // 3. Create OrderItem Documents
    const orderItems = body.orderItems ?? [];
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No order items found' }, { status: 400 });
    }

    // Add a unique _key for each item (required by Sanity)
    const orderItemObjs = orderItems.map((item: any, idx: number) => ({
      _type: "orderItem",
      productId: item.productId,
      slug: item.slug,
      title: item.title,
      variant: item.variant || '',
      variantKey : item.variantKey || '',
      price: item.price,
      discountPrice: item.discountPrice || 0,
      quantity: item.quantity,
      imageUrl: item.imageUrl || '',
      _key: `${item.productId}_${item.variantKey || ""}_${Date.now()}_${idx}`,
    }));

    // 4. Get last orderId from sanity
    const lastOrder = await client.fetch(
      `*[_type == "order"] | order(orderId desc)[0]{orderId}`
    );

    let newOrderId = 2280001;
    if (lastOrder && lastOrder.orderId && String(lastOrder.orderId).startsWith("228")) {
      newOrderId = Number(lastOrder.orderId) + 1;
    }

    // 5. Create Order Document
    const orderDoc = {
      _type: 'order',
      customer: {
        _type: "reference",
        _ref: customerDoc._id,
      },
      orderItems: orderItemObjs,
      orderId: newOrderId.toString(),
      shippingMethod: body.shippingMethod,
      shippingCost: body.shippingCost ?? 0,
      paymentMethod: body.paymentMethod,
      paymentStatus: "unpaid",
      orderStatus: "pending",
      subscribe: body.subscribe ?? false,

      subtotalAmount: body.subtotalAmount ?? 0,
      discountCode: body.discountCode ?? "",
      discountAmount: body.discountAmount ?? 0,
      totalAmount: body.totalAmount ?? 0,
      ...(body.billingInfo && typeof body.billingInfo === "object"
        ? { billingInfo: body.billingInfo }
        : {}),
    }

    const result = await client.create(orderDoc)

    return NextResponse.json({ success: true, orderId: newOrderId })

  } catch (err) {
    console.error("Order Submit Error:", err)
    return NextResponse.json({ success: false, message: 'Invalid data or server error' }, { status: 400 })
  }
}