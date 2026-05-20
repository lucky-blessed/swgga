'use client'

import ServicesStrip from '@/components/layout/ServicesStrip'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Heart, Copy, Lock, ShieldCheck, Check } from 'lucide-react'
import { useState } from 'react'

const fundTypes = ['Tithe', 'Offering', 'Special Project', 'CTY Outreach', 'Healing Streams']

const bankAccounts = [
  { bank: 'First Bank of Nigeria', accountName: 'Sure Word Glorious Gospel Assembly', accountNumber: '2034514515' },
  { bank: 'Zenith Bank', accountName: 'Sure Word Glorious Gospel Assembly', accountNumber: 'Number coming soon...' },
  { bank: 'GTBank', accountName: 'Sure Word Glorious Gospel Assembly', accountNumber: 'Number coming soon...' },  
]

const ussdCodes = [
  { bank: 'First Bank', code: '*894*amount*AccountNumber#', example: '*894*5000*2034514515#' },
  { bank: 'GTBank', code: '*737*amount*AccountNumber#', example: '*737*5000*...........#' },
  { bank: 'Zenith Bank', code: '*966*amount*AccountNumber#', example: '*966*5000*..........#' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 bg-[#EBF0FA] hover:bg-[#1E3A8A] text-[#1E3A8A] hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors duration-200"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function GivePage() {
  const [selectedFund, setSelectedFund] = useState('Tithe')

  return (
    <main>
      <ServicesStrip />
      <Navbar />

      {/* PAGE HERO */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A] to-[#0D1B2A] py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-white mb-4">
            Give Online
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto mb-6">
            Your generosity fuels the vision! <br></br>Give securely from anywhere in the world
          </p>
          <div className="flex items-center justify-center gap-4 text-white/50 text-xs flex-wrap">
            <span className="flex items-center gap-1.5"><Lock size={12} className="text-green-400" /> SSL Secured</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-400" /> Receipts Issued</span>
            <span>·</span>
            <span className="text-[#F5C518]">NGN · USD · GBP · EUR</span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* FUND TYPE SELECTOR */}
        <div className="mb-8">
          <p className="text-[#1A1A1A] text-sm font-bold mb-3">Give Towards</p>
          <div className="flex flex-wrap gap-2">
            {fundTypes.map((fund) => (
              <button
                key={fund}
                onClick={() => setSelectedFund(fund)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
                  selectedFund === fund
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-[#EBF0FA] hover:text-[#1E3A8A]'
                }`}
              >
                {fund}
              </button>
            ))}
          </div>
        </div>

        {/* SCRIPTURE */}
        <div className="bg-[#EBF0FA] border-l-4 border-[#1E3A8A] rounded-r-2xl p-5 mb-8">
          <p className="font-[family-name:var(--font-heading)] text-[#1E3A8A] text-base italic leading-relaxed">
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
          </p>
          <p className="text-[#374151] text-xs font-bold mt-2">2 Corinthians 9:7</p>
        </div>

        {/* BANK TRANSFER */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1A1A1A] mb-1">
            Bank Transfer
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Transfer directly to any of our church accounts below
          </p>
          <div className="flex flex-col gap-4">
            {bankAccounts.map((account) => (
              <div key={account.bank} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-2">{account.bank}</p>
                <p className="text-[#374151] text-sm font-medium mb-1">{account.accountName}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#1A1A1A] text-lg font-bold tracking-wider">{account.accountNumber}</p>
                  <CopyButton text={account.accountNumber} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* USSD */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1A1A1A] mb-1">
            USSD Mobile Transfer
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            No internet needed — dial from any Nigerian phone
          </p>
          <div className="flex flex-col gap-4">
            {ussdCodes.map((ussd) => (
              <div key={ussd.bank} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[#B8860B] text-xs font-bold uppercase tracking-wider mb-2">{ussd.bank}</p>
                <p className="text-gray-400 text-xs mb-1">Dial format: <span className="font-mono text-[#374151]">{ussd.code}</span></p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[#1A1A1A] text-sm font-bold">{ussd.example}</p>
                  <CopyButton text={ussd.example} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT GATEWAY NOTE */}
        <div className="bg-[#FDF6E3] border border-[rgba(184,134,11,0.3)] rounded-2xl p-5 mb-6 text-center">
          <Heart size={22} className="text-[#B8860B] mx-auto mb-2" />
          <p className="text-[#92650A] text-sm font-bold mb-1">Card Payments Coming Soon</p>
          <p className="text-[#374151] text-xs leading-relaxed">
            We are integrating Paystack and Flutterwave for card, international, and automated recurring giving.
            For now, please use bank transfer or USSD above.
          </p>
        </div>

        {/* TRUST BADGE */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs text-center">
          <Lock size={12} className="text-[#1E3A8A]" />
          <span>All giving is acknowledged with a receipt · Managed by our Treasurer under church oversight</span>
        </div>

      </div>

      <Footer />
    </main>
  )
}
