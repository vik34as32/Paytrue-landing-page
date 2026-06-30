"use client";

import { useEffect, useRef, useState } from "react";
import { Video, Upload, Trash2, Camera, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VIDEO_ACCEPT, MAX_VIDEO_SIZE_MB } from "@/src/constants/uploadConfig";
import { validateVideoFile } from "@/src/lib/fileValidation";

export default function VideoUpload({
  label,
  file = null,
  existingUrl = null,
  onChange,
  maxSizeMB = MAX_VIDEO_SIZE_MB,
  accept = VIDEO_ACCEPT,
  className = "",
}) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const objectUrlRef = useRef(null);

  const [mode, setMode] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [previewStream, setPreviewStream] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      stopStream();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setPreviewStream(null);
  };

  const startWebcam = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setPreviewStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Unable to access webcam. Please allow camera permissions.");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const recordedFile = new File(
        [blob],
        `verification-${Date.now()}.webm`,
        { type: blob.type || "video/webm" }
      );
      const validationError = validateVideoFile(recordedFile, maxSizeMB);
      if (validationError) {
        setError(validationError);
      } else {
        onChange?.(recordedFile);
      }
      stopStream();
      setMode("upload");
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleFile = (selectedFile) => {
    const validationError = validateVideoFile(selectedFile, maxSizeMB);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    onChange?.(selectedFile);
    setLoading(false);
  };

  const handleRemove = () => {
    onChange?.(null);
    setError("");
  };

  const displaySrc = previewUrl || existingUrl;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "upload" ? "default" : "outline"}
          onClick={() => {
            setMode("upload");
            stopStream();
          }}
        >
          <Upload className="h-4 w-4" />
          Upload Video
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "webcam" ? "default" : "outline"}
          onClick={() => {
            setMode("webcam");
            startWebcam();
          }}
        >
          <Camera className="h-4 w-4" />
          Record Webcam
        </Button>
      </div>

      {displaySrc ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-700">
          <video src={displaySrc} controls className="max-h-64 w-full" />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      ) : mode === "webcam" ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full rounded-lg bg-black object-cover"
          />
          {!previewStream && (
            <p className="text-sm text-slate-500">Starting camera...</p>
          )}
          <div className="flex gap-2">
            {!recording ? (
              <Button type="button" onClick={startRecording} disabled={!previewStream}>
                <Video className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button type="button" variant="destructive" onClick={stopRecording}>
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 hover:border-[#1565d8]/40 dark:border-slate-700 dark:bg-slate-900/50"
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-[#1565d8]" />
          ) : (
            <>
              <Video className="h-8 w-8 text-[#1565d8]" />
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Click to upload video
              </p>
              <p className="text-xs text-slate-400">
                MP4, MOV, AVI, WEBM up to {maxSizeMB}MB
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
          if (selected) handleFile(selected);
          e.target.value = "";
        }}
      />
    </div>
  );
}
