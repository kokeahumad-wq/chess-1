import React, { useState } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPieces';
import { PieceType, PieceColor } from '../types/chess';

interface ChessBoardProps {
  game: Chess;
  perspective: 'w' | 'b';
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: Square; to: Square } | null;
  hintSquare: Square | null;
  isEngineThinking: boolean;
  onSquareClick: (square: Square) => void;
  onPieceDrop: (from: Square, to: Square) => void;
  promotionPending: { from: Square; to: Square } | null;
  onPromote: (piece: PieceType) => void;
  onCancelPromotion: () => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  perspective,
  selectedSquare,
  validMoves,
  lastMove,
  hintSquare,
  isEngineThinking,
  onSquareClick,
  onPieceDrop,
  promotionPending,
  onPromote,
  onCancelPromotion,
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  // Files a-h and Ranks 1-8 based on perspective
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = perspective === 'w' ? files : [...files].reverse();
  const displayRanks = perspective === 'w' ? ranks : [...ranks].reverse();

  // Find King square if in check
  let checkSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === turn) {
          checkSquare = `${files[f]}${8 - r}` as Square;
        }
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (isEngineThinking) return;
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = (e.dataTransfer.getData('text/plain') as Square) || draggedSquare;
    setDraggedSquare(null);
    if (fromSquare && fromSquare !== targetSquare) {
      onPieceDrop(fromSquare, targetSquare);
    }
  };

  return (
    <div className="relative aspect-square w-full max-w-[620px] rounded-xl bg-gradient-to-br from-[#241c15] via-[#16120e] to-[#0c0a08] p-2.5 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] select-none">
      {/* Board Inset Frame */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-black/40 shadow-inner grid grid-cols-8 grid-rows-8">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const isLightSquare = (rIdx + fIdx) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLegalMove = validMoves.includes(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheck = checkSquare === square;
            const isHint = hintSquare === square;
            const isEnemyPiece = isLegalMove && piece && piece.color !== game.turn();

            return (
              <div
                key={square}
                data-square={square}
                onClick={() => onSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                  isLightSquare
                    ? 'bg-[#dfcfb2] hover:brightness-[1.03]'
                    : 'bg-[#553d29] hover:brightness-[1.05]'
                } ${
                  isSelected
                    ? 'ring-4 ring-inset ring-[#00d2ff] bg-[#00d2ff]/20'
                    : isCheck
                    ? 'bg-rose-600/50 ring-4 ring-inset ring-rose-500 animate-pulse'
                    : isLastMoveTo
                    ? 'ring-2 ring-inset ring-[#00d2ff]/80 bg-[#00d2ff]/15'
                    : isLastMoveFrom
                    ? 'bg-[#00d2ff]/10'
                    : isHint
                    ? 'ring-4 ring-inset ring-amber-400 bg-amber-400/25 animate-pulse'
                    : ''
                }`}
              >
                {/* Board Rank Label (Leftmost file) */}
                {fIdx === 0 && (
                  <span
                    className={`absolute top-0.5 left-1 font-mono text-[9px] sm:text-[11px] font-bold pointer-events-none ${
                      isLightSquare ? 'text-[#553d29]' : 'text-[#dfcfb2]'
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* Board File Label (Bottom rank) */}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 font-mono text-[9px] sm:text-[11px] font-bold pointer-events-none ${
                      isLightSquare ? 'text-[#553d29]' : 'text-[#dfcfb2]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Legal Move Indicators */}
                {isLegalMove && !piece && (
                  <div className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#00d2ff] opacity-80 shadow-[0_0_10px_#00d2ff] pointer-events-none z-10 animate-scale-in" />
                )}

                {isEnemyPiece && (
                  <div className="absolute inset-1 rounded-full border-2 sm:border-3 border-[#00d2ff] opacity-90 shadow-[0_0_12px_#00d2ff] pointer-events-none z-10" />
                )}

                {/* Chess Piece */}
                {piece && (
                  <div
                    draggable={!isEngineThinking && piece.color === game.turn()}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className={`w-[84%] h-[84%] flex items-center justify-center z-1 ${
                      piece.color === game.turn() && !isEngineThinking
                        ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform'
                        : 'cursor-pointer'
                    }`}
                  >
                    <ChessPiece type={piece.type as PieceType} color={piece.color as PieceColor} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal Overlay */}
      {promotionPending && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-30 p-4 animate-fade-in">
          <div className="bg-[#1e2024] border border-[#00d2ff]/40 rounded-xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-white mb-1">Coronación de Peón</h3>
            <p className="text-xs text-[#bbc9cf] mb-4">Elige la pieza para transformar tu peón:</p>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pieceType) => {
                const label =
                  pieceType === 'q'
                    ? 'Dama'
                    : pieceType === 'r'
                    ? 'Torre'
                    : pieceType === 'b'
                    ? 'Alfil'
                    : 'Caballo';

                return (
                  <button
                    key={pieceType}
                    onClick={() => onPromote(pieceType)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-[#282a2e] hover:bg-[#333539] hover:border-[#00d2ff] border border-white/10 transition-all group"
                  >
                    <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ChessPiece type={pieceType} color={game.turn() as PieceColor} />
                    </div>
                    <span className="text-xs font-semibold text-white mt-1">{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onCancelPromotion}
              className="text-xs text-[#bbc9cf] hover:text-white transition-colors underline"
            >
              Cancelar movimiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
