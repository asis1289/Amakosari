"use client";
import Image from "next/image";

export default function Floating3DImageOverlay({
  src,
  alt,
  side = "left",
}: {
  src: string;
  alt: string;
  side?: "left" | "right";
}) {
  return (
    <div
      className={`floating-3d-overlay pointer-events-none select-none hidden md:block`}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 0,
        transform: "translateY(-50%)",
        zIndex: 10,
        width: "clamp(220px, 28vw, 420px)",
        height: "auto",
        maxHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
      }}
    >
      <div
        className="animated-3d-img group"
        style={{ perspective: 1600, width: "100%" }}
      >
        <Image
          src={src}
          alt={alt}
          width={420}
          height={420}
          className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-y-12 group-hover:-rotate-x-6"
          style={{
            transform: side === "left"
              ? "rotateY(-10deg) rotateX(5deg)"
              : "rotateY(10deg) rotateX(-5deg)",
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
          }}
          priority
        />
      </div>
      <style jsx>{`
        .animated-3d-img {
          will-change: transform;
          animation: floatY 3.5s ease-in-out infinite alternate;
        }
        @keyframes floatY {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-24px) scale(1.08); }
        }
        @media (max-width: 1024px) {
          .floating-3d-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
} 