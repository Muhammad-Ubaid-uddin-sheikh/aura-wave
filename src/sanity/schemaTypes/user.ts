import { ROLES } from '@/constants/auth';
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).error('Name must be at least 2 characters'),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'email' })
          .error('Enter a valid email address'),
    }),
    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      hidden: true, // hide password in Sanity studio
      validation: (Rule) =>
        Rule.required()
          .min(8)
          .error('Password must be at least 8 characters long'),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: ROLES,
        layout: 'dropdown',
      },
      initialValue: 'user',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isVerified',
      title: 'Is Verified',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'verificationToken',
      title: 'Verification Token',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'verificationTokenExpiry',
      title: 'Verification Token Expiry',
      type: 'datetime',
      hidden: true,
    }),
    defineField({
      name: 'resetToken',
      title: 'Reset Token',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'resetTokenExpiry',
      title: 'Reset Token Expiry',
      type: 'datetime',
      hidden: true,
    }),
  ],
});