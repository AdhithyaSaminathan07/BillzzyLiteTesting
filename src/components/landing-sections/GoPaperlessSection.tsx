
"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Leaf } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function GoPaperlessSection() {
  return (
    <section className={`w-full py-12 md:py-24 px-4 md:px-8 relative overflow-hidden bg-white ${poppins.className}`}>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background Decor (Desktop Only) */}
      <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-50 to-transparent -z-10" />
      <div className="hidden md:block absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-green-50 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20">

        {/* ==========================
            1. TEXT CONTENT (Left on Desktop, Top on Mobile)
           ========================== */}
        <div className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1 relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs md:text-sm font-bold uppercase tracking-wide mb-4 border border-green-100">
            <Leaf className="w-3 h-3 md:w-4 md:h-4" /> Eco-Friendly Choice
          </div>

          {/* Heading */}
          <h2 className="text-[28px] md:text-5xl font-semibold leading-tight mb-4 md:mb-6">
            <span className="block text-gray-900">Go Paperless</span>
            <span className="block text-[#5a4fcf] font-bold mt-1 md:mt-2">
              With Billzzy Lite
            </span>
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-[16px] md:text-lg leading-relaxed mb-8 px-2 md:px-0 max-w-lg mx-auto md:mx-0 text-justify">
            Go green with Billzzy. Switch to WhatsApp billing to reduce paper
            waste, deliver instant receipts, and present your business as modern,
            eco-friendly, and tech-savvy.
          </p>

          {/* Button */}
          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center justify-center gap-2 w-[200px] md:w-auto md:px-8 py-3 md:py-4 bg-[#5a4fcf] text-white rounded-xl font-medium text-[16px] md:text-lg hover:bg-[#4c44b7] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1"
            >
              Go Paperless
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==========================
            2. IMAGE (Right on Desktop, Middle on Mobile)
           ========================== */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end order-1 md:order-2 relative">
          {/* Blob behind image on desktop */}
          <div className="hidden md:block absolute inset-0 bg-[#5a4fcf]/5 rounded-full blur-3xl transform scale-90 translate-x-10"></div>

          <Image
            src="/images/paper-lesss.png"
            alt="Go Paperless"
            width={350}
            height={350}
            className="relative z-10 w-full max-w-[350px] md:max-w-none md:w-[90%] h-auto object-contain drop-shadow-xl md:drop-shadow-2xl animate-float md:animate-none"
          />
        </div>

      </div>
    </section>
  );
}