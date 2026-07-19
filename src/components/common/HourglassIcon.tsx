"use client";

import Box from "@mui/material/Box";

/** Animated hourglass — pink frame + blue sand (process-in-progress cue). */
export default function HourglassIcon({
  size = 72,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Box
      className={className}
      aria-hidden
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        animation: "hgFlip 2.2s ease-in-out infinite",
        "@keyframes hgFlip": {
          "0%, 40%": { transform: "rotate(0deg)" },
          "50%, 90%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="14"
          y="4"
          width="52"
          height="8"
          rx="2"
          fill="#f9a8d4"
          stroke="#ec4899"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="84"
          width="52"
          height="8"
          rx="2"
          fill="#f9a8d4"
          stroke="#ec4899"
          strokeWidth="2"
        />
        <path
          d="M22 12 V22 L36 40 L22 58 V84 H58 V58 L44 40 L58 22 V12 Z"
          fill="rgba(255,255,255,0.14)"
          stroke="#f472b6"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M28 18 L40 36 L52 18 Z" fill="#3b82f6" />
        <rect x="38.5" y="38" width="3" height="16" rx="1.5" fill="#60a5fa" />
        <path d="M28 78 L40 52 L52 78 Z" fill="#2563eb" />
        <path
          d="M26 20 Q30 36 26 52"
          stroke="rgba(147,197,253,0.55)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
}
