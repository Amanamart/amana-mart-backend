import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as MediaService from './service';
import sharp from 'sharp';
import { AuthRequest } from '../common/middleware/auth';
import { r2Client, R2_BUCKET_NAME } from '../common/lib/r2';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Multer Memory Storage Configuration (Files are kept in buffer for processing)
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB to allow for high-res source files
});

export const listFiles = async (req: AuthRequest, res: Response) => {
  try {
    const { mimeType, sourceModule, folder, search, page, limit } = req.query;
    const result = await MediaService.listFiles({
      mimeType: mimeType as string,
      sourceModule: sourceModule as string,
      folder: folder as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const {
      sourceModule, linkedEntityType, linkedEntityId, visibility, folder,
    } = req.body;

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let fileName = uniqueSuffix + path.extname(file.originalname);
    let mimeType = file.mimetype;
    let buffer = file.buffer;
    let size = file.size;

    // Optimization: If it's an image, process it with Sharp
    if (file.mimetype.startsWith('image/')) {
      const optimized = await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Max width 1200px
        .webp({ quality: 80 }) // Convert to webp with 80% quality
        .toBuffer({ resolveWithObject: true });
      
      buffer = optimized.data;
      size = optimized.info.size;
      fileName = uniqueSuffix + '.webp';
      mimeType = 'image/webp';
    }

    // Determine bucket (R2 or local)
    const useR2 = process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID;
    let storagePath = `${folder || 'general'}/${fileName}`;

    if (useR2) {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: storagePath,
          Body: buffer,
          ContentType: mimeType,
        })
      );
    } else {
      // Save the file locally as fallback
      const uploadPath = path.join(process.cwd(), 'uploads', folder || 'general');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const finalPath = path.join(uploadPath, fileName);
      fs.writeFileSync(finalPath, buffer);
    }

    const fileRecord = await MediaService.createFileRecord({
      bucket: useR2 ? 'r2' : 'local',
      path: storagePath,
      fileName,
      originalName: file.originalname,
      mimeType,
      size,
      uploadedBy: req.user!.id,
      uploadedByRole: req.user!.role,
      sourceModule,
      linkedEntityType,
      linkedEntityId,
      visibility: visibility || 'public',
      folder: folder || 'general',
    });

    res.status(201).json(fileRecord);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const fileRecord = await MediaService.getFileById(req.params.id as string);
    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    if (fileRecord.bucket === 'r2') {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: fileRecord.path,
        })
      );
    } else {
      const filePath = path.join(process.cwd(), 'uploads', fileRecord.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await MediaService.deleteFile(req.params.id as string);
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMediaStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await MediaService.getMediaStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
