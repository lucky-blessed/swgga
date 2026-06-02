// Testimonials - 3 powerful member quotes
// Dark blue section, gold accents, clean card layout
const testimonials = [
  {
    quote: "Sure Word Glorious Gospel Assembly changed my life completely. The Word preached here is deep, practical, and life-transforming. I have never been the same since I joined this church.",
    name: "Brother Emeka O.",
    role: "Member since 2021",
    initial: "E",
  },
  {
    quote: "Pastor Chii Daily has become part of my morning routine. Every devotional hits exactly what I need for the day. I have grown so much spiritually through this ministry.",
    name: "Sister Ngozi A.",
    role: "Member since 2022",
    initial: "N",
  },
  {
    quote: "Healing Streams gave my marriage a second chance. What we thought was over, God restored completely through the ministry here. We are forever grateful.",
    name: "A Couple",
    role: "Healing Streams, 2023",
    initial: "H",
  },
]

export default function Testimonials() {
  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #040D1A 0%, #0F2460 50%, #040D1A 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,58,138,0.3) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[#B8860B] text-xs font-bold tracking-widest uppercase mb-3">Testimonies</p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white">
            Lives Being Transformed
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Gold quote mark */}
              <div className="text-5xl font-serif text-[#B8860B] opacity-40 leading-none">&ldquo;</div>
              <p className="text-white/70 text-sm leading-relaxed flex-1 -mt-4">{t.quote}</p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#0D1B2A] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #B8860B, #F5C518)' }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
