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

    // Maximum 25MB file size
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 25MB.' }, { status: 400 });
    }

    // Sanitize category folder name
    const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, '') || 'documents';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', safeCategory);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${Date.now()}_${sanitizedOriginal}`;
    const destinationPath = path.join(uploadsDir, uniqueFileName);

    // Write file buffer to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(destinationPath, buffer);

    // Format human-readable file size
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const fileUrl = `/uploads/${safeCategory}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: formattedSize,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file to server.' }, { status: 500 });
  }
}
