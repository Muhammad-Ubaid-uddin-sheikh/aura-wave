import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'reference',
      to: [{ type: 'customer' }],
    }),
    defineField({
      name: 'orderItems',
      title: 'Order Items',
      type: 'array',
      of: [{ type: 'orderItem' }],
    }),
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
    }),
    defineField({
      name: 'shippingMethod',
      title: 'Shipping Method',
      type: 'string',
    }),
    defineField({
      name: "shippingCost",
      title: "Shipping Cost",
      type: "number",
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: [
          { title: "Paid", value: "paid" },
          { title: "Unpaid", value: "unpaid" },
        ],
        layout: "radio",
      },
      initialValue: "unpaid",
    }),
    defineField({
      name: 'orderStatus',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
        {title: 'Pending', value: 'pending'},
        {title: 'Confirmed',value: 'confirmed'},
        {title: 'Shipped',value: 'shipped'},
        {title: 'Delivered',value: 'delivered'},
        {title: 'Cancelled',value: 'cancelled'},
        {title: 'Returned', value: 'returned'},
      ],
        layout: 'dropdown',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'subscribe',
      title: 'Subscribed to Newsletter',
      type: 'boolean',
    }),
    defineField({
      name: "subtotalAmount",
      title: "Subtotal Amount",
      type: "number",
    }),
    defineField({
      name: 'discountCode',
      title: 'Discount Code',
      type: 'string',
    }),
    defineField({
      name: "discountAmount",
      title: "Discount Amount",
      type: "number",
    }),

    defineField({
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
    }),
    defineField({
      name: 'billingInfo',
      title: 'Billing Info (optional)',
      type: 'object',
      fields: [
        { name: 'name', type: 'string', title: 'Full Name' },
        { name: 'address', type: 'string', title: 'Address' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'postalCode', type: 'string', title: 'Postal Code' },
        { name: 'number', type: 'string', title: 'Number' },
      ],
    }),
  ],
})