import React from 'react';
import { PieceType, PieceColor } from '../types/chess';

export const PieceGradients: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true" focusable="false">
      <defs>
        {/* Chrome & Metallic Specular for White Pieces */}
        <linearGradient id="stauntonWhiteGrad" x1="20%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#eef3f6" />
          <stop offset="75%" stopColor="#cad5dc" />
          <stop offset="100%" stopColor="#93a5b0" />
        </linearGradient>

        {/* Deep Ebony Finish for Black Pieces */}
        <linearGradient id="stauntonBlackGrad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#2d333b" />
          <stop offset="40%" stopColor="#1b1f24" />
          <stop offset="100%" stopColor="#0e1115" />
        </linearGradient>

        {/* Soft shadow base under pieces */}
        <radialGradient id="pieceBaseShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  const fillUrl = isWhite ? 'url(#stauntonWhiteGrad)' : 'url(#stauntonBlackGrad)';
  const strokeColor = isWhite ? '#485863' : '#64748b';
  const highlightColor = isWhite ? '#ffffff' : '#48535e';
  const strokeWidth = isWhite ? 1.8 : 1.5;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} transition-transform duration-150 drop-shadow-md select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base shadow */}
      <ellipse cx="50" cy="86" rx="30" ry="6" fill="url(#pieceBaseShadow)" opacity={isWhite ? 0.4 : 0.6} />

      {/* RENDER BY TYPE */}
      {type === 'p' && (
        <g id={isWhite ? 'Pawn-White' : 'Pawn-Black'}>
          {/* Pawn Pedestal & Body */}
          <path
            d="M26 84 C26 80, 31 78, 33 77 C35 73, 38 64, 40 50 C37 49, 36 47, 36 45 C36 43, 40 42, 45 42 L55 42 C60 42, 64 43, 64 45 C64 47, 63 49, 60 50 C62 64, 65 73, 67 77 C69 78, 74 80, 74 84 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Pawn Head Ball */}
          <circle cx="50" cy="30" r="14" fill={fillUrl} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Gloss highlight */}
          <path
            d="M42 24 C45 20, 52 20, 56 23"
            stroke={highlightColor}
            strokeWidth={isWhite ? 2.2 : 1.6}
            strokeLinecap="round"
          />
          {isWhite && <path d="M30 81 L70 81" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}
        </g>
      )}

      {type === 'r' && (
        <g id={isWhite ? 'Rook-White' : 'Rook-Black'}>
          {/* Base and tapered body */}
          <path
            d="M22 85 C22 81, 28 79, 30 78 C33 74, 36 60, 37 46 L63 46 C64 60, 67 74, 70 78 C72 79, 78 81, 78 85 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Castle Turrets (Merlons) */}
          <path
            d="M26 46 L26 24 L36 24 L36 32 L44 32 L44 24 L56 24 L56 32 L64 32 L64 24 L74 24 L74 46 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <path d="M28 46 L72 46" stroke={highlightColor} strokeWidth={isWhite ? 1.5 : 1.2} />
          {isWhite && <path d="M26 82 L74 82" stroke="#ffffff" strokeWidth="1.5" />}
        </g>
      )}

      {/* STAUNTON KNIGHT (Classic arched profile with carved mane, jaw, and eye) */}
      {type === 'n' && (
        <g id={isWhite ? 'Knight-White' : 'Knight-Black'}>
          <path
            d="M23 85 C23 81, 28 79, 31 78 C33 74, 33 71, 33 67 C30 65, 25 58, 22 52 C19 46, 21 41, 25 40 C28 39, 32 42, 33 40 C34 38, 33 34, 32 30 C30 24, 34 16, 42 14 C44 14, 46 16, 46 19 C48 16, 51 15, 54 16 C57 17, 56 21, 55 24 C60 21, 67 22, 70 27 C75 35, 74 48, 72 58 C70 68, 69 74, 71 78 C74 79, 77 81, 77 85 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Eye, muzzle & nostril details */}
          <circle cx="34" cy="31" r={2.2} fill={isWhite ? '#303b42' : '#8b9ba7'} />
          <path d="M24 45 C28 47, 32 46, 34 43" stroke={strokeColor} strokeWidth="1.5" />
          {/* Mane curls and carved Staunton notches */}
          <path d="M50 26 C53 32, 57 36, 64 38" stroke={highlightColor} strokeLinecap="round" strokeWidth={isWhite ? 2 : 1.6} />
          <path d="M53 38 C56 44, 59 48, 66 50" stroke={highlightColor} strokeLinecap="round" strokeWidth={isWhite ? 1.8 : 1.5} />
          <path d="M55 52 C58 58, 60 63, 67 65" stroke={highlightColor} strokeLinecap="round" strokeWidth={isWhite ? 1.8 : 1.4} />
          {isWhite && <path d="M27 82 L73 82" stroke="#ffffff" strokeWidth="1.5" />}
        </g>
      )}

      {type === 'b' && (
        <g id={isWhite ? 'Bishop-White' : 'Bishop-Black'}>
          {/* Base */}
          <path
            d="M24 85 C24 81, 29 79, 32 78 C34 74, 36 63, 38 52 C35 50, 34 46, 35 44 C36 42, 42 42, 46 42 L54 42 C58 42, 64 42, 65 44 C66 46, 65 50, 62 52 C64 63, 66 74, 68 78 C71 79, 76 81, 76 85 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Mitre body */}
          <path
            d="M35 42 C33 34, 35 22, 50 16 C65 22, 67 34, 65 42 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Mitre cut (slash) */}
          <path d="M46 22 L59 34" stroke={isWhite ? '#526470' : '#000000'} strokeWidth="2.5" />
          {/* Finial orb */}
          <circle cx="50" cy="13" r="3.5" fill={fillUrl} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M38 27 C42 23, 48 22, 53 25" stroke={highlightColor} strokeLinecap="round" strokeWidth={isWhite ? 1.8 : 1.3} />
          {isWhite && <path d="M28 82 L72 82" stroke="#ffffff" strokeWidth="1.5" />}
        </g>
      )}

      {type === 'q' && (
        <g id={isWhite ? 'Queen-White' : 'Queen-Black'}>
          {/* Base and pedestal */}
          <path
            d="M22 86 C22 81, 27 79, 31 78 C34 74, 36 60, 39 48 L61 48 C64 60, 66 74, 69 78 C73 79, 78 81, 78 86 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Multi-point Crown */}
          <path
            d="M27 48 L22 28 L34 38 L42 23 L50 37 L58 23 L66 38 L78 28 L73 48 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Crown Pearls */}
          <circle cx="21" cy="26" r="2.8" fill={isWhite ? '#ffffff' : '#2d333b'} stroke={strokeColor} />
          <circle cx="42" cy="21" r="2.8" fill={isWhite ? '#ffffff' : '#2d333b'} stroke={strokeColor} />
          <circle cx="50" cy="17" r="3.2" fill={isWhite ? '#ffffff' : '#2d333b'} stroke={strokeColor} />
          <circle cx="58" cy="21" r="2.8" fill={isWhite ? '#ffffff' : '#2d333b'} stroke={strokeColor} />
          <circle cx="79" cy="26" r="2.8" fill={isWhite ? '#ffffff' : '#2d333b'} stroke={strokeColor} />
          {isWhite && <path d="M27 82 L73 82" stroke="#ffffff" strokeWidth="1.5" />}
        </g>
      )}

      {type === 'k' && (
        <g id={isWhite ? 'King-White' : 'King-Black'}>
          {/* Base and pedestal */}
          <path
            d="M22 86 C22 81, 27 79, 31 78 C34 74, 36 60, 39 48 L61 48 C64 60, 66 74, 69 78 C73 79, 78 81, 78 86 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* King Robe dome */}
          <path
            d="M28 48 C24 38, 30 26, 50 26 C70 26, 76 38, 72 48 Z"
            fill={fillUrl}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Royal Cross Finial */}
          <path
            d="M50 11 L50 24 M44 16 L56 16"
            stroke={isWhite ? '#526470' : '#7bd0ff'}
            strokeLinecap="square"
            strokeWidth={isWhite ? 3 : 2.5}
          />
          {isWhite && (
            <>
              <path d="M50 12 L50 23 M45 16 L55 16" stroke="#ffffff" strokeWidth="1.6" />
              <path d="M26 82 L74 82" stroke="#ffffff" strokeWidth="1.5" />
            </>
          )}
        </g>
      )}
    </svg>
  );
};
