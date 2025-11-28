import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'collection',
  type: 'document',
  title: 'Collection',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Collection Title',
      validation: Rule => Rule.required().min(2).max(50).warning('Title is required and must be between 2 and 50 characters'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Collection Slug/URL',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required().warning('Slug/URL is required'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Collection Description (optional)',
      description: 'You can provide a short description for this Collection.',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Collection Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required().error('Collection Image is required'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
});