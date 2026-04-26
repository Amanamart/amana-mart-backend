import { S3Client } from '@aws-sdk/client-s3';

const r2Endpoint = process.env.R2_ENDPOINT || '';
const r2AccessKey = process.env.R2_ACCESS_KEY_ID || '';
const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY || '';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKey,
    secretAccessKey: r2SecretKey,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'amanamart';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // Public URL for the bucket
