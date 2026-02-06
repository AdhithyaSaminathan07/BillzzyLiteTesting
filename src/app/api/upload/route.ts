

import { NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  // Check for missing environment variables
  const missingVars = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missingVars.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missingVars.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missingVars.push('CLOUDINARY_API_SECRET');

  if (missingVars.length > 0) {
    console.error(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`);
    return NextResponse.json({
      success: false,
      error: `Missing setup: ${missingVars.join(', ')}. Please check your .env.local file.`
    }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "billzzy-inventory",
          // 👇 NEW SETTINGS TO FORCE SMALLER SIZE 👇
          transformation: [
            { width: 800, crop: "limit" }, // Resize: Never wider than 800px
            { quality: "auto:eco" },       // Quality: "Economical" (smaller file size)
            { fetch_format: "auto" }       // Format: Use WebP/AVIF if possible
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error("Upload failed: No result returned"));
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed." }, { status: 500 });
  }
}