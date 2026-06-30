"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_MB } from "@/src/constants/uploadConfig";
import { validateImageFile } from "@/src/lib/fileValidation";

async function getCroppedFile(imageSrc, pixelCrop, fileName = "cropped.jpg") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop image"));
          return;
        }
        resolve(new File([blob], fileName, { type: blob.type || "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

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
      setError(validationError);
      return;
    }

    setError("");

    if (enableCrop) {
      const url = URL.createObjectURL(selectedFile);
      setPendingFile(selectedFile);
      setCropSrc(url);
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
    setCroppedAreaPixels(null);
  };

  const applyCrop = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setLoading(true);
    try {
      const croppedFile = await getCroppedFile(
        cropSrc,
        croppedAreaPixels,
        pendingFile?.name || "cropped.jpg"
      );
      onChange?.(croppedFile);
      closeCropDialog();
    } catch {
      setError("Failed to crop image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      )}

      {displaySrc ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySrc} alt="Preview" className="max-h-48 w-full object-contain" />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={handleRemove}>
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
                JPG, JPEG, PNG, WEBP up to {maxSizeMB}MB
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Crop Image
            </DialogTitle>
          </DialogHeader>
          <div className="relative h-64 w-full bg-slate-900">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeCropDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={applyCrop} disabled={loading}>
              {loading ? "Processing..." : "Apply Crop"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
