"use client";
import Image from "next/image";

export default function Blurry3DImageBackground({
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
      className={`blurry-3d-bg pointer-events-none select-none hidden md:block`}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 0,
        transform: "translateY(-50%)",
        zIndex: 2,
        width: "clamp(320px, 38vw, 600px)",
        height: "auto",
        maxHeight: "90vh",
        opacity: 0.35,
        filter: "blur(2px) saturate(1.5) contrast(1.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
      }}
    >
      <div
        className="animated-3d-img"
        style={{ perspective: 1600, width: "100%" }}
      >
        <Image
          src={src}
          alt={alt}
          width={600}
          height={600}
          className="object-contain transition-transform duration-700"
          style={{
            transform: side === "left"
              ? "rotateY(-10deg) rotateX(5deg)"
              : "rotateY(10deg) rotateX(-5deg)",
            width: "100%",
            height: "auto",
            maxHeight: "90vh",
          }}
          priority
        />
      </div>
      <style jsx>{`
        .animated-3d-img {
          will-change: transform;
          animation: floatY 4s ease-in-out infinite alternate;
        }
        @keyframes floatY {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-32px) scale(1.10); }
        }
        @media (max-width: 1024px) {
          .blurry-3d-bg {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
} 