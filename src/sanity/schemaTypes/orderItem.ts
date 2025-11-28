import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'orderItem',
  title: 'Order Item',
  type: 'object',
  fields: [
    defineField({ name: 'productId', title: 'Product ID', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug / Url', type: 'string' }),
    defineField({ name: 'title', title: 'Product Name', type: 'string' }),
    defineField({ name: 'variant', title: 'Variant', type: 'string' }),
    defineField({ name: 'variantKey', title: 'Variant Key', type: 'string' }),
    defineField({ name: 'price', title: 'Price', type: 'number' }),
    defineField({ name: 'discountPrice', title: 'Discount Price', type: 'number' }),
    defineField({ name: 'quantity', title: 'Quantity', type: 'number' }),
    defineField({
      name: 'imageUrl',
      title: 'Product Image',
      type: 'url',
    }),
  ],
})