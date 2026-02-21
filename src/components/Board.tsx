"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShogiEngine, PIECE_DATA } from '@/lib/shogi-logic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ── Piece SVG Component ──────────────────────────────────────────────────────
const ShogiPieceComponent = ({ piece, kindStr, isSelected, dimmed = false }: { piece: any, kindStr: string, isSelected?: boolean, dimmed?: boolean }) => {
    const data = PIECE_DATA[kindStr];
    if (!data) return null;

    const isPromoted = data.isPromoted;
    const flipped = piece.color === 1;

    return (
        <div
            className={cn(
                "relative flex items-center justify-center w-[90%] h-[90%] select-none cursor-pointer transition-all duration-150",
                flipped ? "rotate-180" : "rotate-0",
                dimmed ? "opacity-40" : "opacity-100",
                isSelected && "drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            )}
        >
            <svg viewBox="0 0 100 115" className="absolute w-full h-full drop-shadow-sm">
                <defs>
                    <linearGradient id={`wood-${piece.color}-${kindStr}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isSelected ? "#FEF3C7" : piece.color === 0 ? "#FDFAF3" : "#F5F0E8"} />
                        <stop offset="100%" stopColor={isSelected ? "#FDE68A" : piece.color === 0 ? "#EDE5CC" : "#DDD5B8"} />
                    </linearGradient>
                    <linearGradient id={`border-${piece.color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B6914" />
                        <stop offset="100%" stopColor="#5C4207" />
                    </linearGradient>
                </defs>
                {/* Outer border */}
                <path d="M50 4 L93 28 L88 108 L12 108 L7 28 Z" fill={`url(#border-${piece.color})`} />
                {/* Main face */}
                <path d="M50 7 L90 30 L85 105 L15 105 L10 30 Z" fill={`url(#wood-${piece.color}-${kindStr})`} />
                {/* Subtle grain line */}
                <path d="M28 50 Q50 45 72 50" stroke="rgba(139,105,20,0.12)" strokeWidth="1" fill="none" />
                <path d="M22 70 Q50 64 78 70" stroke="rgba(139,105,20,0.08)" strokeWidth="1" fill="none" />
                {/* Top notch highlight */}
                <path d="M50 7 L90 30" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" />
                <path d="M50 7 L10 30" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-[5%] gap-0">
                <span
                    style={{ textShadow: isPromoted ? "0 0 8px rgba(220,38,38,0.2)" : "none" }}
                    className={cn(
                        "font-serif font-bold leading-none tracking-tight text-[clamp(14px,3.5vw,22px)] md:text-[22px]",
                        isPromoted ? "text-[#9B1C1C]" : "text-[#1C1008]"
                    )}
                >
                    {data.kanji}
                </span>
                <span
                    className={cn(
                        "font-mono leading-none mt-[2px] text-[clamp(5px,1.5vw,8px)] md:text-[8px]",
                        isPromoted ? "text-[#9B1C1C]/50" : "text-[#1C1008]/40"
                    )}
                >
                    {data.namePt}
                </span>
            </div>

            {isSelected && (
                <div className="absolute -inset-1 border-2 border-amber-500 rounded animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6),inset_0_0_6px_rgba(245,158,11,0.2)] pointer-events-none" />
            )}
        </div>
    );
};

// ── Hand Panel ───────────────────────────────────────────────────────────────
function HandPanel({ hand, color, selectedHand, onSelect, label, engine }: { hand: Record<string, number>, color: number, selectedHand: { kind: string, color: number } | null, onSelect: (kind: string) => void, label: string, engine: ShogiEngine }) {
    const entries = Object.entries(hand).filter(([, c]) => c > 0);
    const isActive = color === 0;

    return (
        <div
            className={cn(
                "rounded-xl p-4 min-w-[120px] min-h-[160px] shadow-2xl transition-all",
                isActive ? "bg-gradient-to-br from-[#2D1B0E] to-[#3D2512] border border-amber-900/40" : "bg-gradient-to-br from-[#1A1A2E] to-[#16213E] border border-blue-900/30"
            )}
        >
            <div className={cn(
                "text-center mb-4 text-[10px] tracking-widest font-mono font-bold uppercase",
                isActive ? "text-amber-500/80" : "text-blue-400/60"
            )}>
                {label}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
                {entries.length === 0 && (
                    <div className="text-white/10 text-[11px] font-mono text-center py-2">
                        vazio
                    </div>
                )}
                {entries.map(([kind, count]) => (
                    <div
                        key={kind}
                        onClick={() => isActive && onSelect(kind)}
                        className={cn(
                            "relative transition-transform w-[44px] h-[48px] flex items-center justify-center",
                            isActive ? "cursor-pointer active:scale-95 hover:-translate-y-1" : "cursor-not-allowed"
                        )}
                    >
                        <ShogiPieceComponent
                            piece={{ kind, color }}
                            kindStr={engine.getKindString(kind)}
                            isSelected={selectedHand?.kind === kind}
                            dimmed={!isActive}
                        />
                        <div className={cn(
                            "absolute -bottom-1 -right-1 text-white text-[9px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center border-[1.5px] border-white/30 font-mono shadow-lg z-10",
                            isActive ? "bg-amber-600" : "bg-gray-600"
                        )}>
                            {count}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Turn Indicator ───────────────────────────────────────────────────────────
function TurnBadge({ turn }: { turn: number }) {
    return (
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full py-1.5 px-3.5 text-[11px] font-mono font-bold tracking-widest text-white/70 uppercase select-none">
            <div className={cn(
                "w-2 h-2 rounded-full",
                turn === 0 ? "bg-amber-500 shadow-[0_0_8px_#F59E0B] animate-pulse" : "bg-blue-400 shadow-[0_0_8px_#60A5FA] animate-pulse"
            )} />
            {turn === 0 ? "Sente (Você)" : "Gote (Oponente)"}
        </div>
    );
}

// ── Main Board ───────────────────────────────────────────────────────────────
interface BoardProps {
    initialSfen?: string;
    onMove?: (from: { x: number, y: number }, to: { x: number, y: number }) => void;
    interactive?: boolean;
    onDrop?: (pieceKind: string, to: { x: number, y: number }) => void;
}

export default function Board({ initialSfen, onMove, onDrop, interactive = true }: BoardProps) {
    const [engine, setEngine] = useState<ShogiEngine | null>(null);
    const [selected, setSelected] = useState<{ x: number, y: number } | null>(null);
    const [selectedHand, setSelectedHand] = useState<{ kind: string, color: number } | null>(null);
    const [validMoves, setValidMoves] = useState<{ x: number, y: number }[]>([]);
    const [lastMove, setLastMove] = useState<{ from?: { x: number, y: number } | "hand", to: { x: number, y: number } } | null>(null);
    const [captureFlash, setCaptureFlash] = useState<{ x: number, y: number } | null>(null);
    const [version, setVersion] = useState(0);

    const forceUpdate = () => setVersion(v => v + 1);

    useEffect(() => {
        setEngine(new ShogiEngine(initialSfen));
        setLastMove(null);
        setSelected(null);
        setSelectedHand(null);
        setValidMoves([]);
        setCaptureFlash(null);
    }, [initialSfen]);

    if (!engine) return null;

    const blackHand = engine.getHandSummary(0);
    const whiteHand = engine.getHandSummary(1);
    const turn = engine.getTurn();

    const colLabels = ["9", "8", "7", "6", "5", "4", "3", "2", "1"];
    const rowLabels = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

    const isValidMove = useCallback((r: number, c: number) => validMoves.some(m => m.x === r && m.y === c), [validMoves]);

    const handleSquareClick = (x: number, y: number) => {
        if (!interactive) return;

        if (selectedHand) {
            const success = engine.drop(selectedHand.kind, x, y);
            if (success) {
                onDrop?.(selectedHand.kind, { x, y });
                setLastMove({ from: "hand", to: { x, y } });
                setSelectedHand(null);
                setValidMoves([]);
                forceUpdate();
            } else {
                setSelectedHand(null);
                setValidMoves([]);
            }
            return;
        }

        if (selected) {
            if (selected.x === x && selected.y === y) {
                setSelected(null);
                setValidMoves([]);
                return;
            }

            const targetPiece = engine.getPieceAt(x, y);
            const success = engine.move(selected, { x, y });
            if (success) {
                if (targetPiece) {
                    setCaptureFlash({ x, y });
                    setTimeout(() => setCaptureFlash(null), 400);
                }
                onMove?.(selected, { x, y });
                setLastMove({ from: selected, to: { x, y } });
                setSelected(null);
                setValidMoves([]);
                forceUpdate();
            } else {
                // If selection is another of our pieces, switch selection
                const piece = engine.getPieceAt(x, y);
                if (piece && piece.color === turn) {
                    setSelected({ x, y });
                    const moves = engine.getValidMoves(x, y).map(m => m.to);
                    setValidMoves(moves);
                } else {
                    setSelected(null);
                    setValidMoves([]);
                }
            }
        } else {
            const piece = engine.getPieceAt(x, y);
            if (piece && piece.color === turn) {
                setSelected({ x, y });
                setSelectedHand(null);
                const moves = engine.getValidMoves(x, y).map(m => m.to);
                setValidMoves(moves);
            }
        }
    };

    const handleHandClick = (kind: string) => {
        if (!interactive) return;
        if (turn !== 0) return; // Player is always sente (0) in puzzle interactions usually, but this logic assumes user can only play sentes for now. No wait, in puzzles the player plays 0.

        setSelectedHand({ kind, color: 0 });
        setSelected(null);
        const drops = engine.getValidDrops(0).filter((m: any) => m.kind === kind).map((m: any) => m.to);
        setValidMoves(drops);
    };

    return (
        <div className="flex flex-col items-center gap-8 py-4 font-serif relative">

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-8 xl:gap-12 w-full justify-center">

                {/* White Hand (Gote) */}
                <div className="order-1 lg:order-1 pt-0 lg:pt-[40px] w-full lg:w-auto flex justify-center">
                    <HandPanel
                        hand={whiteHand} color={1}
                        selectedHand={null} onSelect={() => { }}
                        label="Gote — Mão"
                        engine={engine}
                    />
                </div>

                {/* Center Board Area */}
                <div className="order-2 flex flex-col items-center w-full max-w-[100vw] overflow-x-auto px-2">

                    {/* Header Controls inside the game area */}
                    <div className="flex items-center gap-4 mb-4">
                        <TurnBadge turn={turn} />
                    </div>

                    <div className="flex">
                        {/* Board Grid Container */}
                        <div className="relative">

                            {/* Column labels top */}
                            <div className="flex mb-1" style={{ paddingLeft: '8px', paddingRight: '16px' }}>
                                {colLabels.map(l => (
                                    <div key={l} className="flex-1 text-center text-[min(3vw,11px)] md:text-[11px] font-mono text-white/30 tracking-widest leading-none">{l}</div>
                                ))}
                            </div>

                            <div className="flex">
                                {/* The board itself */}
                                <div className="border-[2px] md:border-[3px] border-[#815C29] rounded bg-[#B8960C] shadow-[0_0_20px_rgba(0,0,0,0.6),0_0_40px_rgba(185,130,70,0.1)] ring-[0.5px] ring-white/10 relative overflow-hidden flex-shrink-0">
                                    <div className="grid grid-cols-9 grid-rows-9 gap-[1px] bg-[#5C4207]">
                                        {Array.from({ length: 9 }).map((_, y) => (
                                            Array.from({ length: 9 }).map((_, x) => {
                                                const actualX = 9 - x;
                                                const actualY = y + 1;
                                                const piece = engine.getPieceAt(actualX, actualY);
                                                const isSel = selected?.x === actualX && selected?.y === actualY;
                                                const isVM = isValidMove(actualX, actualY);

                                                const isLastFrom = lastMove?.from !== "hand" && lastMove?.from?.x === actualX && lastMove?.from?.y === actualY;
                                                const isLastTo = lastMove?.to?.x === actualX && lastMove?.to?.y === actualY;
                                                const isLast = isLastFrom || isLastTo;

                                                const isCap = captureFlash?.x === actualX && captureFlash?.y === actualY;

                                                const isCapturable = isVM && piece && piece.color !== turn;

                                                const hoshi = (y === 2 || y === 5 || y === 8) && (x === 2 || x === 5 || x === 8);

                                                return (
                                                    <div
                                                        key={`${x}-${y}`}
                                                        onClick={() => handleSquareClick(actualX, actualY)}
                                                        className={cn(
                                                            "w-[clamp(35px,9.5vmin,62px)] h-[clamp(35px,9.5vmin,62px)] flex items-center justify-center relative cursor-pointer transition-colors duration-150",
                                                            isCap ? "bg-red-500/60" :
                                                                isSel ? "bg-amber-400/30" :
                                                                    isVM && !piece ? "bg-blue-400/20" :
                                                                        isLast ? "bg-amber-400/15" :
                                                                            "bg-gradient-to-br from-[#D4A853] via-[#C9973C] to-[#BF8E30]"
                                                        )}
                                                        style={{
                                                            boxShadow: isSel ? "inset 0 0 0 2px rgba(251,191,36,0.8)" : isVM ? "inset 0 0 0 1px rgba(99,179,237,0.4)" : "none"
                                                        }}
                                                    >
                                                        {isVM && !piece && (
                                                            <div className="absolute w-[30%] h-[30%] rounded-full bg-blue-400/50 shadow-[0_0_8px_rgba(99,179,237,0.6)] border-[1.5px] border-blue-400/80 pointer-events-none" />
                                                        )}

                                                        {isCapturable && (
                                                            <div className="absolute inset-0 border-[3px] border-red-500/80 rounded animate-pulse shadow-[inset_0_0_8px_rgba(239,68,68,0.4)] pointer-events-none" />
                                                        )}

                                                        {hoshi && !piece && (
                                                            <div className="absolute w-[10%] h-[10%] rounded-full bg-[#5A3C0A]/40 pointer-events-none" />
                                                        )}

                                                        <AnimatePresence mode="wait">
                                                            {piece && (
                                                                <div className="relative z-10 w-full h-full flex items-center justify-center">
                                                                    <ShogiPieceComponent
                                                                        piece={piece}
                                                                        kindStr={engine.getKindString(piece.kind)}
                                                                        isSelected={isSel}
                                                                    />
                                                                </div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })
                                        ))}
                                    </div>
                                </div>

                                {/* Row labels right */}
                                <div className="flex flex-col ml-1 py-1 justify-between flex-shrink-0">
                                    {rowLabels.map(l => (
                                        <div key={l} className="flex items-center justify-center h-[clamp(35px,9.5vmin,62px)] w-4 text-[min(3vw,11px)] md:text-[11px] font-serif text-white/30">{l}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-5 text-[8px] md:text-[9px] font-mono tracking-widest text-white/40 uppercase">
                        <span className="flex items-center gap-1.5 md:gap-2"><div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-blue-400/60" /> Válido</span>
                        <span className="flex items-center gap-1.5 md:gap-2"><div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-amber-400/40" /> Seleção</span>
                        <span className="flex items-center gap-1.5 md:gap-2"><div className="w-2 md:w-2.5 h-2 md:h-2.5 border border-red-500/80 bg-red-400/20" /> Captura</span>
                    </div>

                </div>

                {/* Black Hand (Sente) */}
                <div className="order-3 lg:order-3 pt-0 lg:pt-[360px] w-full lg:w-auto flex justify-center">
                    <HandPanel
                        hand={blackHand} color={0}
                        selectedHand={selectedHand} onSelect={handleHandClick}
                        label="Sente — Mão"
                        engine={engine}
                    />
                </div>

            </div>

        </div>
    );
}
