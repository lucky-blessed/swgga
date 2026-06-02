import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Event Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'date', title: 'Event Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'location', title: 'Location', type: 'string', initialValue: 'Sure Word Glorious Gospel Assembly, Warri' }),
    defineField({ name: 'ministry', title: 'Ministry / Tag', type: 'string',
      options: { list: ['Service', 'Youth Ministry', 'Healing Streams', 'CTY', 'Special Events', 'Impact Fellowship'] } }),
    defineField({ name: 'registrationEnabled', title: 'Registration Required', type: 'boolean', initialValue: false }),
    defineField({ name: 'featured', title: 'Featured Event', type: 'boolean', initialValue: false }),
    defineField({ name: 'image', title: 'Event Image', type: 'image', options: { hotspot: true } }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? new Date(subtitle).toDateString() : '' }
    },
  },
})
