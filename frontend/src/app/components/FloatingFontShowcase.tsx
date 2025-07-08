"use client";
import Image from "next/image";

export default function FloatingFontShowcase() {
  return (
    <div className="relative w-full flex items-center justify-between py-16">
      {/* Left Floating Image + Text */}
      <div className="flex items-center gap-6 sticky left-0 top-32 z-20" style={{ minHeight: 200 }}>
        <div
          className="floating-3d-img group"
          style={{ perspective: 1200 }}
        >
          <Image
            src="/images/mygirlfont.png"
            alt="Explore Collections Font"
            width={180}
            height={100}
            className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-y-12 group-hover:-rotate-x-6"
            style={{ transform: "rotateY(-18deg) rotateX(8deg)" }}
            priority
          />
        </div>
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Explore Our Collections</h2>
          <p className="text-lg text-gray-600 max-w-xs">Discover different styles of Nepali cultural dresses.</p>
        </div>
      </div>
      {/* Right Floating Image + Text */}
      <div className="flex items-center gap-6 sticky right-0 top-32 z-20" style={{ minHeight: 200 }}>
        <div className="text-right">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Current Best Selling Offers</h2>
          <p className="text-lg text-gray-600 max-w-xs">Don't miss out on these amazing deals!</p>
        </div>
        <div
          className="floating-3d-img group"
          style={{ perspective: 1200 }}
        >
          <Image
            src="/images/mygirlfont2.png"
            alt="Best Offers Font"
            width={180}
            height={100}
            className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-y-12 group-hover:rotate-x-6"
            style={{ transform: "rotateY(18deg) rotateX(-8deg)" }}
            priority
          />
        </div>
      </div>
      <style jsx>{`
        .floating-3d-img {
          will-change: transform;
          animation: floatY 3.5s ease-in-out infinite alternate;
        }
        @keyframes floatY {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-18px) scale(1.04); }
        }
      `}</style>
    </div>
  );
} 