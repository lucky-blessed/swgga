import { defineField, defineType } from 'sanity'

export const prayerConnectType = defineType({
  name: 'prayerConnect',
  title: 'Prayer Connect Session',
  type: 'document',
  fields: [
    defineField({ name: 'date', title: 'Session Date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'facebookLiveUrl', title: 'Facebook Live URL', type: 'url',
      description: 'Paste the Facebook Live link before 9PM WAT. This updates the Join Live button on the website.' }),
    defineField({ name: 'whatsappChannelUrl', title: 'WhatsApp Channel URL', type: 'url',
      initialValue: 'https://whatsapp.com/channel/0029VbB8W8k2f3ELvngFmd3W' }),
    defineField({ name: 'topic', title: 'Prayer Topic', type: 'string' }),
    defineField({ name: 'scripture', title: 'Scripture for Tonight', type: 'string' }),
    defineField({ name: 'isLive', title: 'Currently Live', type: 'boolean', initialValue: false }),
    defineField({ name: 'recordingUrl', title: 'Recording URL (after session)', type: 'url' }),
  ],
  preview: {
    select: { title: 'topic', subtitle: 'date' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Prayer Connect Session',
        subtitle: subtitle ? new Date(subtitle).toDateString() : '',
      }
    },
  },
})
