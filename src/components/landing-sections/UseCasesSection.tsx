
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTshirt, FaShoppingCart, FaArrowRight, FaMobileAlt } from 'react-icons/fa';

export default function UseCasesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // DATA CONFIGURATION
  // We use specific images for Mobile (your local assets) and Desktop (High-res Unsplash)
  const useCases = [
    {
      title: "Mobile Shop",
      desc: "Track IMEI numbers, manage repairs, and handle warranties instantly.",
      // ORIGINAL LOCAL IMAGE FOR MOBILE
      mobileImage: "/assets/mobile-shop.png",
      // HIGH-RES IMAGE FOR DESKTOP PREMIUM VIEW
      desktopImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1780&auto=format&fit=crop",
      icon: <FaMobileAlt />,
      category: "Electronics"
    },
    {
      title: "Super Market",
      desc: "Fast barcode scanning for 1000s of items with automated stock updates.",
      // ORIGINAL LOCAL IMAGE FOR MOBILE
      mobileImage: "/assets/super-market.png",
      // HIGH-RES IMAGE FOR DESKTOP PREMIUM VIEW
      desktopImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1974&auto=format&fit=crop",
      icon: <FaShoppingCart />,
      category: "Retail"
    },
    {
      title: "Dress Shop",
      desc: "Manage sizes (S/M/L) and colors seamlessly without confusion.",
      // ORIGINAL LOCAL IMAGE FOR MOBILE
      mobileImage: "/assets/dress-shop.png",
      // HIGH-RES IMAGE FOR DESKTOP PREMIUM VIEW
      desktopImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1976&auto=format&fit=crop",
      icon: <FaTshirt />,
      category: "Apparel"
    },
  ];

  // Auto-scroll logic (Only affects Mobile Carousel)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === useCases.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [useCases.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">

      {/* Background Ambience (Desktop Only) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent -z-10"></div>
        <div className="absolute top-20 left-[-100px] w-80 h-80 bg-[#5a4fcf]/10 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-20 right-[-100px] w-80 h-80 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      {/* Mobile Background Glow (Your Original) */}
      <div className="md:hidden absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#5a4fcf' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#5a4fcf' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#5a4fcf] text-xs font-bold uppercase tracking-wider mb-4 border border-purple-100">
            Versatile & Powerful
          </div>
          <h2 className="text-2xl md:text-5xl font-bold leading-tight mb-4 md:mb-6 text-gray-900">
            <span className="text-black">Perfect for </span>
            <span className="md:hidden" style={{ color: '#5a4fcf' }}><br />Small businesses for all kinds</span>
            <span className="hidden md:inline text-transparent bg-clip-text bg-gradient-to-r from-[#5a4fcf] to-[#8c82fc]">
              Every Business
            </span>
          </h2>
        </div>

        {/* =========================================================
            DESKTOP VIEW (MD+) -> THE "TOO GOOD" PREMIUM GRID
           ========================================================= */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {useCases.map((item, index) => (
            <div
              key={index}
              className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 border border-gray-100"
            >
              {/* Desktop Image (High Res) */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={item.desktopImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300"></div>
              </div>

              {/* Top Badge */}
              <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 relative z-10">
                {item.icon} {item.category}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 transform translate-y-4 group-hover:translate-y-0">
                  {item.desc}
                </p>
                <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:text-[#aea6ff] transition-colors">
                  Explore Features <FaArrowRight />
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* =========================================================
            MOBILE VIEW (Up to MD) -> YOUR ORIGINAL CAROUSEL & IMAGES
           ========================================================= */}
        <div className="block md:hidden relative">
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {useCases.map((item, index) => (
                <div
                  key={index}
                  className="min-w-full flex justify-center px-4"
                >
                  {/* Your Original Card Structure */}
                  <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-md w-full transform transition-transform duration-300">

                    {/* Mobile Image (Local Asset) */}
                    <div className="w-full h-64 overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative">
                      <Image
                        src={item.mobileImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-800 text-center">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {useCases.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'w-8'
                  : 'w-3'
                  }`}
                style={{
                  backgroundColor: index === currentIndex ? '#5a4fcf' : '#cbd5e1'
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}