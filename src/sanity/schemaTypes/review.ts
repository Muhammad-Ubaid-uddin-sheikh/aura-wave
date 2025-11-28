import { defineType, defineField } from "sanity";

export default defineType({
  name: 'review',
  type: 'document',
  title: 'Review',
  fields: [
    defineField({
      name: 'reviewerName',
      type: 'string',
      title: 'Name',
      validation: Rule => Rule.required().min(2).max(50)
    }),
    defineField({
      name: 'reviewerEmail',
      type: 'string',
      title: 'Email',
      validation: Rule => Rule.required().email(),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'Rating',
      validation: Rule => Rule.required().min(1).max(5)
    }),
    defineField({
      name: 'comment',
      type: 'text',
      title: 'Review Comment',
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'product',
      type: 'reference',
      title: 'Product',
      to: [{ type: 'product' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'approved',
      type: 'boolean',
      title: 'Approved',
      initialValue: false,
    }),
    defineField({
      name: 'reviewImages',
      type: 'array',
      title: 'Review Images',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { sortable: true },
      validation: Rule => Rule.max(5).warning('You can upload up to 5 images only')
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: Rule => Rule.required()
    })
  ],

  preview: {
    select: {
      title: 'reviewerName',
      rating: 'rating',
      productTitle: 'product.title',
      media: 'reviewImages.0.asset',
    },
    prepare({ title, rating, productTitle, media }) {
      const stars = '⭐'.repeat(rating || 0) + '☆'.repeat(5 - (rating || 0));
      return {
        title: title || 'Unnamed Reviewer',
        subtitle: `Rating: ${stars} | Product: ${productTitle || 'N/A'}`,
        media,
      };
    }
  }
});