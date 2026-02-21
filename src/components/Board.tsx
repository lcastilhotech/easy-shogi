"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShogiEngine, PIECE_DATA } from '@/lib/shogi-logic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ShogiPieceComponent = ({ piece, kindStr, isSelected, size = 'md', dimmed = false }: { piece: any, kindStr: string, isSelected?: boolean, size?: 'sm' | 'md' | 'lg', dimmed?: boolean }) => {
    const data = PIECE_DATA[kindStr];
    if (!data) return <div className="text-xs text-red-500">{kindStr}</div>;

    const flipped = piece.color === 1;
    const isPromoted = data.isPromoted;

    const sizes = {
        sm: { outer: 44, font: 'text-sm', sub: 'text-[7px]' },
        md: { outer: 56, font: 'text-xl md:text-2xl', sub: 'text-[7px] md:text-[8px]' },
        lg: { outer: 68, font: 'text-2xl md:text-3xl', sub: 'text-[8px] md:text-[9px]' }
    };
    const s = sizes[size];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
                "relative flex flex-col items-center justify-center select-none cursor-pointer group transition-all duration-200",
                flipped ? "rotate-180" : "rotate-0",
                dimmed ? "opacity-40" : "opacity-100",
                isSelected && "drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            )}
            style={{ width: s.outer, height: s.outer }}
        >
            <svg viewBox="0 0 100 115" className="w-[90%] h-[90%] drop-shadow-md">
                <defs>
                    <linearGradient id={`piece-grad-${kindStr}-${piece.color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isSelected ? "#FEF3C7" : piece.color === 0 ? "#FDFAF3" : "#F5F0E8"} />
                        <stop offset="100%" stopColor={isSelected ? "#FDE68A" : piece.color === 0 ? "#EDE5CC" : "#DDD5B8"} />
                    </linearGradient>
                </defs>
                {/* Outer border */}
                <path d="M50 4 L93 28 L88 108 L12 108 L7 28 Z" fill="#5C4207" />
                {/* Main face */}
                <path d="M50 7 L90 30 L85 105 L15 105 L10 30 Z" fill={`url(#piece-grad-${kindStr}-${piece.color})`} />
                {/* Subtle detail */}
                <path d="M50 7 L90 30" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className={cn(
                    "font-serif leading-tight",
                    s.font,
                    isPromoted ? "text-[#9B1C1C]" : "text-[#1C1008]"
                )}>
                    {data.kanji}
                </span>
                <span className={cn(
                    "uppercase tracking-tighter font-sans mt-0.5",
                    s.sub,
                    isPromoted ? "text-[#9B1C1C]/50" : "text-[#1C1008]/40"
                )}>
                    {data.namePt}
                </span>
            </div>
        </motion.div>
    );
};

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
    const [lastMove, setLastMove] = useState<{ from?: { x: number, y: number }, to: { x: number, y: number } } | null>(null);
    const [captureFlash, setCaptureFlash] = useState<{ x: number, y: number } | null>(null);
    const [version, setVersion] = useState(0);

    const forceUpdate = () => setVersion(v => v + 1);

    useEffect(() => {
        setEngine(new ShogiEngine(initialSfen));
    }, [initialSfen]);

    if (!engine) return null;

    const board = engine.getBoard();
    const blackHand = engine.getHandSummary(0);
    const whiteHand = engine.getHandSummary(1);

    const handleSquareClick = (x: number, y: number) => {
        if (!interactive) return;

        if (selectedHand) {
            const success = engine.drop(selectedHand.kind, x, y);
            if (success) {
                onDrop?.(selectedHand.kind, { x, y });
                setLastMove({ to: { x, y } });
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
                if (piece && piece.color === engine.getTurn()) {
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
            if (piece && piece.color === engine.getTurn()) {
                setSelected({ x, y });
                setSelectedHand(null);
                const moves = engine.getValidMoves(x, y).map(m => m.to);
                setValidMoves(moves);
            }
        }
    };

    const handleHandClick = (kind: string, color: number) => {
        if (!interactive) return;
        if (engine.getTurn() !== color) return;

        setSelectedHand({ kind, color });
        setSelected(null);
        const drops = engine.getValidDrops(color as 0 | 1).filter((m: any) => m.kind === kind).map((m: any) => m.to);
        setValidMoves(drops);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="hidden md:flex flex-col gap-4">
                <div className="p-4 zen-card bg-foreground/5 min-h-[160px] w-full md:w-32 border-foreground/10 border">
                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mb-4 block text-center">Gote (Oponente)</span>
                    <div className="flex md:flex-wrap gap-3 justify-center opacity-70 cursor-not-allowed">
                        {Object.entries(whiteHand).map(([kind, count]) => count > 0 && (
                            <div key={kind} className="relative w-12 h-14">
                                <ShogiPieceComponent piece={{ kind, color: 1 }} kindStr={engine.getKindString(kind)} isSelected={false} />
                                <span className="absolute -bottom-1 -right-1 bg-foreground/10 text-foreground/60 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative zen-border p-1 bg-foreground/5 shadow-2xl">
                <div className="grid grid-cols-9 grid-rows-9 gap-px bg-foreground">
                    {Array.from({ length: 9 }).map((_, y) => (
                        Array.from({ length: 9 }).map((_, x) => {
                            // Shogi.js uses 1-indexed coordinates for display but the array is often flipped or 0-indexed internally
                            // We'll map accordingly. Usually x is 9->1 and y is 1->9
                            const actualX = 9 - x;
                            const actualY = y + 1;
                            const piece = engine.getPieceAt(actualX, actualY);
                            const isSelected = selected?.x === actualX && selected?.y === actualY;
                            const isValidMove = validMoves.some(m => m.x === actualX && m.y === actualY);
                            const kindStr = piece ? engine.getKindString(piece.kind) : '';

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    onClick={() => handleSquareClick(actualX, actualY)}
                                    className={cn(
                                        "w-10 h-12 md:w-14 md:h-16 flex items-center justify-center cursor-pointer transition-colors relative",
                                        "bg-[#FDFCF7]", // Paper square
                                        isSelected && "bg-accent/10 sm:bg-accent/20",
                                        isValidMove && "bg-blue-500/10"
                                    )}
                                >
                                    {isValidMove && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-2 h-2 rounded-full bg-blue-400/40 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        </div>
                                    )}

                                    <AnimatePresence mode="popLayout">
                                        {piece && (
                                            <ShogiPieceComponent piece={piece} kindStr={kindStr} isSelected={isSelected} />
                                        )}
                                    </AnimatePresence>

                                    {/* Traditional intersection dots (Hoshi) */}
                                    {((actualX === 7 || actualX === 4 || actualX === 1) && (actualY === 3 || actualY === 6 || actualY === 9)) && (
                                        <div className="absolute w-1.5 h-1.5 rounded-full bg-foreground/10 pointer-events-none" />
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Black Hand (Sente) - Traditional Koma-dai style */}
            <div className="flex flex-col gap-4">
                <div className="p-4 zen-card bg-[#E3D5B1]/30 border-[#B88865]/20 border min-h-[160px] w-full md:w-32 shadow-inner">
                    <span className="text-[10px] uppercase tracking-widest text-[#B88865] font-bold mb-4 block text-center">Sente (Sua Mão)</span>
                    <div className="flex md:flex-wrap gap-3 justify-center">
                        {Object.entries(blackHand).map(([kind, count]) => count > 0 && (
                            <div
                                key={kind}
                                onClick={() => handleHandClick(kind, 0)}
                                className={cn(
                                    "relative w-12 h-14 transition-transform hover:-translate-y-1 active:scale-95",
                                    selectedHand?.kind === kind && "scale-110 drop-shadow-lg"
                                )}
                            >
                                <ShogiPieceComponent piece={{ kind, color: 0 }} kindStr={engine.getKindString(kind)} isSelected={selectedHand?.kind === kind} />
                                <span className="absolute -bottom-1 -right-1 bg-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-white border">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
