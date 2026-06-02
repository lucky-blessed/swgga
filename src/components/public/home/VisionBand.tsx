// VisionBand - elevated gold vision statement strip
// Shimmer animation, better quote styling, pastor attribution
export default function VisionBand() {
  return (
    <section
      className="relative py-10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #7A5408 0%, #B8860B 30%, #F5C518 50%, #B8860B 70%, #92650A 100%)' }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
          animation: 'shimmer 4s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-[#7A5408] text-4xl font-serif leading-none mb-2 opacity-60">&ldquo;</div>
        <p className="font-[family-name:var(--font-heading)] text-[#0D1B2A] text-lg sm:text-xl font-bold leading-relaxed italic">
          Raising a nation of discipled men who are grounded, rooted and are living in the Word of God.
        </p>
        <p className="text-[#0D1B2A]/60 text-sm font-semibold mt-3">
          - Rev. Chijioke Igbani · Senior Pastor, Sure Word Glorious Gospel Assembly
        </p>
      </div>
    </section>
  )
}
