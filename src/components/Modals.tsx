import React from 'react';
import { GameStatus, GameSettings } from '../types/chess';
import { Trophy, AlertTriangle, Lightbulb, BarChart2, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  status: GameStatus;
  winner: 'w' | 'b' | 'draw' | null;
  reason: string;
  onRestart: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  winner,
  reason,
  onRestart,
  onClose,
}) => {
  React.useEffect(() => {
    if (winner === 'w') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00d2ff', '#7bd0ff', '#ffffff', '#fedeb2'],
        });
      } catch {
        // fallback
      }
    }
  }, [winner]);

  const isStitchWinner = winner === 'w';
  const isDraw = winner === 'draw';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#1a1c20] border border-[#00d2ff]/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isStitchWinner ? 'bg-[#00d2ff]/20' : isDraw ? 'bg-amber-500/20' : 'bg-rose-500/20'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              isStitchWinner
                ? 'bg-[#00d2ff]/20 text-[#00d2ff]'
                : isDraw
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isStitchWinner ? <Trophy className="w-9 h-9" /> : <AlertTriangle className="w-9 h-9" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
            {isStitchWinner
              ? '¡Victoria de Stitch!'
              : isDraw
              ? 'Partida en Tablas'
              : 'Victoria de AI Grandmaster'}
          </h2>

          <p className="text-sm text-[#bbc9cf] font-mono mb-4">{reason}</p>

          <div className="p-3 bg-[#0c0e12] rounded-xl border border-white/5 w-full mb-6 text-xs text-[#859399]">
            {isStitchWinner
              ? 'Has derrotado al Gran Maestro de inteligencia artificial en una partida magistral. +16 puntos ELO simulados.'
              : isDraw
              ? 'Una partida de altísima precisión técnica. Ambos bandos han firmado la paz en el tablero.'
              : 'AI Grandmaster ha impuesto su cálculo táctico de 28 capas NNUE. ¡Intenta de nuevo para mejorar tu juego!'}
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onRestart}
              className="flex-1 py-3 px-4 rounded-xl bg-[#00d2ff] hover:bg-[#7bd0ff] text-[#003543] font-heading font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Revancha / Nueva Partida</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-[#282a2e] hover:bg-[#333539] text-white text-sm font-medium transition-colors"
            >
              Ver Tablero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HintModalProps {
  advice: string;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ advice, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1c20] border border-amber-400/40 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#859399] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base">Pista Táctica del Motor</h3>
            <p className="text-[11px] text-[#bbc9cf] font-mono">Stockfish NNUE Deep Search</p>
          </div>
        </div>

        <p className="text-xs text-[#e2e2e8] leading-relaxed mb-4 p-3 bg-[#0c0e12] rounded-xl border border-white/5">
          {advice}
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#281800] font-heading font-bold text-xs transition-colors"
        >
          Entendido, continuar
        </button>
      </div>
    </div>
  );
};

interface AnalysisModalProps {
  evaluationScore: string;
  openingName: string;
  fideNotation: string;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  evaluationScore,
  openingName,
  fideNotation,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1c20] border border-[#00d2ff]/40 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#859399] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base">Análisis Rápido de Posición</h3>
            <p className="text-[11px] text-[#00d2ff] font-mono">Profundidad IA: 28 Capas NNUE</p>
          </div>
        </div>

        <div className="space-y-3 mb-5 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-[#0c0e12] rounded-lg border border-white/5">
            <span className="text-[#bbc9cf]">Evaluación Centipeones:</span>
            <span className="font-mono font-bold text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded">
              {evaluationScore}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#0c0e12] rounded-lg border border-white/5">
            <span className="text-[#bbc9cf]">Apertura Detectada:</span>
            <span className="font-mono text-white text-right max-w-[220px] truncate">
              {openingName}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#0c0e12] rounded-lg border border-white/5">
            <span className="text-[#bbc9cf]">Estado Estructural:</span>
            <span className="text-emerald-400 font-medium">Equilibrio dinámico en el centro</span>
          </div>

          <div className="p-3 bg-[#0c0e12] rounded-lg border border-white/5">
            <span className="text-[#859399] block mb-1">FEN Actual:</span>
            <span className="font-mono text-[10px] text-[#bbc9cf] break-all select-all block">
              {fideNotation}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[#00d2ff] hover:bg-[#7bd0ff] text-[#003543] font-heading font-bold text-xs transition-colors"
        >
          Cerrar Análisis
        </button>
      </div>
    </div>
  );
};
