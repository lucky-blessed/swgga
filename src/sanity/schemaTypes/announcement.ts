import { defineField, defineType } from 'sanity'

export const announcementType = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Announcement Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'body', title: 'Message', type: 'text', rows: 5, validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: 'Publish Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'expiresAt', title: 'Expiry Date', type: 'datetime' }),
    defineField({ name: 'audience', title: 'Target Audience', type: 'string',
      options: { list: ['Everyone', 'Members Only', 'Admin Only', 'Youth', 'Women', 'CTY'] },
      initialValue: 'Everyone' }),
    defineField({ name: 'sendSMS', title: 'Send via SMS', type: 'boolean', initialValue: false }),
    defineField({ name: 'sendEmail', title: 'Send via Email', type: 'boolean', initialValue: false }),
    defineField({ name: 'urgent', title: 'Mark as Urgent', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'audience' },
  },
})
