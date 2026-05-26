// src/app/api/v1/members/photo/route.ts
// Member profile photo upload endpoint
// Accepts a multipart form with an image file
// Uploads to Cloudinary and saves the URL to Supabase

import { NextRequest, NextResponse } from 'next/server'
import { uploadProfilePhoto } from '@/lib/storage/cloudinary'
import { createServiceClient } from '@/lib/supabase/server'

// Max file size — 5MB
const MAX_SIZE = 5 * 1024 * 1024

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('photo') as File | null
    const memberId = formData.get('memberId') as string | null

    // Validate inputs
    if (!file || !memberId) {
      return NextResponse.json(
        { error: 'photo and memberId are required' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image must be smaller than 5MB' },
        { status: 400 }
      )
    }

    // Convert File to Buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary — auto crops to face, optimises for mobile
    const { url, publicId } = await uploadProfilePhoto(buffer, memberId)

    // Save the photo URL to Supabase members table
    const supabase = createServiceClient()
    const { error: dbError } = await supabase
      .from('members')
      .update({ photo_url: url, photo_public_id: publicId })
      .eq('id', memberId)

    if (dbError) {
      console.error('[members/photo] DB error:', dbError)
      return NextResponse.json(
        { error: 'Photo uploaded but failed to save URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, url })

  } catch (error) {
    console.error('[members/photo] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
