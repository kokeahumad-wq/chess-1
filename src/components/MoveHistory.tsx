import React, { useRef, useEffect } from 'react';
import { MoveRecord } from '../types/chess';
import {
  ChevronsLeft,
  ChevronLeft,
  Play,
  Pause,
  ChevronRight,
  ChevronsRight,
  ListOrdered,
} from 'lucide-react';

interface MoveHistoryProps {
  moves: MoveRecord[];
  currentMoveIndex: number;
  onGoToMove: (index: number) => void;
  isPlayingReplay: boolean;
  onToggleReplay: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onGoToMove,
  isPlayingReplay,
  onToggleReplay,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Total ply (half-moves) count
  const totalPly = moves.reduce((count, m) => count + (m.white ? 1 : 0) + (m.black ? 1 : 0), 0);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves.length]);

  return (
    <div className="bg-[#1a1c20] rounded-xl shadow-xl flex flex-col overflow-hidden border border-white/5">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#282a2e]/60 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[#00d2ff]" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
            Notación de Movimientos
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#bbc9cf]">
          {totalPly} Jugadas ({moves.length} Turnos)
        </span>
      </div>

      {/* Tabular Move List */}
      <div
        ref={listRef}
        className="max-h-[190px] overflow-y-auto px-3 py-2 flex flex-col gap-1 font-mono text-xs select-none"
      >
        {moves.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#859399] italic">
            Comienza la partida haciendo tu primer movimiento.
          </div>
        ) : (
          moves.map((m, idx) => {
            const isLatest = idx === moves.length - 1;
            const whitePlyIndex = idx * 2;
            const blackPlyIndex = idx * 2 + 1;

            const isWhiteActive = currentMoveIndex === whitePlyIndex;
            const isBlackActive = currentMoveIndex === blackPlyIndex;

            return (
              <div
                key={m.moveNumber}
                className={`grid grid-cols-12 py-1 px-2 rounded transition-colors text-xs items-center ${
                  isLatest && isBlackActive
                    ? 'bg-[#00d2ff]/10 border-l-2 border-[#00d2ff]'
                    : 'hover:bg-[#282a2e]/60'
                }`}
              >
                <span className="col-span-2 text-[#859399] font-medium">{m.moveNumber}.</span>

                {/* White Move */}
                <button
                  onClick={() => onGoToMove(whitePlyIndex)}
                  className={`col-span-5 text-left py-0.5 px-1 rounded transition-colors ${
                    isWhiteActive
                      ? 'bg-[#00d2ff]/20 text-[#00d2ff] font-bold'
                      : 'text-white hover:text-[#00d2ff]'
                  }`}
                >
                  {m.white || ''}
                </button>

                {/* Black Move */}
                {m.black ? (
                  <button
                    onClick={() => onGoToMove(blackPlyIndex)}
                    className={`col-span-5 text-left py-0.5 px-1 rounded transition-colors flex items-center justify-between ${
                      isBlackActive
                        ? 'bg-[#00d2ff]/20 text-[#00d2ff] font-bold'
                        : 'text-[#bbc9cf] hover:text-white'
                    }`}
                  >
                    <span>{m.black}</span>
                    {isLatest && (
                      <span className="text-[9px] px-1 bg-[#00d2ff] text-[#003543] font-bold rounded">
                        ÚLTIMO
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="col-span-5 text-[#859399]">...</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Replay Controls */}
      <div className="p-1.5 bg-[#0c0e12] flex items-center justify-center gap-1 border-t border-white/5">
        <button
          onClick={() => onGoToMove(0)}
          disabled={totalPly === 0}
          className="p-1.5 rounded hover:bg-[#282a2e] text-[#bbc9cf] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Primera jugada"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onGoToMove(Math.max(0, currentMoveIndex - 1))}
          disabled={currentMoveIndex <= 0}
          className="p-1.5 rounded hover:bg-[#282a2e] text-[#bbc9cf] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Jugada anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleReplay}
          disabled={totalPly === 0}
          className="p-1.5 rounded hover:bg-[#282a2e] text-[#00d2ff] hover:text-[#7bd0ff] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={isPlayingReplay ? 'Pausar' : 'Auto-reproducción'}
        >
          {isPlayingReplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onGoToMove(Math.min(totalPly - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= totalPly - 1}
          className="p-1.5 rounded hover:bg-[#282a2e] text-[#bbc9cf] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Jugada siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onGoToMove(totalPly - 1)}
          disabled={currentMoveIndex >= totalPly - 1}
          className="p-1.5 rounded hover:bg-[#282a2e] text-[#bbc9cf] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Última jugada"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
