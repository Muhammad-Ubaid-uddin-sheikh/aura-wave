import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'variant',
  type: 'object',
  title: 'Variant',
  fields: [
    defineField({
      name: 'attributes',
      title: 'Attributes (e.g. Size, Color)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'attributeName',
              title: 'Attribute Name (e.g. Size)',
              type: 'string',
              validation: Rule => Rule.required().min(1).warning('Attribute Name is required'),
            },
            {
              name: 'attributeValue',
              title: 'Value (e.g. Large)',
              type: 'string',
              validation: Rule => Rule.required().min(1).warning('Attribute Value is required'),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      validation: Rule => Rule.required().min(0).warning('Stock must be 0 or more'),
    }),

    defineField({
      name: 'price',
      title: 'Original Price',
      type: 'number',
      validation: Rule => Rule.required().min(1).warning('Original price must be at least 1'),
    }),

    defineField({
      name: 'discountedPrice',
      title: 'Discounted Price',
      type: 'number',
      validation: Rule =>
        Rule.min(0).warning('Discounted price should not be negative')
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required().warning('Image is required'),
    }),
  ],
  
  // ✅ Preview
  preview: {
    select: {
      price: 'price',
      discountedPrice: 'discountedPrice',
      stock: 'stock',
      image: 'image.asset',
      attributes: 'attributes',
    },
    prepare({ price, discountedPrice, stock, image, attributes }) {
      const attrText = attributes?.map((a: any) => `${a.attributeName}: ${a.attributeValue}`).join(', ') || 'No attributes';
  
      const priceText = discountedPrice
        ? `Rs ${discountedPrice} (↓ from Rs ${price})`
        : `Rs ${price}`;
  
      return {
        title: attrText,
        subtitle: `Price: ${priceText} | Stock: ${stock}`,
        media: image || undefined,
      };
    }
  }
});