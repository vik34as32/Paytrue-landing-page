"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_SIZE_MB = 5;

interface ReceiptUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  uploading?: boolean;
  uploadProgress?: number;
  error?: string;
  compact?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateReceipt(file: File): string {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedExt.includes(ext) && !allowedTypes.includes(file.type)) {
    return "Only JPG, JPEG, PNG and WEBP images are allowed";
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Maximum file size is ${MAX_SIZE_MB} MB`;
  }

  return "";
}

export default function ReceiptUpload({
  file,
  onChange,
  uploading = false,
  uploadProgress = 0,
  error,
  compact = false,
}: ReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = useCallback(
    (nextFile: File | null) => {
      if (!nextFile) {
        onChange(null);
        setLocalError("");
        return;
      }

      const validationError = validateReceipt(nextFile);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      setLocalError("");
      onChange(nextFile);
    },
    [onChange]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);
      const dropped = event.dataTransfer.files?.[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleView = () => {
    if (!previewUrl) return;
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const displayError = error || localError;

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 transition-colors",
            compact ? "min-h-[100px] py-3" : "min-h-[140px] py-4",
            dragOver
              ? "border-[#1565d8] bg-blue-50/80"
              : "border-slate-200 bg-slate-50/80 hover:border-[#1565d8]/50 hover:bg-blue-50/40"
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
            <Upload className="h-4 w-4 text-[#1565d8]" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-semibold text-slate-800">
              Drop receipt or{" "}
              <span className="text-[#1565d8]">browse</span>
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              JPG, PNG, WEBP · Max {MAX_SIZE_MB} MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-2.5 p-2.5">
            {file.type.startsWith("image/") && previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="h-12 w-12 shrink-0 rounded-md border border-slate-100 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-[#1565d8]" />
                ) : (
                  <FileText className="h-4 w-4 text-[#1565d8]" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">{file.name}</p>
              <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
              {uploading && (
                <div className="mt-1.5">
                  <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1565d8] transition-all"
                      style={{ width: `${Math.max(uploadProgress, 8)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 border-t border-slate-100 px-2.5 py-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-md px-2 text-[10px]"
              onClick={handleView}
              disabled={!previewUrl}
            >
              <Eye className="h-3 w-3" />
              Preview
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-md px-2 text-[10px]"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-md px-2 text-[10px] text-red-600"
              onClick={() => handleFile(null)}
              disabled={uploading}
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      )}

      {displayError && <p className="mt-1 text-[11px] text-red-500">{displayError}</p>}
    </div>
  );
}
