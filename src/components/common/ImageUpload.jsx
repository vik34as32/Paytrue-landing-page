"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_MB } from "@/src/constants/uploadConfig";
import { validateImageFile } from "@/src/lib/fileValidation";

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

async function getCroppedFile(
  imageSrc,
  pixelCrop,
  rotation = 0,
  fileName = "cropped.jpg"
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = Math.max(1, Math.round(bBoxWidth));
  canvas.height = Math.max(1, Math.round(bBoxHeight));

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) throw new Error("Canvas not supported");

  croppedCanvas.width = Math.max(1, Math.round(pixelCrop.width));
  croppedCanvas.height = Math.max(1, Math.round(pixelCrop.height));

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop image"));
          return;
        }
        resolve(
          new File([blob], fileName, { type: blob.type || "image/jpeg" })
        );
      },
      "image/jpeg",
      0.92
    );
  });
}

export default function ImageUpload({
  label,
  file = null,
  existingUrl = null,
  onChange,
  accept = IMAGE_ACCEPT,
  enableCrop = true,
  maxSizeMB = MAX_IMAGE_SIZE_MB,
  className = "",
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const resetCropState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file]);

  const displaySrc = previewUrl || existingUrl;

  const processFile = (selectedFile) => {
    const validationError = validateImageFile(selectedFile, maxSizeMB);
    if (validationError) {
      toast.error(validationError);
      setError(validationError);
      return;
    }

    setError("");

    if (enableCrop) {
      const url = URL.createObjectURL(selectedFile);
      setPendingFile(selectedFile);
      setCropSrc(url);
      resetCropState();
      setCropOpen(true);
    } else {
      onChange?.(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const handleRemove = () => {
    onChange?.(null);
    setError("");
  };

  const closeCropDialog = () => {
    setCropOpen(false);
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPendingFile(null);
    resetCropState();
  };

  const rotateBy = (degrees) => {
    setRotation((prev) => {
      const next = (prev + degrees) % 360;
      return next < 0 ? next + 360 : next;
    });
  };

  const applyCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const croppedFile = await getCroppedFile(
        cropSrc,
        croppedAreaPixels,
        rotation,
        pendingFile?.name || "cropped.jpg"
      );
      onChange?.(croppedFile);
      closeCropDialog();
    } catch {
      setError("Failed to crop image");
      toast.error("Failed to crop image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>
      )}

      {displaySrc ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displaySrc}
            alt="Preview"
            className="max-h-48 w-full object-contain"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition ${
            dragOver
              ? "border-[#1565d8] bg-blue-50/50"
              : "border-slate-200 bg-slate-50/50 hover:border-[#1565d8]/40 dark:border-slate-700 dark:bg-slate-900/50"
          }`}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[#1565d8]" />
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1565d8]">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                Drag & drop or click to upload
              </p>
              <p className="mt-1 text-xs text-slate-400">
                JPG, JPEG, PNG up to {maxSizeMB} MB
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) processFile(selected);
          e.target.value = "";
        }}
      />

      <Dialog
        open={cropOpen}
        onOpenChange={(open) => {
          if (!open) closeCropDialog();
        }}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader className="border-b border-slate-100 px-4 py-3">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-[#0b1f3a]">
              <ImageIcon className="h-4 w-4 text-[#1565d8]" />
              Crop Image
            </DialogTitle>
          </DialogHeader>

          <div className="relative h-56 w-full bg-[#0f172a]">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={undefined}
                minZoom={0.5}
                maxZoom={3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
                objectFit="contain"
                restrictPosition={false}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-lg border-slate-200 bg-white shadow-sm"
                onClick={() => rotateBy(-90)}
                title="Rotate left 90°"
                aria-label="Rotate left 90 degrees"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-lg border-slate-200 bg-white shadow-sm"
                onClick={() => rotateBy(90)}
                title="Rotate right 90°"
                aria-label="Rotate right 90 degrees"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <div className="ml-1 flex h-9 min-w-[7.5rem] items-center rounded-lg border border-slate-200 bg-white px-2.5 shadow-sm">
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#1565d8]"
                  aria-label="Zoom"
                  title="Zoom"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                onClick={closeCropDialog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-lg bg-[#1565d8] hover:bg-[#1257b8]"
                onClick={applyCrop}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
