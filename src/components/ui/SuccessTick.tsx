import React, { useEffect } from 'react';
import styles from './SuccessTick.module.css';

const SuccessTick = ({ onComplete, amount }: { onComplete: () => void, amount: number }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500); // Reduced to 1.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white overflow-hidden">

      <div className="relative flex flex-col items-center justify-center w-full h-full">

        {/* Burst Container */}
        <div className="relative mb-10 scale-125">

          {/* Confetti SVGs */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${styles.confetti}`}>
            {/* Standard Shapes */}
            <svg className={`${styles.confetti} ${styles.c1}`} width="24" height="24" viewBox="0 0 20 20"><path fill="#34A853" d="M8 0h4v20H8z" /><path fill="#34A853" d="M0 8h20v4H0z" /></svg>
            <svg className={`${styles.confetti} ${styles.c2}`} width="20" height="20" viewBox="0 0 20 20"><path fill="#FBBC05" d="M10 0L20 20H0z" /></svg>
            <svg className={`${styles.confetti} ${styles.c3}`} width="22" height="22" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#5a4fcf" strokeWidth="4" fill="none" /></svg>
            <svg className={`${styles.confetti} ${styles.c4}`} width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#FBBC05" /></svg>
            <svg className={`${styles.confetti} ${styles.c5}`} width="24" height="12" viewBox="0 0 40 20"><path fill="none" stroke="#EA4335" strokeWidth="5" strokeLinecap="round" d="M5 10c5-10 10-10 15 0s10 10 15 0" /></svg>
            <svg className={`${styles.confetti} ${styles.c6}`} width="16" height="16" viewBox="0 0 20 20"><rect width="20" height="20" fill="#5a4fcf" transform="rotate(45 10 10)" /></svg>
            <svg className={`${styles.confetti} ${styles.c7}`} width="20" height="10" viewBox="0 0 20 10"><rect width="20" height="10" fill="#EA4335" rx="5" /></svg>
            <svg className={`${styles.confetti} ${styles.c8}`} width="14" height="14" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#34A853" /></svg>

            {/* MONEY EXPLOSION */}
            <div className={`${styles.confetti} ${styles.cMoney1} text-green-600 font-bold text-2xl absolute`}>₹</div>
            <div className={`${styles.confetti} ${styles.cMoney2} text-[#5a4fcf] font-bold text-xl absolute`}>₹</div>
            <div className={`${styles.confetti} ${styles.cMoney3} text-emerald-500 font-bold text-lg absolute`}>₹</div>

            {/* Cash Notes */}
            <svg className={`${styles.confetti} ${styles.cNote1}`} width="24" height="12" viewBox="0 0 24 12"><rect width="24" height="12" fill="#85bb65" rx="2" /><circle cx="12" cy="6" r="3" fill="#e8f5e9" /></svg>
            <svg className={`${styles.confetti} ${styles.cNote2}`} width="24" height="12" viewBox="0 0 24 12"><rect width="24" height="12" fill="#85bb65" rx="2" /><circle cx="12" cy="6" r="3" fill="#e8f5e9" /></svg>
            <svg className={`${styles.confetti} ${styles.cNote3}`} width="24" height="12" viewBox="0 0 24 12"><rect width="24" height="12" fill="#85bb65" rx="2" /><circle cx="12" cy="6" r="3" fill="#e8f5e9" /></svg>

            {/* More Symbols */}
            <div className={`${styles.confetti} ${styles.cMoney4} text-green-700 font-bold text-xl absolute`}>₹</div>
            <div className={`${styles.confetti} ${styles.cMoney5} text-green-500 font-bold text-2xl absolute`}>₹</div>
          </div>

          {/* Blue Circle Background */}
          <div className={`relative z-10 ${styles.blueCircle}`}>
            <svg width="120" height="120" viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="44" fill="#5a4fcf" />
              <path className={styles.tickPath} d="M26 44L38 56L62 32" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Text Container */}
        <div className={`flex flex-col items-center text-gray-900 z-20 ${styles.animateSlideUpFade}`}>
          <h2 className="text-4xl font-extrabold mb-1 tracking-tight">{formattedAmount}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Paid Successfully
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .blue-circle {
            transform: scale(0);
            animation: circleScale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes circleScale {
            to { transform: scale(1); }
        }

        .tick-path {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: tickDraw 0.4s ease-out 0.4s forwards;
        }
        @keyframes tickDraw {
            to { stroke-dashoffset: 0; }
        }

        .confetti {
            position: absolute;
            opacity: 0;
        }

        /* Standard 8-way burst */
        @keyframes explode-1 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(-100px, -100px) scale(0.8) rotate(-45deg); } }
        @keyframes explode-2 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(0px, -120px) scale(1.1) rotate(20deg); } }
        @keyframes explode-3 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(100px, -100px) scale(0.8) rotate(45deg); } }
        @keyframes explode-4 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(120px, 0px) scale(0.9) rotate(90deg); } }
        @keyframes explode-5 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(100px, 100px) scale(1.1) rotate(135deg); } }
        @keyframes explode-6 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(0px, 120px) scale(0.8) rotate(180deg); } }
        @keyframes explode-7 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(-100px, 100px) scale(1.1) rotate(225deg); } }
        @keyframes explode-8 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(-120px, 0px) scale(0.9) rotate(270deg); } }

        /* MONEY & NOTE BURSTS - More chaos, higher velocity */
        @keyframes explode-m1 { 0% { opacity: 0; transform: translate(0,0) scale(0.2); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(-60px, -150px) scale(1.5) rotate(-20deg); } } /* High Left */
        @keyframes explode-m2 { 0% { opacity: 0; transform: translate(0,0) scale(0.2); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(60px, -160px) scale(1.4) rotate(20deg); } } /* High Right */
        @keyframes explode-m3 { 0% { opacity: 0; transform: translate(0,0) scale(0.2); } 40% { opacity: 1; } 100% { opacity: 0; transform: translate(0px, -180px) scale(1.2) rotate(0deg); } } /* Straight Up */
        
        @keyframes explode-n1 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(-120px, -80px) scale(1.2) rotate(-90deg); } } /* Wide Left */
        @keyframes explode-n2 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(120px, -80px) scale(1.2) rotate(90deg); } } /* Wide Right */
        @keyframes explode-n3 { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(0px, -140px) scale(1) rotate(180deg); } } /* Note Straight Up */

        @keyframes explode-m4 { 0% { opacity: 0; transform: translate(0,0) scale(0.2); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(-90px, 90px) scale(1.3) rotate(-135deg); } }
        @keyframes explode-m5 { 0% { opacity: 0; transform: translate(0,0) scale(0.2); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(90px, 90px) scale(1.3) rotate(135deg); } }

        .c-1 { animation: explode-1 0.8s ease-out 0.4s forwards; }
        .c-2 { animation: explode-2 0.8s ease-out 0.45s forwards; }
        .c-3 { animation: explode-3 0.8s ease-out 0.4s forwards; }
        .c-4 { animation: explode-4 0.8s ease-out 0.45s forwards; }
        .c-5 { animation: explode-5 0.8s ease-out 0.4s forwards; }
        .c-6 { animation: explode-6 0.8s ease-out 0.45s forwards; }
        .c-7 { animation: explode-7 0.8s ease-out 0.4s forwards; }
        .c-8 { animation: explode-8 0.8s ease-out 0.45s forwards; }
        
        .c-money-1 { animation: explode-m1 1s ease-out 0.4s forwards; }
        .c-money-2 { animation: explode-m2 1.1s ease-out 0.45s forwards; }
        .c-money-3 { animation: explode-m3 1.2s ease-out 0.4s forwards; }
        .c-money-4 { animation: explode-m4 0.9s ease-out 0.5s forwards; }
        .c-money-5 { animation: explode-m5 0.9s ease-out 0.5s forwards; }
        
        .c-note-1 { animation: explode-n1 1s ease-out 0.45s forwards; }
        .c-note-2 { animation: explode-n2 1s ease-out 0.45s forwards; }
        .c-note-3 { animation: explode-n3 0.9s ease-out 0.4s forwards; }

        .animate-slide-up-fade {
          opacity: 0;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessTick;
