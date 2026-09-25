import React, { useState } from 'react';

interface AvatarProps {
  className?: string;
  size?: number;
}

export const StitchAvatar: React.FC<AvatarProps> = ({ className = 'w-16 h-16', size = 64 }) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp-DoPEQjVF_EjEmmqHJYxj7-9-PyrRQJr9XBphrBdtyjSJjemdj2w1skuiim7Wkl8pAI2ZzO5Ul6vI2hufhs52plKhmHCxe62GdECcFRnTw2Tq_q9LjZRFfDonxFc0GfgAtyFzqkRBwtBtvOeRklq67G65QKNDpss1E9YDM5pW4VyLkqIgwm5HsowJOrIY3ulTwW62iR77MNbhICecR2_J3zN_Nw7dKkI9a9UVG5QF1MUkpLOzOFVPg';

  if (!imgError) {
    return (
      <img
        src={photoUrl}
        alt="Stitch GM"
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover shadow-[0_0_16px_rgba(0,210,255,0.45)] ring-2 ring-[#00d2ff]`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Bespoke Vector Stitch with Gaming Headphones
  return (
    <div
      className={`${className} rounded-full overflow-hidden shadow-[0_0_16px_rgba(0,210,255,0.45)] ring-2 ring-[#00d2ff] bg-gradient-to-b from-[#0a1a2e] to-[#040810] flex items-center justify-center`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Left Ear */}
        <path d="M22 42 C8 24, 4 8, 18 10 C30 12, 34 26, 32 40 Z" fill="#2d68c4" />
        <path d="M20 38 C12 26, 8 16, 18 14 C25 14, 28 24, 26 36 Z" fill="#ea7a98" opacity="0.85" />

        {/* Right Ear */}
        <path d="M78 42 C92 24, 96 8, 82 10 C70 12, 66 26, 68 40 Z" fill="#2d68c4" />
        <path d="M80 38 C88 26, 92 16, 82 14 C75 14, 72 24, 74 36 Z" fill="#ea7a98" opacity="0.85" />

        {/* Head */}
        <ellipse cx="50" cy="54" rx="28" ry="24" fill="#3b82f6" />
        {/* Tuft of hair */}
        <path d="M47 31 C49 23, 51 23, 53 31 Z" fill="#2563eb" />

        {/* Eyes */}
        <ellipse cx="38" cy="50" rx="6.5" ry="8" fill="#0f172a" />
        <circle cx="36" cy="48" r="2.5" fill="#ffffff" />
        <ellipse cx="62" cy="50" rx="6.5" ry="8" fill="#0f172a" />
        <circle cx="60" cy="48" r="2.5" fill="#ffffff" />

        {/* Nose */}
        <ellipse cx="50" cy="58" rx="7" ry="4.5" fill="#1e3a8a" />

        {/* Smile */}
        <path d="M40 65 Q50 72 60 65" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

        {/* GAMING HEADPHONES */}
        {/* Headband arch */}
        <path d="M25 46 C25 24, 75 24, 75 46" fill="none" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
        <path d="M28 44 C28 26, 72 26, 72 44" fill="none" stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" />

        {/* Left Earcup */}
        <rect x="18" y="44" width="9" height="18" rx="4.5" fill="#1f2937" stroke="#00d2ff" strokeWidth="1.5" />
        <circle cx="22.5" cy="53" r="2" fill="#00d2ff" />

        {/* Right Earcup */}
        <rect x="73" y="44" width="9" height="18" rx="4.5" fill="#1f2937" stroke="#00d2ff" strokeWidth="1.5" />
        <circle cx="77.5" cy="53" r="2" fill="#00d2ff" />

        {/* Microphone boom */}
        <path d="M22 60 Q26 74 38 72" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="72" r="2" fill="#00d2ff" />
      </svg>
    </div>
  );
};

export const RobotAvatar: React.FC<AvatarProps> = ({ className = 'w-16 h-16' }) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGPOvF3hqZCvgaZMvyC2RlpzYqrtn0aPdZUAza1Q8sfMoar8jqbVPNO8s4HwygD60scoUuww1h0Vq8z3TmrkqUXO9YGjVBvAppHBsKZEB6Vc1iLu3FcroapHzkZWCrJjGG1_Dydg1-gIK3eP8FojQftKSBsm_49r2egNDnwJpMqa11-5tKX09zG5U-Wh2fjQt_XCGdRKYuzFoVfZy272X-YcwvObSiPx0M8otXOlbXfVzKOT7l81FahQ';

  if (!imgError) {
    return (
      <img
        src={photoUrl}
        alt="AI Grandmaster"
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover shadow-[0_0_20px_rgba(0,210,255,0.3)] ring-2 ring-[#00d2ff]/40`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Bespoke Vector AI Grandmaster Bot
  return (
    <div
      className={`${className} rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,210,255,0.3)] ring-2 ring-[#00d2ff]/40 bg-gradient-to-b from-[#1a1c22] to-[#0c0e12] flex items-center justify-center`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Bot Head Armor */}
        <path d="M28 35 L50 20 L72 35 L76 65 L50 82 L24 65 Z" fill="#282a30" stroke="#4a5568" strokeWidth="1.5" />
        {/* Crown ridge */}
        <polygon points="50,16 42,26 58,26" fill="#00d2ff" opacity="0.8" />

        {/* Optical Sensor Visor */}
        <path d="M30 46 L70 46 L66 56 L34 56 Z" fill="#0c1015" stroke="#00d2ff" strokeWidth="1.2" />
        <ellipse cx="50" cy="51" rx="14" ry="2.5" fill="#00d2ff" opacity="0.9" />
        <circle cx="50" cy="51" r="2" fill="#ffffff" />

        {/* Chin / Vocal grid */}
        <line x1="44" y1="68" x2="56" y2="68" stroke="#00d2ff" strokeWidth="1" />
        <line x1="46" y1="72" x2="54" y2="72" stroke="#00d2ff" strokeWidth="1" />

        {/* Side antennae / ports */}
        <circle cx="22" cy="50" r="3" fill="#1e293b" stroke="#00d2ff" strokeWidth="1" />
        <circle cx="78" cy="50" r="3" fill="#1e293b" stroke="#00d2ff" strokeWidth="1" />
      </svg>
    </div>
  );
};
