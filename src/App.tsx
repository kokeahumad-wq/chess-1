import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceGradients } from './components/ChessPieces';
import { ChessBoard } from './components/ChessBoard';
import { PlayerCard } from './components/PlayerCard';
import { OpponentCard } from './components/OpponentCard';
import { ChatBox } from './components/ChatBox';
import { MoveHistory } from './components/MoveHistory';
import { GameOverModal, HintModal, AnalysisModal } from './components/Modals';
import { playSound } from './utils/audio';
import {
  evaluateBoard,
  formatEvaluation,
  calculateBestMove,
  getTacticalHint,
  detectOpening,
} from './utils/engine';
import {
  PieceType,
  PieceColor,
  MoveRecord,
  ChatMessage,
  GameSettings,
  GameStatus,
} from './types/chess';
import {
  Volume2,
  VolumeX,
  Maximize2,
  RotateCw,
  Download,
  Copy,
  Check,
  Menu,
  Wifi,
  Sparkles,
  HelpCircle,
  BarChart,
  User as UserIcon,
  Home,
  Settings as SettingsIcon,
  PlayCircle,
} from 'lucide-react';

const INITIAL_TIME_SECONDS = 10 * 60; // 10 minutes blitz

export default function App() {
  // Game state instance (using ref for mutable logic and state for re-renders)
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [boardHistory, setBoardHistory] = useState<string[]>([chessRef.current.fen()]);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(-1);

  // Selection & Moves
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: Square; to: Square } | null>(null);

  // Engine state
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [evalScore, setEvalScore] = useState<number>(0);

  // Clocks
  const [stitchTime, setStitchTime] = useState(INITIAL_TIME_SECONDS);
  const [opponentTime, setOpponentTime] = useState(INITIAL_TIME_SECONDS);
  const [gameStatus, setGameStatus] = useState<GameStatus>('in_progress');
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    perspective: 'w',
    pieceStyle: 'staunton1972',
    soundEnabled: true,
    soundTheme: 'wood',
    autoQueen: true,
    timeControl: INITIAL_TIME_SECONDS,
    aiDifficulty: 'grandmaster',
  });

  // Modals & UI states
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [hintModalAdvice, setHintModalAdvice] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'play' | 'stats' | 'profile' | 'settings'>('play');
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);

  // Captured pieces
  const [capturedByStitch, setCapturedByStitch] = useState<PieceType[]>([]);
  const [capturedByOpponent, setCapturedByOpponent] = useState<PieceType[]>([]);

  // Interactive Live Chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      senderName: 'AI Grandmaster',
      text: '¡Buena suerte! Una elección sólida para esta partida. ¿Estás listo para el desafío?',
      timestamp: '13:24',
    },
    {
      id: 'init-2',
      sender: 'user',
      senderName: 'Stitch (Tú)',
      text: 'Analizando las líneas centrales, preparo un contraataque en el flanco de dama.',
      timestamp: '13:24',
    },
    {
      id: 'init-3',
      sender: 'ai',
      senderName: 'AI Grandmaster',
      text: 'Interesante sacrificio posicional. Veamos si resistes la presión en f7.',
      timestamp: '13:25',
    },
  ]);

  // Recalculate captured pieces from current board
  const updateCapturedPieces = useCallback((game: Chess) => {
    const fullPieces: Record<PieceColor, Record<PieceType, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    const board = game.board();
    const currentCounts: Record<PieceColor, Record<PieceType, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece) {
          currentCounts[piece.color as PieceColor][piece.type as PieceType]++;
        }
      }
    }

    const stitchCaptures: PieceType[] = [];
    const oppCaptures: PieceType[] = [];

    (['p', 'n', 'b', 'r', 'q'] as PieceType[]).forEach((type) => {
      const missingBlack = fullPieces.b[type] - currentCounts.b[type];
      for (let i = 0; i < missingBlack; i++) stitchCaptures.push(type);

      const missingWhite = fullPieces.w[type] - currentCounts.w[type];
      for (let i = 0; i < missingWhite; i++) oppCaptures.push(type);
    });

    setCapturedByStitch(stitchCaptures);
    setCapturedByOpponent(oppCaptures);
  }, []);

  // Update Move History
  const recordMove = useCallback((move: Move) => {
    setMoveHistory((prev) => {
      const isWhite = move.color === 'w';
      if (isWhite) {
        return [
          ...prev,
          {
            moveNumber: prev.length + 1,
            white: move.san,
            whiteSan: move.san,
            fenAfterWhite: chessRef.current.fen(),
          },
        ];
      } else {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        last.black = move.san;
        last.blackSan = move.san;
        last.fenAfterBlack = chessRef.current.fen();
        return [...prev.slice(0, prev.length - 1), last];
      }
    });
  }, []);

  // Handle Game Over
  const checkGameOver = useCallback((game: Chess) => {
    if (game.isCheckmate()) {
      const winningColor = game.turn() === 'w' ? 'b' : 'w';
      setGameStatus('checkmate');
      setWinner(winningColor);
      setGameOverReason(
        winningColor === 'w'
          ? '¡Jaque mate! Stitch se corona campeón.'
          : '¡Jaque mate! AI Grandmaster gana la partida.'
      );
      setShowGameOverModal(true);
      playSound(winningColor === 'w' ? 'victory' : 'defeat', settings.soundEnabled);
      return true;
    }
    if (game.isDraw()) {
      setGameStatus('draw');
      setWinner('draw');
      let reason = 'Tablas por falta de material o regla de 50 movimientos.';
      if (game.isStalemate()) reason = 'Tablas por ahogado (Stalemate).';
      if (game.isThreefoldRepetition()) reason = 'Tablas por triple repetición.';
      setGameOverReason(reason);
      setShowGameOverModal(true);
      return true;
    }
    return false;
  }, [settings.soundEnabled]);

  // Execute a chess move
  const executeMove = useCallback(
    (from: Square, to: Square, promotion: PieceType = 'q') => {
      const game = chessRef.current;
      try {
        const move = game.move({ from, to, promotion });
        if (!move) return false;

        setFen(game.fen());
        setBoardHistory((prev) => [...prev, game.fen()]);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setValidMoves([]);
        setHintSquare(null);
        recordMove(move);
        updateCapturedPieces(game);

        // Sound effects
        if (game.isCheckmate() || game.inCheck()) {
          playSound('check', settings.soundEnabled);
        } else if (move.flags.includes('k') || move.flags.includes('q')) {
          playSound('castle', settings.soundEnabled);
        } else if (move.captured) {
          playSound('capture', settings.soundEnabled);
        } else {
          playSound('move', settings.soundEnabled);
        }

        // Eval score
        setEvalScore(evaluateBoard(game));

        const isOver = checkGameOver(game);
        if (!isOver && game.turn() === 'b') {
          // AI turn trigger
          setIsEngineThinking(true);
          const thinkTime = Math.floor(Math.random() * 500) + 600; // realistic thinking latency
          setTimeout(() => {
            if (chessRef.current.turn() === 'b') {
              const aiMove = calculateBestMove(chessRef.current, settings.aiDifficulty);
              if (aiMove) {
                const moveResult = chessRef.current.move(aiMove);
                if (moveResult) {
                  setFen(chessRef.current.fen());
                  setBoardHistory((prev) => [...prev, chessRef.current.fen()]);
                  setLastMove({ from: aiMove.from, to: aiMove.to });
                  recordMove(moveResult);
                  updateCapturedPieces(chessRef.current);
                  setEvalScore(evaluateBoard(chessRef.current));

                  if (chessRef.current.isCheckmate() || chessRef.current.inCheck()) {
                    playSound('check', settings.soundEnabled);
                  } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
                    playSound('castle', settings.soundEnabled);
                  } else if (moveResult.captured) {
                    playSound('capture', settings.soundEnabled);
                  } else {
                    playSound('move', settings.soundEnabled);
                  }

                  checkGameOver(chessRef.current);
                }
              }
            }
            setIsEngineThinking(false);
          }, thinkTime);
        }

        return true;
      } catch {
        return false;
      }
    },
    [checkGameOver, recordMove, settings.aiDifficulty, settings.soundEnabled, updateCapturedPieces]
  );

  // Square Click handler
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (gameStatus !== 'in_progress' || isEngineThinking) return;
      const game = chessRef.current;

      // If user clicks a valid move destination for currently selected piece
      if (selectedSquare && validMoves.includes(square)) {
        const piece = game.get(selectedSquare);
        // Check for pawn promotion
        const isPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          if (settings.autoQueen) {
            executeMove(selectedSquare, square, 'q');
          } else {
            setPromotionPending({ from: selectedSquare, to: square });
          }
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }

      // Otherwise selecting a piece of the current turn
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setValidMoves(moves.map((m) => m.to));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    },
    [executeMove, gameStatus, isEngineThinking, selectedSquare, settings.autoQueen, validMoves]
  );

  // Piece Drop Handler
  const handlePieceDrop = useCallback(
    (from: Square, to: Square) => {
      if (gameStatus !== 'in_progress' || isEngineThinking) return;
      const game = chessRef.current;
      const piece = game.get(from);
      if (!piece || piece.color !== game.turn()) return;

      const legalMoves = game.moves({ square: from, verbose: true });
      const isValid = legalMoves.some((m) => m.to === to);
      if (!isValid) return;

      const isPromotion =
        piece.type === 'p' &&
        ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));

      if (isPromotion) {
        if (settings.autoQueen) {
          executeMove(from, to, 'q');
        } else {
          setPromotionPending({ from, to });
        }
        return;
      }

      executeMove(from, to);
    },
    [executeMove, gameStatus, isEngineThinking, settings.autoQueen]
  );

  // Promotion completion
  const handlePromote = (promotedType: PieceType) => {
    if (promotionPending) {
      executeMove(promotionPending.from, promotionPending.to, promotedType);
      setPromotionPending(null);
    }
  };

  // Turn clock timers
  useEffect(() => {
    if (gameStatus !== 'in_progress') return;

    const interval = setInterval(() => {
      const activeColor = chessRef.current.turn();
      if (activeColor === 'w') {
        setStitchTime((prev) => {
          if (prev <= 0.1) {
            setGameStatus('timeout');
            setWinner('b');
            setGameOverReason('Tiempo agotado para Stitch. Victoria de AI Grandmaster.');
            setShowGameOverModal(true);
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
      } else {
        setOpponentTime((prev) => {
          if (prev <= 0.1) {
            setGameStatus('timeout');
            setWinner('w');
            setGameOverReason('Tiempo agotado para AI Grandmaster. Victoria de Stitch.');
            setShowGameOverModal(true);
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Tactical Actions Handlers
  const handleOfferDraw = () => {
    const absEval = Math.abs(evalScore);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (absEval < 150) {
      // AI accepts draw
      setGameStatus('draw');
      setWinner('draw');
      setGameOverReason('Tablas acordadas de mutuo acuerdo con AI Grandmaster.');
      setShowGameOverModal(true);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'ai',
          senderName: 'AI Grandmaster',
          text: 'Evaluación cercana a la igualdad posicional (±0.00). Acepto tu oferta de tablas.',
          timestamp: now,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'ai',
          senderName: 'AI Grandmaster',
          text: 'Declino la oferta de tablas. Mi evaluación detecta ventaja táctica suficiente para continuar presionando.',
          timestamp: now,
        },
      ]);
      playSound('notify', settings.soundEnabled);
    }
  };

  const handleTacticalHint = () => {
    const { move, advice } = getTacticalHint(chessRef.current);
    if (move) {
      setHintSquare(move.from);
      setHintModalAdvice(advice);
      playSound('notify', settings.soundEnabled);
    }
  };

  const handleResign = () => {
    if (window.confirm('¿Estás seguro de que deseas rendirte?')) {
      setGameStatus('resigned');
      setWinner('b');
      setGameOverReason('Stitch ha abandonado la partida.');
      setShowGameOverModal(true);
      playSound('defeat', settings.soundEnabled);
    }
  };

  const handleRestart = () => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setBoardHistory([chessRef.current.fen()]);
    setMoveHistory([]);
    setCurrentPlyIndex(-1);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setHintSquare(null);
    setPromotionPending(null);
    setIsEngineThinking(false);
    setEvalScore(0);
    setStitchTime(settings.timeControl);
    setOpponentTime(settings.timeControl);
    setGameStatus('in_progress');
    setWinner(null);
    setGameOverReason('');
    setShowGameOverModal(false);
    setCapturedByStitch([]);
    setCapturedByOpponent([]);
    playSound('move', settings.soundEnabled);
  };

  // Replay Navigation
  const handleGoToMove = (plyIndex: number) => {
    if (plyIndex < 0 || plyIndex >= boardHistory.length) return;
    setCurrentPlyIndex(plyIndex);
    // Display FEN at that state
    setFen(boardHistory[plyIndex]);
  };

  // Auto-play replay
  useEffect(() => {
    if (!isPlayingReplay) return;
    const interval = setInterval(() => {
      setCurrentPlyIndex((prev) => {
        if (prev >= boardHistory.length - 1) {
          setIsPlayingReplay(false);
          return prev;
        }
        const next = prev + 1;
        setFen(boardHistory[next]);
        return next;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [isPlayingReplay, boardHistory]);

  // Chat message submission
  const handleSendMessage = (text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      senderName: 'Stitch (Tú)',
      text,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Simulated Smart Grandmaster Response in Spanish
    setTimeout(() => {
      const lower = text.toLowerCase();
      let aiResponse = 'Interesante observación. En este tipo de posiciones, la profilaxis y la seguridad del rey son vitales.';

      if (lower.includes('hola') || lower.includes('buenas')) {
        aiResponse = '¡Saludos, Gran Maestro Stitch! Es un honor disputar esta partida contigo. Juguemos con la máxima precisión.';
      } else if (lower.includes('jaque') || lower.includes('mate')) {
        aiResponse = 'El cálculo de variantes forzadas es mi especialidad. 28 capas NNUE analizan cada jaque en el tablero.';
      } else if (lower.includes('tablas') || lower.includes('empate')) {
        aiResponse = 'Las tablas sólo se acuerdan cuando no queda dinamismo en la posición. Demuestra tu técnica en los finales.';
      } else if (lower.includes('apertura') || lower.includes('defensa')) {
        aiResponse = 'La teoría moderna de aperturas prioriza la armonía entre piezas y la rapidez en el desarrollo.';
      } else if (lower.includes('pista') || lower.includes('consejo')) {
        aiResponse = 'Busca centralizar tus caballos y abrir diagonales para tus alfiles antes de iniciar un asalto al rey.';
      } else if (lower.includes('buena') || lower.includes('crack') || lower.includes('bien')) {
        aiResponse = 'Gracias. Tu juego posicional es admirable, digno de un Gran Maestro de 2680 ELO.';
      }

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        senderName: 'AI Grandmaster',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      playSound('notify', settings.soundEnabled);
    }, 1000);
  };

  // Copy FEN
  const handleCopyFen = () => {
    navigator.clipboard.writeText(chessRef.current.fen());
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  // Download PGN
  const handleDownloadPgn = () => {
    const pgnContent = chessRef.current.pgn() || `[Event "FIDE Online Grandmaster Tournament"]\n[White "Stitch"]\n[Black "AI Grandmaster"]\n[Result "*"]\n\n1. e4 e5 *`;
    const blob = new Blob([pgnContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stitch-chess-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isStitchTurn = chessRef.current.turn() === 'w';
  const openingName = detectOpening(chessRef.current.history());
  const formattedEval = formatEvaluation(evalScore);

  // Eval bar percentage calculation
  const evalNormalized = Math.max(-500, Math.min(500, evalScore));
  const whiteEvalPercent = 50 + (evalNormalized / 500) * 45;

  return (
    <div className="bg-[#111317] text-[#e2e2e8] min-h-screen flex flex-col font-sans selection:bg-[#00d2ff] selection:text-[#003543]">
      <PieceGradients />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0c0e12]/95 backdrop-blur-md border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="h-14 w-full px-4 lg:px-6 flex items-center justify-between">
          {/* Brand lockup */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('settings')}
              aria-label="Abrir Menú"
              className="p-1.5 rounded-lg text-[#bbc9cf] hover:text-white hover:bg-[#282a2e] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00d2ff] to-[#7bd0ff] flex items-center justify-center shadow-[0_0_12px_rgba(0,210,255,0.5)]">
                <span className="font-heading font-black text-black text-base">♞</span>
              </div>
              <span className="font-heading font-bold text-base sm:text-lg tracking-wider text-white select-none">
                STITCH <span className="text-[#00d2ff]">CHESS</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 h-full">
            {(['home', 'play', 'stats', 'profile', 'settings'] as const).map((tab) => {
              const label =
                tab === 'home'
                  ? 'Home'
                  : tab === 'play'
                  ? 'Play'
                  : tab === 'stats'
                  ? 'Stats'
                  : tab === 'profile'
                  ? 'Profile'
                  : 'Settings';

              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'settings') setShowAnalysisModal(true);
                  }}
                  className={`h-full flex items-center px-3.5 text-xs font-medium transition-all border-b-2 ${
                    isActive
                      ? 'text-[#00d2ff] border-[#00d2ff] shadow-[0_2px_12px_rgba(0,210,255,0.3)]'
                      : 'text-[#bbc9cf] hover:text-white border-transparent'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right Tools (Latency, Sound, Fullscreen, Profile) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1a1c20] border border-white/5 select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs text-[#bbc9cf]">24ms</span>
            </div>

            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
                aria-label="Alternar Sonido"
                className="p-1.5 rounded-lg text-[#bbc9cf] hover:text-white hover:bg-[#282a2e] transition-colors"
                title={settings.soundEnabled ? 'Silenciar Sonido' : 'Activar Sonido'}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#00d2ff]" /> : <VolumeX className="w-4 h-4 text-[#859399]" />}
              </button>

              <button
                onClick={toggleFullscreen}
                aria-label="Pantalla Completa"
                className="p-1.5 rounded-lg text-[#bbc9cf] hover:text-white hover:bg-[#282a2e] transition-colors"
                title="Pantalla Completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar Trigger */}
            <div className="pl-1">
              <div
                onClick={() => handleRestart()}
                title="Reiniciar Partida"
                className="w-8 h-8 rounded-full bg-[#1e2024] border border-[#00d2ff]/40 hover:border-[#00d2ff] flex items-center justify-center cursor-pointer transition-colors"
              >
                <RotateCw className="w-4 h-4 text-[#00d2ff]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MATCH BANNER */}
      <div className="w-full bg-[#0c0e12] border-b border-white/5 px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00d2ff]/15 text-[#00d2ff]">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
              Partida Oficial Clasificatoria FIDE Online
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs text-[#bbc9cf]">
            Ritmo: 10 min + 0s • Blitz Rápido • Sin Ayudas Externas
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-[#1a1c20] px-2.5 py-0.5 rounded border border-white/5">
            <span className="font-mono text-[11px] text-[#bbc9cf] uppercase">Profundidad IA:</span>
            <span className="font-mono text-[#00d2ff] font-semibold">28 capas (NNUE)</span>
          </div>
          <div className="flex items-center gap-1 text-[#00d2ff]">
            <Wifi className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-semibold">Óptima</span>
          </div>
        </div>
      </div>

      {/* MAIN 3-COLUMN TOURNAMENT COCKPIT */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* COLUMNA 1: Stitch Player Card & Competitor Controls (Col 3) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
          <PlayerCard
            isTurn={isStitchTurn}
            timeRemaining={stitchTime}
            initialTime={settings.timeControl}
            capturedByPlayer={capturedByStitch}
            capturedByOpponent={capturedByOpponent}
            settings={settings}
            onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
            onOfferDraw={handleOfferDraw}
            onTacticalHint={handleTacticalHint}
            onQuickAnalysis={() => setShowAnalysisModal(true)}
            onResign={handleResign}
          />
        </div>

        {/* ========================================================= */}
        {/* COLUMNA 2: Tablero Central Staunton Clásico (Col 6)        */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Top Board Bar: Dynamic Opening & Real-time Eval Gauge */}
          <div className="w-full max-w-[620px] mb-2 flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#333539]" />
              <span className="font-mono text-[#bbc9cf] truncate">{openingName}</span>
            </div>

            {/* Live Eval Gauge */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#859399]">Eval</span>
              <span className="font-mono font-bold text-xs text-[#00d2ff] bg-[#1a1c20] px-2 py-0.5 rounded border border-white/5">
                {formattedEval}
              </span>
              <div
                className="w-16 sm:w-20 h-2 bg-[#1e2024] rounded-full overflow-hidden flex border border-white/10"
                title={`Ventaja: ${formattedEval}`}
              >
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${whiteEvalPercent}%` }}
                />
                <div
                  className="h-full bg-[#111317] transition-all duration-300"
                  style={{ width: `${100 - whiteEvalPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Master Chessboard */}
          <ChessBoard
            game={chessRef.current}
            perspective={settings.perspective}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            hintSquare={hintSquare}
            isEngineThinking={isEngineThinking}
            onSquareClick={handleSquareClick}
            onPieceDrop={handlePieceDrop}
            promotionPending={promotionPending}
            onPromote={handlePromote}
            onCancelPromotion={() => setPromotionPending(null)}
          />

          {/* Quick Floating Board Controls */}
          <div className="w-full max-w-[620px] mt-3 flex items-center justify-between px-3 py-2 bg-[#1a1c20] rounded-xl shadow-md border border-white/5">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSettings((s) => ({
                    ...s,
                    perspective: s.perspective === 'w' ? 'b' : 'w',
                  }))
                }
                className="p-2 rounded-lg bg-[#282a2e] hover:bg-[#333539] text-[#bbc9cf] hover:text-[#00d2ff] transition-colors"
                title="Girar Tablero"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadPgn}
                className="p-2 rounded-lg bg-[#282a2e] hover:bg-[#333539] text-[#bbc9cf] hover:text-[#00d2ff] transition-colors"
                title="Descargar PGN Oficial"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyFen}
                className="p-2 rounded-lg bg-[#282a2e] hover:bg-[#333539] text-[#bbc9cf] hover:text-[#00d2ff] transition-colors flex items-center gap-1"
                title="Copiar FEN al portapapeles"
              >
                {copiedFen ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#859399]">Última Jugada:</span>
              <span className="px-2 py-0.5 rounded bg-[#00d2ff]/15 text-[#00d2ff] font-mono text-xs font-bold">
                {moveHistory.length > 0
                  ? moveHistory[moveHistory.length - 1].black
                    ? `${moveHistory[moveHistory.length - 1].moveNumber}... ${moveHistory[moveHistory.length - 1].black}`
                    : `${moveHistory[moveHistory.length - 1].moveNumber}. ${moveHistory[moveHistory.length - 1].white}`
                  : 'Inicio'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMNA 3: AI Grandmaster BOT, PGN & Live Chat (Col 3)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3">
          {/* Opponent Card */}
          <OpponentCard
            isTurn={!isStitchTurn}
            timeRemaining={opponentTime}
            initialTime={settings.timeControl}
            capturedByOpponent={capturedByOpponent}
            capturedByPlayer={capturedByStitch}
            isThinking={isEngineThinking}
          />

          {/* Move History Sheet */}
          <MoveHistory
            moves={moveHistory}
            currentMoveIndex={currentPlyIndex}
            onGoToMove={handleGoToMove}
            isPlayingReplay={isPlayingReplay}
            onToggleReplay={() => setIsPlayingReplay(!isPlayingReplay)}
          />

          {/* Interactive Live Chat */}
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isEngineThinking={isEngineThinking}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0c0e12] border-t border-white/5 py-3 mt-auto">
        <div className="w-full px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#859399]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#bbc9cf]">
              FIDE Grandmaster Engine v16.2 • Stockfish NNUE Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              onClick={() => setShowAnalysisModal(true)}
              className="hover:text-[#00d2ff] transition-colors cursor-pointer"
            >
              Motor & Reglas FIDE
            </span>
            <span
              onClick={handleRestart}
              className="hover:text-[#00d2ff] transition-colors cursor-pointer"
            >
              Reiniciar Partida
            </span>
            <span className="hover:text-[#00d2ff] transition-colors cursor-pointer">
              Garantía Fair Play
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showGameOverModal && (
        <GameOverModal
          status={gameStatus}
          winner={winner}
          reason={gameOverReason}
          onRestart={handleRestart}
          onClose={() => setShowGameOverModal(false)}
        />
      )}

      {hintModalAdvice && (
        <HintModal
          advice={hintModalAdvice}
          onClose={() => setHintModalAdvice(null)}
        />
      )}

      {showAnalysisModal && (
        <AnalysisModal
          evaluationScore={formattedEval}
          openingName={openingName}
          fideNotation={chessRef.current.fen()}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  );
}
