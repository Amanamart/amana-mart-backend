import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as MediaService from './service';
import { AuthRequest } from '../common/middleware/auth';

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const uploadPath = path.join(process.cwd(), 'uploads', folder);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

    const fileRecord = await MediaService.createFileRecord({
      bucket: 'local', // Indicator for local storage
      path: `${folder || 'general'}/${file.filename}`,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
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
    const filePath = path.join(process.cwd(), 'uploads', fileRecord.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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
