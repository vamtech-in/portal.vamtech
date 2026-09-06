import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'documents';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Maximum 5MB limit for serverless upload compatibility
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 5MB for cloud processing.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Format human-readable file size
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const mimeType = file.type || 'application/pdf';
    let fileUrl = '';

    // Check if running on serverless cloud (Vercel / Lambda) where public filesystem is read-only
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

    if (!isServerless) {
      try {
        // Sanitize category folder name
        const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, '') || 'documents';
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeCategory);
        await fs.promises.mkdir(uploadsDir, { recursive: true });

        // Generate safe unique filename
        const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueFileName = `${Date.now()}_${sanitizedOriginal}`;
        const destinationPath = path.join(uploadsDir, uniqueFileName);

        await fs.promises.writeFile(destinationPath, buffer);
        fileUrl = `/uploads/${safeCategory}/${uniqueFileName}`;
      } catch (fsErr: any) {
        console.warn('Filesystem write not available, switching to direct Data URL storage:', fsErr?.message);
      }
    }

    // Resilient Cloud Fallback: Convert to Base64 Data URL stored directly in MongoDB
    if (!fileUrl) {
      const base64Data = buffer.toString('base64');
      fileUrl = `data:${mimeType};base64,${base64Data}`;
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: formattedSize,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process file upload.' },
      { status: 500 }
    );
  }
}
