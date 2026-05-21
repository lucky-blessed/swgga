// src/lib/storage/cloudinary.ts
// Cloudinary client for member profile photo uploads
// All member photos are stored in the 'swgga/members' folder
// Photos are automatically optimised and resized for mobile delivery

import { v2 as cloudinary } from 'cloudinary'

// Initialise with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true, // always use HTTPS
})

// Upload a member profile photo
// Returns the secure URL and public ID of the uploaded image
export async function uploadProfilePhoto(
  fileBuffer: Buffer,
  memberId: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    // Upload stream — handles Buffer input directly
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:         'swgga/members',
        public_id:      `member_${memberId}`,
        overwrite:      true,      // replace if photo already exists for this member
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // crop to face
          { quality: 'auto', fetch_format: 'auto' },                   // auto optimise
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'))
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id })
        }
      }
    )
    uploadStream.end(fileBuffer)
  })
}

// Delete a member profile photo by public ID
// Called when a member deletes their account or changes their photo
export async function deleteProfilePhoto(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

// Generate an optimised URL for an existing photo
// Useful for resizing on-the-fly without re-uploading
export function getOptimisedPhotoUrl(publicId: string, width = 200): string {
  return cloudinary.url(publicId, {
    width,
    height: width,
    crop:   'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  })
}
