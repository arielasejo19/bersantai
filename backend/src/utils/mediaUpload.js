import multer from 'multer';

export const singleMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 50 * 1024 * 1024 }
}).single('media');