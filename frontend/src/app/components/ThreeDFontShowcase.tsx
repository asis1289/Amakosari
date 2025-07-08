"use client";
import Image from "next/image";
import { useRef } from "react";

export default function ThreeDFontShowcase() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  // Optionally, you can add more advanced animation with useEffect or a library
  return (
    <div className="flex justify-center gap-8 py-8">
      <div
        ref={ref1}
        className="transition-transform duration-500 ease-in-out hover:rotate-y-12 hover:-rotate-x-6 hover:scale-110 cursor-pointer"
        style={{ perspective: 800 }}
      >
        <Image
          src="/images/mygirlfont.png"
          alt="My Girl Font 1"
          width={220}
          height={120}
          className="rounded-xl shadow-2xl object-contain"
          style={{ transform: "rotateY(-10deg) rotateX(5deg)" }}
        />
      </div>
      <div
        ref={ref2}
        className="transition-transform duration-500 ease-in-out hover:-rotate-y-12 hover:rotate-x-6 hover:scale-110 cursor-pointer"
        style={{ perspective: 800 }}
      >
        <Image
          src="/images/mygirlfont2.png"
          alt="My Girl Font 2"
          width={220}
          height={120}
          className="rounded-xl shadow-2xl object-contain"
          style={{ transform: "rotateY(10deg) rotateX(-5deg)" }}
        />
      </div>
    </div>
  );
} 