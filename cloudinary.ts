/**
 * Cloudinary integration for KAZI retail platform.
 * Uses unsigned uploads with an upload preset for browser-side image handling.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'dlng6dqtl',
  uploadPreset: 'eccomerce',
};

/**
 * Uploads an image file directly to Cloudinary from the browser.
 * Returns the secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const { cloudName, uploadPreset } = CLOUDINARY_CONFIG;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'eccomerce');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url as string;
};

/**
 * Optimizes a Cloudinary image URL with transformation parameters.
 */
export const optimizeImage = (url: string, width = 800): string => {
  if (url && url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
};