import React from 'react';
import { StitchAvatar } from './Avatars';
import { ChessPiece } from './ChessPieces';
import { PieceType, PieceColor, GameSettings } from '../types/chess';
import { Handshake, Lightbulb, BarChart3, Flag, Sliders } from 'lucide-react';

interface PlayerCardProps {
  isTurn: boolean;
  timeRemaining: number; // in seconds
  initialTime: number;
  capturedByPlayer: PieceType[];
  capturedByOpponent: PieceType[];
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOfferDraw: () => void;
  onTacticalHint: () => void;
  onQuickAnalysis: () => void;
  onResign: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  isTurn,
  timeRemaining,
  initialTime,
  capturedByPlayer,
  capturedByOpponent,
  settings,
  onUpdateSettings,
  onOfferDraw,
  onTacticalHint,
  onQuickAnalysis,
  onResign,
}) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60);
  const tenths = Math.floor((timeRemaining % 1) * 10);

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / initialTime) * 100));

  // Compute piece material values
  const pieceValues: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const playerMaterial = capturedByPlayer.reduce((acc, p) => acc + (pieceValues[p] || 0), 0);
  const opponentMaterial = capturedByOpponent.reduce((acc, p) => acc + (pieceValues[p] || 0), 0);
  const advantage = playerMaterial - opponentMaterial;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Main Player Profile Card */}
      <div className="bg-[#1a1c20] rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden border border-white/5">
        {/* Subtle cyan ambient glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#00d2ff]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="relative">
            <StitchAvatar className="w-14 h-14 sm:w-16 sm:h-16" />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00d2ff] ring-2 ring-[#111317] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#111317] animate-ping" />
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg sm:text-xl text-white font-bold truncate">Stitch</span>
              <span className="px-1.5 py-0.5 rounded bg-[#00d2ff]/20 text-[#00d2ff] font-mono text-xs font-semibold">
                GM
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-medium">
                Level 15
              </span>
            </div>
            <p className="text-xs text-[#bbc9cf] truncate">Gran Maestro • 2680 ELO</p>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#859399]">
              <span className="text-[#00d2ff]">🛡️</span>
              <span className="font-mono text-[11px]">FIDE ID: 4192083</span>
            </div>
          </div>
        </div>

        {/* Dynamic Digital Clock */}
        <div
          className={`mt-4 p-3.5 rounded-lg bg-[#0c0e12] shadow-inner border transition-all ${
            isTurn ? 'border-[#00d2ff]/60 shadow-[0_0_15px_rgba(0,210,255,0.15)]' : 'border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#bbc9cf]">
              Tu Cronómetro
            </span>
            {isTurn ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#00d2ff] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" /> ACTIVO
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#859399]">EN ESPERA</span>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <span
              className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight ${
                timeRemaining <= 30
                  ? 'text-rose-400 animate-pulse'
                  : isTurn
                  ? 'text-white'
                  : 'text-[#bbc9cf]'
              }`}
            >
              {formattedTime}
              <span className="text-[#859399] text-lg sm:text-xl">.{tenths}</span>
            </span>
            <span className="text-[11px] font-mono text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded">
              +0.0s inc
            </span>
          </div>

          {/* Clock Progress Bar */}
          <div className="w-full h-1.5 bg-[#333539] rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                timeRemaining <= 30 ? 'bg-rose-500' : 'bg-[#00d2ff]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Turn Status Indicator */}
        <div
          className={`mt-3 w-full py-2.5 px-4 rounded-lg font-heading text-sm sm:text-base font-bold flex items-center justify-center gap-2 select-none transition-all ${
            isTurn
              ? 'bg-[#00d2ff] text-[#003543] shadow-[0_0_20px_rgba(0,210,255,0.4)]'
              : 'bg-[#1e2024] text-[#859399] border border-white/5'
          }`}
        >
          {isTurn ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#003543] animate-ping" />
              <span>🟢 TU TURNO</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#859399]" />
              <span>ESPERANDO OPONENTE...</span>
            </>
          )}
        </div>
      </div>

      {/* Tactical Actions Grid */}
      <div className="bg-[#1a1c20] rounded-xl p-3.5 shadow-xl border border-white/5">
        <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#bbc9cf] mb-2.5">
          Acciones de Competición
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOfferDraw}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-white text-xs font-medium border border-white/5 hover:border-[#00d2ff]/40 transition-all group"
          >
            <Handshake className="w-4 h-4 text-[#859399] group-hover:text-[#00d2ff] transition-colors" />
            <span>Ofrecer Tablas</span>
          </button>
          <button
            onClick={onTacticalHint}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-white text-xs font-medium border border-white/5 hover:border-[#00d2ff]/40 transition-all group"
          >
            <Lightbulb className="w-4 h-4 text-[#859399] group-hover:text-amber-400 transition-colors" />
            <span>Pista Táctica</span>
          </button>
          <button
            onClick={onQuickAnalysis}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-white text-xs font-medium border border-white/5 hover:border-[#00d2ff]/40 transition-all group"
          >
            <BarChart3 className="w-4 h-4 text-[#859399] group-hover:text-[#00d2ff] transition-colors" />
            <span>Análisis Rápido</span>
          </button>
          <button
            onClick={onResign}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded bg-[#1e2024] hover:bg-rose-950/40 text-white hover:text-rose-300 text-xs font-medium border border-white/5 hover:border-rose-500/40 transition-all group"
          >
            <Flag className="w-4 h-4 text-[#859399] group-hover:text-rose-400 transition-colors" />
            <span>Rendirse</span>
          </button>
        </div>
      </div>

      {/* Board & Match Quick Preferences */}
      <div className="bg-[#1a1c20] rounded-xl p-3.5 shadow-xl border border-white/5 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#bbc9cf]">
            Ajustes del Tablero
          </span>
          <Sliders className="w-3.5 h-3.5 text-[#00d2ff]" />
        </div>

        <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#1e2024] text-xs">
          <span className="text-white">Perspectiva</span>
          <button
            onClick={() =>
              onUpdateSettings({ perspective: settings.perspective === 'w' ? 'b' : 'w' })
            }
            className="text-[11px] font-semibold text-[#00d2ff] bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 px-2 py-0.5 rounded transition-colors"
          >
            {settings.perspective === 'w' ? 'Blancas (Abajo)' : 'Negras (Abajo)'}
          </button>
        </div>

        <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#1e2024] text-xs">
          <span className="text-white">Estilo de Piezas</span>
          <span className="text-[11px] text-[#bbc9cf]">Staunton Clásico 1972</span>
        </div>

        <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#1e2024] text-xs">
          <span className="text-white">Efectos Hápticos y Sonido</span>
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
              settings.soundEnabled
                ? 'text-[#00d2ff] bg-[#00d2ff]/10'
                : 'text-[#859399] bg-white/5'
            }`}
          >
            {settings.soundEnabled ? 'Activo (Madera)' : 'Silencio'}
          </button>
        </div>

        <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#1e2024] text-xs">
          <label htmlFor="auto-queen" className="text-white cursor-pointer select-none">
            Auto-Coronación (Dama)
          </label>
          <input
            id="auto-queen"
            type="checkbox"
            checked={settings.autoQueen}
            onChange={(e) => onUpdateSettings({ autoQueen: e.target.checked })}
            className="accent-[#00d2ff] w-4 h-4 cursor-pointer rounded"
          />
        </div>
      </div>

      {/* Captured Pieces Tray */}
      <div className="bg-[#1a1c20] rounded-xl p-3 shadow-xl border border-white/5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#bbc9cf]">
            Piezas Capturadas por Stitch
          </span>
          {advantage > 0 && (
            <span className="text-[11px] font-mono text-[#00d2ff] font-bold">
              +{advantage} Ventaja
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1 min-h-[32px] bg-[#0c0e12] p-1.5 rounded">
          {capturedByPlayer.length === 0 ? (
            <span className="text-[11px] text-[#859399] italic px-1">Ninguna captura aún</span>
          ) : (
            capturedByPlayer.map((piece, idx) => (
              <div key={idx} className="w-5 h-5 flex items-center justify-center">
                <ChessPiece type={piece} color="b" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
