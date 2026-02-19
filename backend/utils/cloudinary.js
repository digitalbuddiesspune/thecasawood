import { v2 as cloudinary } from 'cloudinary';

// Support both CLOUDINARY_* and Cloudinary_* env names
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.Cloudinary_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.Cloudinary_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.Cloudinary_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export default cloudinary;
export const isConfigured = Boolean(cloudName && apiKey && apiSecret);
