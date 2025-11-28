import { defineField, defineType } from 'sanity';

// ✅ Helper: Validate required when hasVariants is false
const requiredIfNoVariants = (fieldName: string) => {
  return (Rule: any) =>
    Rule.custom((value: any, context: any) => {
      const hasVariants = context?.parent?.hasVariants;
      if (hasVariants === false && !value) {
        return `${fieldName} is required`;
      }
      return true;
    });
};

export default defineType({
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: 'slug',
      title: 'Slug/URL (Auto from Title)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'hasVariants',
      title: 'Has Variants?',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: "baseImages",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { sortable: true },
      validation: (Rule) => Rule.required().min(1).max(10).warning("At least one image is required and a maximum of 10 images are allowed."),
    }),

    defineField({
      name: "baseVideo",
      title: "Product Video (Optional)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
    }),

    defineField({
      name: 'specification',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'tags',
              title: 'Tags',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image'
            }
          }
        }
      ],
      options: {
        sortable: true
      }
    }),

    // 🔸 Base product info (if no variants)
    defineField({
      name: 'baseOriginalPrice',
      title: 'Original Price',
      type: 'number',
      hidden: ({ parent }) => parent?.hasVariants === true,
      validation: requiredIfNoVariants('Original Price'),
    }),
    defineField({
      name: 'baseDiscountedPrice',
      title: 'Discounted Price',
      type: 'number',
      hidden: ({ parent }) => parent?.hasVariants === true,
      validation: Rule =>
        Rule.min(0).warning('Discounted price should not be negative')
    }),
    defineField({
      name: 'baseStock',
      title: 'Stock Quantity',
      type: 'number',
      hidden: ({ parent }) => parent?.hasVariants === true,
      validation: requiredIfNoVariants('Stock Quantity'),
    }),

    // 🔸 Variants (if hasVariants is true)
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [{ type: 'variant' }],
      hidden: ({ parent }) => parent?.hasVariants === false,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if ((context?.parent as any)?.hasVariants === true && (!value || value.length === 0)) {
            return 'At least one variant is required';
          }
          return true;
        }),
    }),

    // 🔸 Common Fields
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(1).max(3),
    }),
    defineField({
      name: 'brand',
      title: 'Brand Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'isNewArrival', title: 'Is New Arrival?', type: 'boolean' }),
    defineField({ name: 'isFeatured', title: 'Is Featured?', type: 'boolean' }),
    defineField({ name: 'isBestSelling', title: 'Is Best Selling?', type: 'boolean' }),
    defineField({
      name: 'averageRating',
      title: 'Average Rating (1 to 5)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({ name: 'totalReviewsCount', title: 'Total Reviews Count', type: 'number' }),
  ],

  // ✅ Preview
  preview: {
    select: {
      title: 'title',
      collection: 'collection.title',
      hasVariants: 'hasVariants',
      basePrice: 'baseOriginalPrice',
      baseDiscounted: 'baseDiscountedPrice',
      variantPrice: 'variants.0.price',
      variantDiscounted: 'variants.0.discountedPrice',
      baseImage: 'baseImages.0.asset',
      variantMedia: 'variants.0.image.asset',
    },
    prepare({
      title,
      collection,
      hasVariants,
      basePrice,
      baseDiscounted,
      variantPrice,
      variantDiscounted,
      baseImage,
      variantMedia,
    }) {
      const isVariants = hasVariants;
      const price = isVariants ? variantPrice : basePrice;
      const discounted = isVariants ? variantDiscounted : baseDiscounted;
      const media = baseImage ? baseImage : variantMedia;

      const priceInfo = discounted
        ? `Rs ${discounted} (↓ from Rs ${price})`
        : `Rs ${price ?? 'N/A'}`;

      return {
        title: title || 'Untitled Product',
        subtitle: `${isVariants ? '🧩 Variant-Based' : '🔹 Single Item'} | Collection: ${collection || 'N/A'} | Price: ${priceInfo}`,
        media: media || undefined, // Fallback handled
      };
    },
  },

});