import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const fileUploadPremiumOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/premium',
    filename: (req, file, cb) => {
      cb(null, `${uuidv4().replace(/-/g, '')}${extname(file.originalname)}`);
    },
  }),
};

export const fileUploadCertificateOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/certificate',
    filename: (req, file, cb) => {
      cb(null, `${uuidv4().replace(/-/g, '')}${extname(file.originalname)}`);
    },
  }),
};