export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm"];

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_VIDEO_SIZE_MB = 50;

export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";
export const VIDEO_ACCEPT = ALLOWED_VIDEO_MIME_TYPES.join(",");

/** Form field → multipart field name (File append keys) */
export const USER_FILE_FIELDS = {
  profileImage: "profileImage",
  aadhaarFront: "aadhaarFront",
  aadhaarBack: "aadhaarBack",
  panCard: "panCard",
  ownerPhoto: "ownerPhoto",
  videoVerification: "videoVerification",
  passbookImage: "passbookImage",
  cancelledChequeImage: "cancelledChequeImage",
};
