
/**
 * Optimizes an image URL using Cloudinary's transformation API.
 * In a real app, you would upload to Cloudinary and get a public ID.
 * For this prototype, we'll wrap external URLs or simulate the structure.
 */
export const optimizeImage = (url: string, width = 800) => {
  if (url.includes('cloudinary.com')) {
    // Inject optimization parameters: auto format, auto quality, specific width
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  // If it's a generic placeholder, return as is (but in production use real Cloudinary IDs)
  return url;
};

export const CLOUDINARY_CONFIG = {
  cloudName: 'kazi-retail',
  uploadPreset: 'ml_default'
};
