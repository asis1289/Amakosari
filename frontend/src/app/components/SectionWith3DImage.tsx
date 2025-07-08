"use client";
import Animated3DImage from "./Animated3DImage";

export default function SectionWith3DImage({
  imageSrc,
  imageAlt,
  imageSide = "left",
  children,
}: {
  imageSrc: string;
  imageAlt: string;
  imageSide?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full flex flex-col md:flex-row items-stretch min-h-[400px] py-12">
      {imageSide === "left" && (
        <div className="relative flex-[1.5] basis-2/5 flex items-center justify-center z-10">
          <Animated3DImage src={imageSrc} alt={imageAlt} />
        </div>
      )}
      {/* Curved SVG divider */}
      <div className="hidden md:block w-16 relative z-0">
        <svg viewBox="0 0 64 400" width="100%" height="100%" preserveAspectRatio="none" className="absolute top-0 left-0 h-full w-full">
          <path d="M32,0 Q64,200 32,400" fill="none" stroke="#f97316" strokeWidth="8" />
        </svg>
      </div>
      <div className="flex-1 flex items-center justify-center z-10 overflow-auto">
        {children}
      </div>
      {imageSide === "right" && (
        <div className="relative flex-[1.5] basis-2/5 flex items-center justify-center z-10">
          <Animated3DImage src={imageSrc} alt={imageAlt} />
        </div>
      )}
    </div>
  );
} 