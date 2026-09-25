import React from 'react';
import { RobotAvatar } from './Avatars';
import { ChessPiece } from './ChessPieces';
import { PieceType } from '../types/chess';
import { Cpu } from 'lucide-react';

interface OpponentCardProps {
  isTurn: boolean;
  timeRemaining: number;
  initialTime: number;
  capturedByOpponent: PieceType[];
  capturedByPlayer: PieceType[];
  isThinking: boolean;
}

export const OpponentCard: React.FC<OpponentCardProps> = ({
  isTurn,
  timeRemaining,
  initialTime,
  capturedByOpponent,
  capturedByPlayer,
  isThinking,
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const tenths = Math.floor((timeRemaining % 1) * 10);

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / initialTime) * 100));

  const pieceValues: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const opponentMaterial = capturedByOpponent.reduce((acc, p) => acc + (pieceValues[p] || 0), 0);
  const playerMaterial = capturedByPlayer.reduce((acc, p) => acc + (pieceValues[p] || 0), 0);
  const advantage = opponentMaterial - playerMaterial;

  return (
    <div className="bg-[#1a1c20] rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden border border-white/5">
      {/* Subtle background glow */}
      <div className="absolute -left-8 -top-8 w-28 h-28 bg-[#00d2ff]/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-4">
        <div className="relative">
          <RobotAvatar className="w-14 h-14 sm:w-16 sm:h-16" />
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#282a2e] ring-2 ring-[#111317] flex items-center justify-center">
            <Cpu className="w-2.5 h-2.5 text-[#00d2ff]" />
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg sm:text-xl text-white font-bold truncate">
              AI Grandmaster
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#333539] text-[#bbc9cf] font-mono text-[11px] font-semibold">
              BOT
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#00d2ff]/20 text-[#00d2ff] font-mono text-[11px] font-semibold">
              Level 20
            </span>
          </div>
          <p className="text-xs text-[#00d2ff] font-mono truncate">Stockfish NNUE v16.2</p>
          <p className="text-xs text-[#859399] truncate">Rating 3200 ELO • FIDE Master</p>
        </div>
      </div>

      {/* Opponent Digital Clock */}
      <div
        className={`mt-4 p-3.5 rounded-lg bg-[#0c0e12] shadow-inner border transition-all ${
          isTurn ? 'border-[#00d2ff]/60 shadow-[0_0_15px_rgba(0,210,255,0.15)]' : 'border-white/5'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#bbc9cf]">
            Reloj Oponente
          </span>
          <span className="text-[11px] font-mono text-[#859399]">
            {isThinking ? (
              <span className="text-[#00d2ff] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping" />
                CALCULANDO...
              </span>
            ) : isTurn ? (
              'TURNO RIVAL'
            ) : (
              'EN ESPERA'
            )}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span
            className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight ${
              isTurn ? 'text-white' : 'text-[#bbc9cf]'
            }`}
          >
            {formattedTime}
            <span className="text-[#859399] text-lg sm:text-xl">.{tenths}</span>
          </span>
          <span className="text-[11px] font-mono text-[#859399] bg-[#1e2024] px-2 py-0.5 rounded">
            +0.0s
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#333539] rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-[#7bd0ff]"
            style={{ width: `${progressPercent}%`, opacity: isTurn ? 1 : 0.6 }}
          />
        </div>
      </div>

      {/* Captured by Opponent (White pieces) */}
      <div className="mt-3.5 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#bbc9cf]">
            Piezas Capturadas por Oponente
          </span>
          {advantage > 0 && (
            <span className="text-[11px] font-mono text-rose-400 font-bold">
              +{advantage} Ventaja
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1 min-h-[30px] bg-[#0c0e12] p-1.5 rounded">
          {capturedByOpponent.length === 0 ? (
            <span className="text-[11px] text-[#859399] italic px-1">Ninguna captura</span>
          ) : (
            capturedByOpponent.map((piece, idx) => (
              <div key={idx} className="w-5 h-5 flex items-center justify-center">
                <ChessPiece type={piece} color="w" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
