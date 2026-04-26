import { Request, Response, NextFunction } from 'express';

export const languageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Check custom header x-lang
  // 2. Check Accept-Language header
  // 3. Default to 'en'
  
  const customLang = req.headers['x-lang'] as string;
  const acceptLang = req.headers['accept-language']?.split(',')[0].split('-')[0];
  
  const lang = (customLang === 'bn' || acceptLang === 'bn') ? 'bn' : 'en';
  
  // Attach to request object for use in controllers
  (req as any).lang = lang;
  
  next();
};
