// src/app/layout.tsx
import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

// Heading font - Playfair Display for all H1 and H2 elements
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// Body font - Lato for all body text, buttons, and UI elements
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sure Word Glorious Gospel Assembly',
  description: 'Raising a nation of discipled men who are grounded, rooted and are living in the Word of God.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" theme="dark" />
</body>
    </html>
  )
}