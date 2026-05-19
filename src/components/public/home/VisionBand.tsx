// src/components/public/home/VisionBand.tsx
// Full-width gold-tinted band displaying the church vision statement
// Sits immediately below the hero section as a visual anchor

export default function VisionBand() {
    return (
      // Gold gradient background band
      // py-8 = 32px padding top and bottom
      <section className="bg-gradient-to-r from-[#92650A] via-[#B8860B] to-[#92650A] py-8">
  
        {/* Centered content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  
          {/* Vision statement in Playfair Display italic */}
          <p className="font-[family-name:var(--font-heading)] text-white text-lg sm:text-xl
                        lg:text-2xl italic leading-relaxed">
            &ldquo;Raising a nation of discipled men who are grounded, rooted
            and are living in the Word of God.&rdquo;
          </p>
  
          {/* Attribution */}
          <p className="text-yellow-100 text-sm font-semibold mt-3 tracking-wide">
            — Rev. Chijioke Igbani · Senior Pastor, Sure Word Word Glorious Gospel Assemply
          </p>
  
        </div>
      </section>
    )
  }