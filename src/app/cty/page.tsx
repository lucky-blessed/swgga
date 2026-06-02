import ServicesStrip from '@/components/layout/ServicesStrip'
import CTYNavbar from '@/components/layout/CTYNavbar'
import CTYFooter from '@/components/layout/CTYFooter'
import { BookOpen, Briefcase, Globe, Heart, Users, Flame, MapPin, Star, Tent, Network } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { value: '400+', label: 'Youth Reached' },
  { value: '5+',  label: 'Chapters' },
  { value: '3+',   label: 'States' },
  { value: '50+',   label: 'Volunteers' },
]

const missions = [
  'To win the young people at a very early stage in life for the Lord Jesus.',
  'To nurture and train the young people in the Word of God and basic morality.',
  'To instil in the minds of the young that God loves them and that He has a purpose for them.',
  'To educate young people on the basic rudiments of life - Relationship, Character, and Career - so as to prevent them from following error.',
  'To see that no young person makes a costly mistake that can haunt them for life, and to give hope to as many as have fallen victims.',
  'To offer counsel to young people at any time as the need arises.',
  'Encouraging young people to do better in every field of human endeavour by developing their gifts and talents.',
  'Making youth ministers out of these young ones.',
]

const programmes = [
  { icon: BookOpen,  title: 'Gospel Clubs',          desc: 'Weekly after-school clubs in primary and secondary schools across Warri. Bible stories, games, prayer, and the gospel shared simply and powerfully.', freq: 'Weekly' },
  { icon: Briefcase, title: 'Skills Training',        desc: 'Practical life skills workshops: financial literacy, entrepreneurship, CV writing, and digital skills for ages 16 to 25. Always free to attend.', freq: 'Monthly' },
  { icon: Globe,     title: 'Community Outreaches',   desc: 'Outreaches into underserved communities across Delta State and beyond - food, clothing, and the gospel shared boldly and compassionately.', freq: 'Quarterly' },
  { icon: Tent,      title: 'Annual Camp Meeting',    desc: 'Held every August - a powerful gathering of CTY chapters across Nigeria for worship, the Word, discipleship, and community. A highlight of the CTY calendar.', freq: 'Every August' },
]

const chapters = [
  { location: 'Japka Road, Warri / Effurun', state: 'Delta State', note: 'Headquarters Chapter', hq: true },
  { location: 'Orerokpe',                    state: 'Delta State', note: '', hq: false },
  { location: 'Oha',                         state: 'Delta State', note: '', hq: false },
  { location: 'UniPort Chapter',             state: 'Rivers State', note: 'University of Port Harcourt', hq: false },
  { location: 'Bori',                        state: 'Rivers State', note: '', hq: false },
  { location: 'Rivers State',               state: 'Rivers State', note: '3+ chapters', hq: false },
  { location: 'Benue State',                state: 'Benue State',  note: 'Chapter active', hq: false },
]

