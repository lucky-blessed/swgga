import { defineField, defineType } from 'sanity'

export const devotionalType = defineType({
  name: 'devotional',
  title: 'Daily Devotional',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Devotional Title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'episodeNumber', title: 'Episode Number', type: 'number', validation: r => r.required() }),
    defineField({ name: 'publishedAt', title: 'Publish Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'scripture', title: 'Scripture Reference (e.g. John 3:16)', type: 'string', validation: r => r.required() }),
    defineField({ name: 'scriptureText', title: 'Scripture Text', type: 'text', rows: 4, validation: r => r.required() }),
    defineField({ name: 'body', title: 'Devotional Body', type: 'array',
      of: [{ type: 'block' }], validation: r => r.required() }),
    defineField({ name: 'audioUrl', title: 'Audio URL (S3)', type: 'url' }),
    defineField({ name: 'youtubeUrl', title: 'YouTube Video URL', type: 'url' }),
    defineField({ name: 'podcastUrl', title: 'Podcast Episode URL', type: 'url' }),
    defineField({ name: 'prayerPoint', title: 'Prayer Point', type: 'text', rows: 3 }),
    defineField({ name: 'declaration', title: 'Declaration / Confession', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? new Date(subtitle).toDateString() : '' }
    },
  },
})
