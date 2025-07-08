"use client";
import Image from "next/image";

export default function Animated3DImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full flex justify-center py-8">
      <div
        className="animated-3d-img group"
        style={{ perspective: 1600, maxWidth: 520, maxHeight: 420 }}
      >
        <Image
          src={src}
          alt={alt}
          width={500}
          height={400}
          className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-y-12 group-hover:-rotate-x-6"
          style={{ transform: "rotateY(-10deg) rotateX(5deg)", maxWidth: 500, maxHeight: 400 }}
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
      `}</style>
    </div>
  );
} 