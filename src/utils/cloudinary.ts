/**
  * Cloudinary URL optimizer utility
  * Ensures auto-format, auto-quality, and optional responsive width parameters
  */
export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // Avoid duplicating optimization parameters if already present
  if (url.includes("/f_auto,q_auto")) return url;

  const params = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";

  return url.replace("/upload/", `/upload/${params}/`);
}

export default optimizeCloudinaryUrl;
