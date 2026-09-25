export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface MoveRecord {
  moveNumber: number;
  white?: string;
  black?: string;
  whiteSan?: string;
  blackSan?: string;
  fenAfterWhite?: string;
  fenAfterBlack?: string;
  comment?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface GameSettings {
  perspective: 'w' | 'b';
  pieceStyle: 'staunton1972' | 'modern';
  soundEnabled: boolean;
  soundTheme: 'wood' | 'arcade' | 'mute';
  autoQueen: boolean;
  timeControl: number; // in seconds (e.g. 600 for 10 min)
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'grandmaster';
}

export type GameStatus = 'in_progress' | 'checkmate' | 'draw' | 'stalemate' | 'resigned' | 'timeout';
