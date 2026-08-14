import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Event Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'date', title: 'Event Start Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'endDate', title: 'Event End Date', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'theme', title: 'Event Theme', type: 'string',
      description: 'e.g. "Fruitfulness to Dominion"' }),
    defineField({ name: 'sessionTimes', title: 'Session Times', type: 'string',
      description: 'e.g. "Thursday 4:00 PM · Fri–Sat 8:00 AM & 4:00 PM"' }),
    defineField({ name: 'location', title: 'Location', type: 'string',
      initialValue: 'Sure Word Glorious Gospel Assembly, Warri' }),
    defineField({ name: 'ministry', title: 'Ministry / Tag', type: 'string',
      options: { list: ['Service', 'Youth Ministry', 'Healing Streams', 'CTY', 'Special Events', 'Impact Fellowship'] } }),
    defineField({ name: 'registrationEnabled', title: 'Registration Required', type: 'boolean', initialValue: false }),
    defineField({ name: 'featured', title: 'Featured Event (Homepage Spotlight)', type: 'boolean', initialValue: false,
      description: 'Only one event should be featured at a time. This appears on the homepage.' }),
    defineField({ name: 'image', title: 'Event Flyer / Main Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'speakers',
      title: 'Speakers',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string' }),
          defineField({ name: 'role', title: 'Role', type: 'string',
            description: 'e.g. "Host", "Guest Speaker", "Guest Minister"' }),
        ],
        preview: { select: { title: 'name', subtitle: 'role' } }
      }]
    }),
    defineField({
      name: 'eventPhotos',
      title: 'Event Photos',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Photos from the event — shown in the scrolling photo strip on the homepage.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? new Date(subtitle).toDateString() : '' }
    },
  },
})
