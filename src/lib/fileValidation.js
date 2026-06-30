import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_MIME_TYPES,
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from "@/src/constants/uploadConfig";

function getExtension(name = "") {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
}

export function validateImageFile(file, maxSizeMB = MAX_IMAGE_SIZE_MB) {
  if (!file) return "Please select an image file";

  const ext = getExtension(file.name);
  const typeOk =
    ALLOWED_IMAGE_MIME_TYPES.includes(file.type) ||
    ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  if (!typeOk) {
    return "Allowed images: JPG, JPEG, PNG, WEBP";
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image must be under ${maxSizeMB}MB`;
  }

  return "";
}

export function validateVideoFile(file, maxSizeMB = MAX_VIDEO_SIZE_MB) {
  if (!file) return "Please select a video file";

  const ext = getExtension(file.name);
  const typeOk =
    ALLOWED_VIDEO_MIME_TYPES.includes(file.type) ||
    ALLOWED_VIDEO_EXTENSIONS.includes(ext);

  if (!typeOk) {
    return "Allowed videos: MP4, MOV, AVI, WEBM";
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Video must be under ${maxSizeMB}MB`;
  }

  return "";
}
