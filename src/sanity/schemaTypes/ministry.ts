import { defineField, defineType } from 'sanity'

export const ministryType = defineType({
  name: 'ministry',
  title: 'Ministry',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Ministry Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({ name: 'image', title: 'Ministry Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'leader', title: 'Ministry Leader', type: 'string' }),
    defineField({ name: 'meetingSchedule', title: 'Meeting Schedule', type: 'string' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'image' },
  },
})
