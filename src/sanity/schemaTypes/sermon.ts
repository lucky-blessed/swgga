import { defineField, defineType } from 'sanity'

export const sermonType = defineType({
  name: 'sermon',
  title: 'Sermon',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Sermon Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: r => r.required() }),
    defineField({ name: 'speaker', title: 'Speaker', type: 'string', initialValue: 'Rev. Chijioke Igbani' }),
    defineField({ name: 'scripture', title: 'Scripture Reference', type: 'string' }),
    defineField({ name: 'publishedAt', title: 'Published Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'sermonType', title: 'Type', type: 'string',
      options: { list: ['video', 'audio', 'notes'], layout: 'radio' }, validation: r => r.required() }),
    defineField({ name: 'youtubeUrl', title: 'YouTube URL', type: 'url' }),
    defineField({ name: 'facebookUrl', title: 'Facebook Video URL', type: 'url', description: 'Paste the Facebook video or live replay link here' }),
    defineField({ name: 'audioUrl', title: 'Audio File URL (S3)', type: 'url' }),
    defineField({ name: 'notesUrl', title: 'Notes PDF URL (S3)', type: 'url' }),
    defineField({ name: 'duration', title: 'Duration (e.g. 42 min)', type: 'string' }),
    defineField({ name: 'series', title: 'Series Name', type: 'string' }),
    defineField({ name: 'ministry', title: 'Ministry', type: 'string',
      options: { list: ['General', 'Healing Streams', 'CTY', 'Pastor Chii Daily', 'Youth'] } }),
    defineField({ name: 'downloadEnabled', title: 'Allow Download', type: 'boolean', initialValue: true }),
    defineField({ name: 'thumbnail', title: 'Thumbnail Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'summary', title: 'Short Summary', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'speaker', media: 'thumbnail' },
  },
})
