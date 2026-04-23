import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SuccessScreenProps {
  onReset: () => void;
}

export default function SuccessScreen({ onReset }: SuccessScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 0.2 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 parsed-neon">
      <div
        ref={cardRef}
        className="card-surface p-12 sm:p-14 max-w-[420px] w-[90%] text-center"
        style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)' }}
      >
        {/* Success Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-7"
          style={{
            background: 'rgba(74, 222, 128, 0.15)',
            border: '2px solid rgba(74, 222, 128, 0.3)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="font-body text-[40px] font-extrabold tracking-[-0.03em] text-white mb-3">
          All Done!
        </h2>

        {/* Subtitle */}
        <p className="text-[15px] text-text-secondary max-w-[320px] mx-auto mb-8">
          Your resume data has been confirmed and submitted successfully. The information is ready for use.
        </p>

        {/* Button */}
        <button
          onClick={onReset}
          className="btn-coral w-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Parse Another Resume
        </button>
      </div>
    </div>
  );
}
