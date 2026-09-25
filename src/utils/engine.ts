import { Chess, Square, Move } from 'chess.js';

// Piece material values (in centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rank = 8 - parseInt(square[1], 10); // '8' -> 0, '1' -> 7
  return rank * 8 + file;
}

/**
 * Evaluates the board position in centipawns from White's perspective.
 */
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw() || game.isStalemate()) {
    return 0;
  }

  let evaluation = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      const squareIdx = r * 8 + f;
      const flippedIdx = (7 - r) * 8 + f;

      let posBonus = 0;
      switch (piece.type) {
        case 'p':
          posBonus = piece.color === 'w' ? PAWN_TABLE[squareIdx] : PAWN_TABLE[flippedIdx];
          break;
        case 'n':
          posBonus = piece.color === 'w' ? KNIGHT_TABLE[squareIdx] : KNIGHT_TABLE[flippedIdx];
          break;
        case 'b':
          posBonus = piece.color === 'w' ? BISHOP_TABLE[squareIdx] : BISHOP_TABLE[flippedIdx];
          break;
        case 'r':
          posBonus = piece.color === 'w' ? ROOK_TABLE[squareIdx] : ROOK_TABLE[flippedIdx];
          break;
        case 'q':
          posBonus = piece.color === 'w' ? QUEEN_TABLE[squareIdx] : QUEEN_TABLE[flippedIdx];
          break;
        case 'k':
          posBonus = piece.color === 'w' ? KING_TABLE[squareIdx] : KING_TABLE[flippedIdx];
          break;
      }

      const totalValue = val + posBonus;
      if (piece.color === 'w') {
        evaluation += totalValue;
      } else {
        evaluation -= totalValue;
      }
    }
  }

  return evaluation;
}

/**
 * Returns formatted eval string like "+0.42" or "-1.20" or "M3"
 */
export function formatEvaluation(scoreCentipawns: number): string {
  if (Math.abs(scoreCentipawns) > 50000) {
    const mateIn = Math.ceil((99999 - Math.abs(scoreCentipawns)) / 2);
    return scoreCentipawns > 0 ? `+M${mateIn}` : `-M${mateIn}`;
  }
  const score = (scoreCentipawns / 100).toFixed(2);
  return scoreCentipawns >= 0 ? `+${score}` : `${score}`;
}

/**
 * Opening book lines (common responses)
 */
const OPENING_BOOK: Record<string, string[]> = {
  // Initial position
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'c4', 'Nf3'],
  // 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1': ['e5', 'c5', 'e6', 'c6'],
  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2': ['Nf3', 'Nc3', 'Bc4'],
  // 1. e4 e5 2. Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': ['Nc6', 'Nf6'],
  // 1. e4 e5 2. Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3': ['Bb5', 'Bc4', 'd4'],
  // Ruy Lopez: 3. Bb5 a6
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3': ['a6', 'Nf6'],
  // 3. Bb5 a6 4. Ba4 Nf6 5. O-O
  'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 5': ['Be7', 'b5', 'Nxe4'],
};

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  // Move ordering: captures first
  moves.sort((a, b) => (b.captured ? 10 : 0) - (a.captured ? 10 : 0));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Calculates the best move for AI
 */
export function calculateBestMove(
  game: Chess,
  difficulty: 'easy' | 'medium' | 'hard' | 'grandmaster' = 'grandmaster'
): Move | null {
  const currentFen = game.fen();
  const bookMoves = OPENING_BOOK[currentFen];

  // Try opening book
  if (bookMoves && bookMoves.length > 0) {
    const selectedSan = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    const legalMoves = game.moves({ verbose: true });
    const match = legalMoves.find((m) => m.san === selectedSan);
    if (match) return match;
  }

  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // Search depth based on difficulty
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 2 : 3;

  const isMaximizing = game.turn() === 'w';
  let bestMove: Move = legalMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Shuffle for variety among equal lines
  legalMoves.sort(() => Math.random() - 0.5);
  // Sort captures first
  legalMoves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  for (const move of legalMoves) {
    game.move(move);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
    game.undo();

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

/**
 * Generates tactical hint for the human player
 */
export function getTacticalHint(game: Chess): { move: Move | null; advice: string } {
  const bestMove = calculateBestMove(game, 'grandmaster');
  if (!bestMove) {
    return { move: null, advice: 'No hay movimientos legales disponibles en esta posición.' };
  }

  let advice = `La mejor jugada es ${bestMove.san}. `;
  if (bestMove.captured) {
    advice += `Captura la pieza en ${bestMove.to} para ganar material valioso y desestabilizar la estructura rival.`;
  } else if (bestMove.san.includes('O-O')) {
    advice += `Enroque para poner a salvo a tu rey y activar la torre en la columna central.`;
  } else if (bestMove.piece === 'n') {
    advice += `Desarrolla el caballo hacia ${bestMove.to} para controlar casillas clave en el centro.`;
  } else if (bestMove.piece === 'b') {
    advice += `Ubica el alfil en una diagonal abierta para presionar las debilidades del oponente.`;
  } else if (bestMove.piece === 'p') {
    advice += `Avanza el peón a ${bestMove.to} ganando espacio territorial y abriendo paso a tus piezas.`;
  } else {
    advice += `Mejora la actividad y coordinación de tus piezas hacia casillas centrales.`;
  }

  return { move: bestMove, advice };
}

/**
 * Detects current opening name from FEN or move history
 */
export function detectOpening(movesSan: string[]): string {
  const seq = movesSan.slice(0, 8).join(' ');
  if (seq.startsWith('e4 e5 Nf3 Nc6 Bb5')) {
    if (seq.includes('a6 Ba4 Nf6')) return 'Defensa Ruy Lopez: Variante Berlinesa / Morphy';
    return 'Apertura Española (Ruy Lopez)';
  }
  if (seq.startsWith('e4 c5')) return 'Defensa Siciliana';
  if (seq.startsWith('d4 d5 c4')) return 'Gambito de Dama';
  if (seq.startsWith('e4 e5 Nf3 Nc6 Bc4')) return 'Apertura Italiana (Giuoco Piano)';
  if (seq.startsWith('e4 e6')) return 'Defensa Francesa';
  if (seq.startsWith('e4 c6')) return 'Defensa Caro-Kann';
  if (seq.startsWith('d4 Nf6 c4 g6')) return 'Defensa India de Rey';
  if (seq.startsWith('e4 e5')) return 'Apertura Abierta (Doble Peón de Rey)';
  if (seq.startsWith('d4')) return 'Apertura de Peón de Dama';
  if (seq.startsWith('c4')) return 'Apertura Inglesa';
  if (seq.startsWith('Nf3')) return 'Apertura Réti';
  return 'Partida Oficial FIDE';
}
