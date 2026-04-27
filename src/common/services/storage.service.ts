import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize S3 Client pointing to Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'amanamart-storage';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // e.g. https://pub-xxxx.r2.dev

export const uploadFileToR2 = async (fileBuffer: Buffer, originalName: string, mimeType: string, folder = 'general'): Promise<string> => {
  const ext = path.extname(originalName);
  const fileName = `${folder}/${uuidv4()}${ext}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
      // Optional: CacheControl: 'public, max-age=31536000',
    });

    await r2Client.send(command);

    return `${PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to Cloudflare R2');
  }
};

export const deleteFileFromR2 = async (fileUrl: string) => {
  if (!fileUrl.startsWith(PUBLIC_URL)) return; // Not an R2 file or invalid

  const key = fileUrl.replace(`${PUBLIC_URL}/`, '');

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
  }
};
