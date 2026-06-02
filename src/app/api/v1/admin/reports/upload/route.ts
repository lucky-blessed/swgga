// src/app/api/v1/admin/reports/upload/route.ts
// Upload Excel/PDF attachment for weekly reports via Cloudinary

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true,
})

const ALLOWED_ROLES = ['R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09']
const MAX_SIZE      = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
  'text/csv',                                                            // .csv
  'application/pdf',                                                     // .pdf
]

export async function POST(req: NextRequest) {
  const role   = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only Excel (.xlsx, .xls), CSV, or PDF files are allowed' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File must be smaller than 10MB' },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)
  const filename    = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:          'swgga/reports',
        public_id:       `report_${userId}_${Date.now()}`,
        resource_type:   'raw',
        use_filename:    true,
        unique_filename: true,
        context:         `original_filename=${filename}`,
      },
      (error, result) => {
        if (error || !result) reject(error || new Error('Upload failed'))
        else resolve(result)
      }
    )
    stream.end(buffer)
  })

  // Add fl_attachment to URL so browser downloads with correct filename and format
  const downloadUrl = result.secure_url.replace('/upload/', `/upload/fl_attachment:${filename}/`)

  return NextResponse.json({
    url:         downloadUrl,
    public_id:   result.public_id,
    filename:    filename,
    size:        file.size,
    type:        file.type,
  })
}