export default function CTYPage() {
  return (
    <main>
      <ServicesStrip />

      {/* CTY NAVBAR */}
      <nav className="bg-[#0D3320] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4ADE80] flex items-center justify-center">
                <span className="text-[#166534] font-black text-xs">CTY</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Catch Them Young</p>
                <p className="text-green-400/60 text-xs">Outreach Ministry · Sure Word Glorious Gospel Assembly</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="#vision"       className="text-white/70 hover:text-white text-sm transition-colors">Vision</Link>
              <Link href="#programmes"   className="text-white/70 hover:text-white text-sm transition-colors">Programmes</Link>
              <Link href="#chapters"     className="text-white/70 hover:text-white text-sm transition-colors">Chapters</Link>
              <Link href="#get-involved" className="text-white/70 hover:text-white text-sm transition-colors">Get Involved</Link>
              <Link href="/" className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors">← Sure Word Glorious Gospel Assembly</Link>
            </div>
            <Link href="#get-involved" className="bg-[#4ADE80] hover:bg-[#22C55E] text-[#166534] text-sm font-bold px-4 py-2 rounded-full transition-colors">
              Get Involved
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0D3320] via-[#166534] to-[#0D3320] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.3)] text-[#4ADE80] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Flame size={12} /> Non-Denominational Youth Ministry
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-[#4ADE80]">Catching</span> the<br />Next Generation<br />for God and for Good
            </h1>
            <p className="text-green-100/70 text-lg leading-relaxed mb-4 max-w-xl">
              CTY is a non-denominational outreach ministry committed to reaching young people across Nigeria with the gospel, practical life skills, and a community that genuinely cares.
            </p>
            <p className="text-[#4ADE80] font-black text-lg tracking-widest mb-8">NOTHING CAN STOP US</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="#get-involved" className="bg-[#4ADE80] hover:bg-[#22C55E] text-[#166534] font-bold px-8 py-4 rounded-full text-center transition-colors shadow-lg">
                Join an Outreach
              </Link>
              <Link href="#programmes" className="border-2 border-white/30 hover:border-white text-white font-bold px-8 py-4 rounded-full text-center transition-colors">
                Our Programs
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#4ADE80] mb-1">{stat.value}</div>
                  <div className="text-green-100/60 text-xs font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section
        className="py-20 lg:py-28 relative overflow-hidden"
        style={{background: "linear-gradient(135deg, #bfcfb8 0%, #d4e0ce 30%, #e8f0e4 55%, #f4f7f2 75%, #ffffff 100%)"}}
      >
        {/* Atmospheric radial glow behind subject */}
        <div className="absolute inset-0 pointer-events-none" style={{background: "radial-gradient(ellipse 55% 70% at 25% 50%, rgba(180,210,170,0.5) 0%, rgba(180,210,170,0.2) 40%, transparent 70%)"}} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-[#166534] text-xs font-bold tracking-widest uppercase mb-2">National Coordinating Pastor</p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-10">Leading the Vision</h2>

          <div className="flex flex-col lg:flex-row items-center">

            {/* Portrait - cinematic blend, no hard edges */}
            <div className="w-full lg:w-2/5 relative flex-shrink-0" style={{minHeight: "420px", height: "420px"}}>

              <img
                src="/images/pastor-victory.png"
                alt="Pastor Victory Uba"
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{
                  maskImage: "radial-gradient(ellipse 85% 80% at 45% 45%, black 20%, rgba(0,0,0,0.97) 35%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 80%, transparent 92%)",
                  WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 45% 45%, black 20%, rgba(0,0,0,0.97) 35%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 80%, transparent 92%)",
                  filter: "brightness(1.03) contrast(1.02) saturate(0.98)",
                }}
              />
              <div className="absolute inset-0 pointer-events-none" style={{background: "linear-gradient(135deg, rgba(196,216,188,0.7) 0%, rgba(196,216,188,0.3) 20%, transparent 45%)"}} />
              <div className="absolute inset-0 pointer-events-none" style={{background: "linear-gradient(to top, rgba(212,224,206,0.85) 0%, rgba(212,224,206,0.4) 18%, transparent 38%)"}} />
              <div className="absolute inset-0 pointer-events-none" style={{background: "linear-gradient(to right, transparent 40%, rgba(212,224,206,0.3) 65%, rgba(212,224,206,0.7) 80%, rgba(220,232,216,0.95) 95%, rgba(228,238,224,1) 100%)"}} />
              <div className="absolute inset-0 pointer-events-none" style={{background: "linear-gradient(to right, rgba(196,216,188,0.6) 0%, rgba(196,216,188,0.2) 12%, transparent 28%)"}} />
            </div>

            {/* Info */}
            <div className="flex-1 p-6 sm:p-8 lg:pl-2 flex flex-col justify-center">
              <div className="w-10 h-1 bg-[#166534] rounded-full mb-5" />
              <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-1">Pastor Victory Uba</h3>
              <p className="text-[#166534] font-semibold text-sm tracking-wide mb-6">National Coordinating Pastor · Catch Them Young</p>
              <p className="text-[#374151] text-base leading-relaxed mb-8">Pastor Victory Uba serves as the National Coordinating Pastor of Catch Them Young Outreach Ministry, overseeing all chapters across Nigeria and guiding the ministry in its mission to reach the next generation for God and for good. Under his coordination, CTY has expanded its reach across Delta State, Rivers State, Benue State, and beyond - touching hundreds of young lives through the gospel, skills training, and community outreach.</p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-[#166534]/10 border border-[#166534]/20 text-[#166534] text-xs font-bold px-3 py-1.5 rounded-full">Delta State Chapters</div>
                <div className="bg-[#166534]/10 border border-[#166534]/20 text-[#166534] text-xs font-bold px-3 py-1.5 rounded-full">Rivers State Chapters</div>
                <div className="bg-[#166534]/10 border border-[#166534]/20 text-[#166534] text-xs font-bold px-3 py-1.5 rounded-full">Benue State Chapters</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section id="vision" className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-[#4ADE80] rounded-full" />
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Vision, Mandate & Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

            {/* Vision */}
            <div className="bg-white rounded-2xl p-6 border-l-4 border-[#4ADE80] shadow-sm">
              <p className="text-[#166534] text-xs font-bold uppercase tracking-widest mb-3">Our Vision</p>
              <p className="font-[family-name:var(--font-heading)] text-lg text-[#1A1A1A] leading-relaxed">
                Helping the young ones to know the Lord Jesus and to build a great destiny.
              </p>
            </div>

            {/* Mandate */}
            <div className="bg-white rounded-2xl p-6 border-l-4 border-[#166534] shadow-sm">
              <p className="text-[#166534] text-xs font-bold uppercase tracking-widest mb-3">Our Mandate</p>
              <p className="font-[family-name:var(--font-heading)] text-lg text-[#1A1A1A] leading-relaxed">
                Raising an end-time youth army for the Lord Jesus that will move into the enemy&apos;s camp, take what belongs to them, and set free every captive - especially fellow youth.
              </p>
            </div>

          </div>

          {/* Mission points */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <p className="text-[#166534] text-xs font-bold uppercase tracking-widest mb-5">Our Mission</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {missions.map((mission, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#166534] text-xs font-black">{i + 1}</span>
                  </div>
                  <p className="text-[#374151] text-sm leading-relaxed">{mission}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* PROGRAMMES */}
      <section id="programmes" className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1 h-8 bg-[#4ADE80] rounded-full" />
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Our Programs
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programmes.map((prog) => {
              const Icon = prog.icon
              return (
                <div key={prog.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:border-[#4ADE80] transition-all duration-200">
                  <div className="w-11 h-11 bg-[#DCFCE7] rounded-xl flex items-center justify-center mb-4">
                    <Icon size={22} className="text-[#166534]" />
                  </div>
                  <div className="inline-block bg-[#DCFCE7] text-[#166534] text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                    {prog.freq}
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1A1A1A] mb-3">
                    {prog.title}
                  </h3>
                  <p className="text-[#374151] text-sm leading-relaxed">{prog.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section id="chapters" className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#4ADE80] rounded-full" />
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              CTY Chapters
            </h2>
          </div>
          <p className="text-gray-400 text-base mb-10">Active chapters across Nigeria - and growing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter) => (
              <div key={chapter.location} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 ${chapter.hq ? 'bg-[#0D3320] border-[#4ADE80]' : 'bg-white border-gray-100 hover:border-[#4ADE80]'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${chapter.hq ? 'bg-[#4ADE80]' : 'bg-[#DCFCE7]'}`}>
                  <MapPin size={18} className={chapter.hq ? 'text-[#166534]' : 'text-[#166534]'} />
                </div>
                <div>
                  <p className={`font-bold text-sm mb-0.5 ${chapter.hq ? 'text-white' : 'text-[#1A1A1A]'}`}>{chapter.location}</p>
                  <p className={`text-xs mb-1 ${chapter.hq ? 'text-green-400/70' : 'text-gray-400'}`}>{chapter.state}</p>
                  {chapter.hq && <span className="inline-block bg-[#4ADE80] text-[#166534] text-xs font-black px-2 py-0.5 rounded-full">Headquarters</span>}
                  {chapter.note && !chapter.hq && <span className="text-gray-400 text-xs">{chapter.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL SENIOR FRIENDS */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0D3320] to-[#166534] rounded-3xl p-8 sm:p-10">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 bg-[#4ADE80] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Network size={26} className="text-[#166534]" />
              </div>
              <div>
                <p className="text-[#4ADE80] text-xs font-bold uppercase tracking-widest mb-1">Alumni Network</p>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white">
                  Global Senior Friends & Partners Ministry
                </h3>
              </div>
            </div>
            <p className="text-green-100/70 text-base leading-relaxed mb-6 max-w-3xl">
              The Global Senior Friends and Partners Ministry is the alumni network of Catch Them Young - comprising former CTY members who have grown in faith and impact. Many are now pastors and founders of different ministries. Others are making a difference in various walks of life - business, education, medicine, law, technology, and the arts. They remain connected to CTY as mentors, partners, and ambassadors of the vision.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 text-green-100/80 text-xs font-semibold px-4 py-2 rounded-full">Pastors & Ministry Founders</div>
              <div className="bg-white/10 text-green-100/80 text-xs font-semibold px-4 py-2 rounded-full">Business Leaders</div>
              <div className="bg-white/10 text-green-100/80 text-xs font-semibold px-4 py-2 rounded-full">Educators</div>
              <div className="bg-white/10 text-green-100/80 text-xs font-semibold px-4 py-2 rounded-full">Professionals</div>
              <div className="bg-white/10 text-green-100/80 text-xs font-semibold px-4 py-2 rounded-full">Global Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* GET INVOLVED */}
      <section id="get-involved" className="bg-gradient-to-br from-[#0D3320] to-[#166534] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-white mb-4">
                Get Involved with CTY
              </h2>
              <p className="text-green-100/70 text-base leading-relaxed mb-8">
                Whether you want to volunteer, partner, or support, there is a place for you in CTY. Every hand, every gift, and every prayer makes a difference in the lives of young people across Nigeria.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Users, label: 'Volunteer at an outreach or programme' },
                  { icon: Heart, label: 'Give financially to support CTY\'s work' },
                  { icon: Globe, label: 'Partner as an organisation or school' },
                  { icon: Star,  label: 'Join the Global Senior Friends network' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-green-100/80 text-sm">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#4ADE80]" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1A1A1A] mb-5">
                Express Your Interest
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Your Name</label>
                  <input type="text" placeholder="Your full name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#166534] transition-colors" />
                </div>
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">Phone Number</label>
                  <input type="tel" placeholder="+234..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#166634] transition-colors" />
                </div>
                <div>
                  <label className="text-[#374151] text-xs font-bold uppercase tracking-wider block mb-1.5">How Would You Like to Help?</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#166534] bg-white text-gray-600">
                    <option value="">Select an option</option>
                    <option>Volunteer at outreaches</option>
                    <option>Financial support</option>
                    <option>Skills facilitation</option>
                    <option>School or organisation partnership</option>
                    <option>Join Global Senior Friends</option>
                    <option>Prayer support</option>
                  </select>
                </div>
                <button className="bg-[#166534] hover:bg-[#0D3320] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 text-sm">
                  Send My Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GIVE TO CTY */}
      <section className="bg-[#0D3320] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white mb-1">Support CTY&apos;s Work</h3>
            <p className="text-green-100/60 text-sm">Your gift reaches young people who need the gospel most. Every naira makes a difference.</p>
          </div>
          <Link href="/give" className="flex items-center gap-2 bg-[#4ADE80] hover:bg-[#22C55E] text-[#166534] font-bold px-6 py-3 rounded-full transition-colors flex-shrink-0 shadow-lg">
            <Heart size={16} /> Give to CTY
          </Link>
        </div>
      </section>

      <CTYFooter />
    </main>
  )
}
