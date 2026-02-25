import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

let configured = false;

export const configureCloudinary = (): void => {
    if (configured) return;

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    configured = true;
    logger.info('☁️  Cloudinary configured');
};

export default cloudinary;
