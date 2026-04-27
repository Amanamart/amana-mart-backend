import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

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
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
const USE_R2 = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_ENDPOINT);

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadFile = async (fileBuffer: Buffer, originalName: string, mimeType: string, folder = 'general'): Promise<string> => {
  const ext = path.extname(originalName);
  const fileName = `${folder}/${uuidv4()}${ext}`;

  if (USE_R2) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
      });
      await r2Client.send(command);
      return `${PUBLIC_URL}/${fileName}`;
    } catch (error) {
      console.error('Error uploading to R2, falling back to local:', error);
    }
  }

  // Local storage fallback
  const localPath = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath, { recursive: true });
  }

  const filePath = path.join(localPath, `${uuidv4()}${ext}`);
  fs.writeFileSync(filePath, fileBuffer);
  
  // Return relative URL for the app
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  return `/${relativePath}`;
};

export const deleteFile = async (fileUrl: string) => {
  if (USE_R2 && fileUrl.startsWith(PUBLIC_URL)) {
    const key = fileUrl.replace(`${PUBLIC_URL}/`, '');
    try {
      await r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
      return;
    } catch (error) {
      console.error('Error deleting from R2:', error);
    }
  }

  // Local deletion
  const filePath = path.join(process.cwd(), fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
