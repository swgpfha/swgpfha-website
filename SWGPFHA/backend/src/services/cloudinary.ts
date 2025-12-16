import { v2 as cloudinary } from "cloudinary";
import { env } from "../env.js";

const enabled =
  !!env.CLOUDINARY_CLOUD_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET;

if (enabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const cloudinaryEnabled = enabled;

export async function uploadToCloudinary(
  filepath: string,
  resourceType: "image" | "video" | "raw"
) {
  if (!enabled) return null;

  const res = await cloudinary.uploader.upload(filepath, {
    resource_type: resourceType,
    folder: "swgpfha/media",
  });

  const thumb = cloudinary.url(res.public_id, {
    resource_type: resourceType,
    transformation: [{ width: 800, height: 450, crop: "fill", gravity: "auto" }],
    secure: true,
  });

  return {
    url: res.secure_url as string,
    thumbUrl: thumb,
    publicId: res.public_id as string,
    width: (res as any).width as number | undefined,
    height: (res as any).height as number | undefined,
    durationSec: (res as any).duration as number | undefined,
    format: (res as any).format as string | undefined,
  };
}
