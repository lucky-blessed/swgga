import { defineField, defineType } from 'sanity'

export const GALLERY_CATEGORIES = [
  { title: 'Church History',    value: 'history'         },
  { title: 'Sunday Service',    value: 'sunday_service'  },
  { title: 'Word Feast',        value: 'word_feast'      },
  { title: 'Youth and CTY',     value: 'youth_cty'       },
  { title: 'Healing Streams',   value: 'healing_streams' },
  { title: 'Outreach',          value: 'outreach'        },
  { title: 'Conference',        value: 'conference'      },
  { title: 'Choir and Worship', value: 'choir_worship'   },
  { title: 'Special Event',     value: 'special_event'   },
]

export const galleryPhotoType = defineType({
  name: 'galleryPhoto',
  title: 'Gallery Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Caption / Event Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the photo for accessibility and SEO.',
          validation: Rule => Rule.required(),
        }),
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: GALLERY_CATEGORIES,
        layout: 'dropdown',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Keywords for search: e.g. "Pastor Chii", "2023", "baptism"',
    }),
    defineField({
      name: 'date',
      title: 'Date Taken',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
    }),
    defineField({
      name: 'featured',
      title: 'Featured Photo',
      type: 'boolean',
      description: 'Featured photos appear at the top of the gallery.',
      initialValue: false,
    }),
    defineField({
      name: 'story',
      title: 'Story Group',
      type: 'reference',
      to: [{ type: 'galleryStory' }],
      description: 'Optional: group this photo under a named story.',
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Oldest First',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [{ field: 'featured', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title:    'title',
      subtitle: 'category',
      media:    'image',
    },
  },
})