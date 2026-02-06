
"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function HeroPage() {
  return (
    <div className={poppins.className}>

      {/* ==========================================================
          MOBILE VIEW (UNCHANGED)
      ========================================================== */}
      <section className="relative w-full min-h-screen flex md:hidden flex-col overflow-hidden bg-[#B5A8D6]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-20 pt-10 px-6">
          <Image
            src="/assets/lite-logo.png"
            alt="Billzzy Lite Logo"
            width={200}
            height={56}
            className="h-14 w-auto drop-shadow-2xl"
          />
        </div>

        <div className="relative z-20 px-6 mt-10 flex justify-center text-center">
          <h1 className="text-4xl font-bold leading-tight text-[#4F46E5] drop-shadow-lg whitespace-nowrap">
            Paperless Billing.
          </h1>
        </div>

        <div className="relative z-20 flex-1 flex items-center justify-center px-6 py-8" />

        <div className="relative z-20 px-6 pb-8 flex gap-3 flex-nowrap">
          <button
            onClick={() =>
              document
                .getElementById("learn-more")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-1/2 inline-flex items-center justify-center px-4 py-4 
            bg-[#4F46E5] hover:bg-[#4338ca] transition-all duration-300 
            text-white text-base font-semibold rounded-xl shadow-lg 
            transform hover:scale-105"
          >
            Learn More <ArrowRight className="ml-2 w-5 h-5" />
          </button>

          <button
            onClick={() => (window.location.href = "/login")}
            className="w-1/2 inline-flex items-center justify-center px-4 py-4 
            bg-white hover:bg-gray-50 transition-all duration-300 
            text-[#4F46E5] text-base font-semibold rounded-xl shadow-lg 
            border-2 border-[#4F46E5] transform hover:scale-105"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ==========================================================
          DESKTOP VIEW (REFINED SIZING)
      ========================================================== */}
      <section className="hidden md:flex flex-row items-center w-full min-h-[85vh] relative bg-white overflow-hidden pb-10 pt-24">

        {/* --- DECORATIVE ELEMENTS --- */}





        {/* --- LEFT CONTENT --- */}
        <div className="w-1/2 pl-20 pr-10 flex flex-col justify-center items-start h-full z-10 pb-12">
          <div className="mb-4">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-snug tracking-wide text-[#332a7c]">
              Billzzy Lite:<br />
              <span className="text-[#4F46E5]">Mobile,</span><br />
              <span className="text-[#4F46E5]">Paperless,</span><br />
              <span className="text-[#332a7c]">& Green Billing.</span>
            </h1>
          </div>

          <p className="mt-3 mb-8 text-base text-gray-600 leading-relaxed tracking-wide max-w-lg text-justify">
            Streamline your point of sale with our eco-friendly,
            mobile-first billing solution. Say goodbye to paper and
            hello to efficiency. Fast, secure, and sustainable for
            businesses of all sizes.
          </p>

          <div className="flex items-center gap-5">
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-semibold rounded-xl shadow-xl shadow-indigo-500/20 transition-transform transform hover:-translate-y-1 flex items-center tracking-wide text-sm md:text-base"
            >
              Get Started
            </button>

            <button className="px-6 py-3 bg-white border border-gray-200 hover:border-[#4F46E5] text-gray-600 hover:text-[#4F46E5] font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl tracking-wide text-sm md:text-base">
              <PlayCircle className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* --- RIGHT IMAGE WITH HOVER INTERACTION --- */}
        <div className="w-1/2 h-full relative flex items-center justify-center p-8 pb-12">

          {/* GROUP WRAPPER: Handles the hover state for both image and background */}
          <div className="relative group w-full max-w-md z-10 flex items-center justify-center">

            {/* 
                3. The Concentric Circles (Behind Image) 
                UPDATED: Now using mapped <circle> elements to create 'circle lines' (ripples)
             */}
            <div className="absolute w-[140%] h-[140%] -z-10 flex items-center justify-center 
                             opacity-0 group-hover:opacity-30 scale-90 group-hover:scale-100
                             transition-all duration-700 ease-in-out pointer-events-none">
              <svg width="800" height="800" viewBox="0 0 100 100" className="w-full h-full text-[#4F46E5]">
                {/* Create 20 concentric rings */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={2 + i * 2.4} // Radius expands outward
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.25"
                  />
                ))}
              </svg>
            </div>

            {/* MAIN IMAGE CARD */}
            <div className="relative transition-transform duration-500 group-hover:-translate-y-2">
              <div className="rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-gray-100 ring-1 ring-black/5">
                <Image
                  src="/assets/desktop.png"
                  alt="Billzzy Lite Desktop Illustration"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <div id="learn-more"></div>
    </div>
  );
}