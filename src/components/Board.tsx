"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShogiEngine, PIECE_DATA } from '@/lib/shogi-logic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
                setSelectedHand(null);
            } else {
                setSelectedHand(null);
            }
            return;
        }

        if (selected) {
            if (selected.x === x && selected.y === y) {
                setSelected(null);
                return;
            }

            const success = engine.move(selected, { x, y });
            if (success) {
                onMove?.(selected, { x, y });
                setSelected(null);
            } else {
                // If selection is another of our pieces, switch selection
                const piece = engine.getPieceAt(x, y);
                if (piece) {
                    setSelected({ x, y });
                } else {
                    setSelected(null);
                }
            }
        } else {
            const piece = engine.getPieceAt(x, y);
            if (piece) {
                setSelected({ x, y });
                setSelectedHand(null);
            }
        }
    };

    const handleHandClick = (kind: string, color: number) => {
        if (!interactive) return;
        setSelectedHand({ kind, color });
        setSelected(null);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            {/* White Hand (Top/Opponent) */}
            <div className="hidden md:flex flex-col gap-2 p-4 zen-card bg-foreground/5 min-h-[200px] w-24">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mb-2">Gote</span>
                {Object.entries(whiteHand).map(([kind, count]) => count > 0 && (
                    <div key={kind} className="relative group cursor-not-allowed opacity-50">
                        <div className="text-xl font-serif rotate-180">{PIECE_DATA[kind]?.kanji || kind}</div>
                        <span className="absolute -bottom-1 -right-1 text-[10px] font-bold">{count}</span>
                    </div>
                ))}
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

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    onClick={() => handleSquareClick(actualX, actualY)}
                                    className={cn(
                                        "w-10 h-12 md:w-14 md:h-16 flex items-center justify-center cursor-pointer transition-colors relative",
                                        "bg-[#FDFCF7]", // Paper square
                                        isSelected && "bg-accent/10 sm:bg-accent/20"
                                    )}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {piece && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className={cn(
                                                    "w-full h-full flex flex-col items-center justify-center select-none",
                                                    piece.color === 0 ? "rotate-0" : "rotate-180"
                                                )}
                                            >
                                                <div className="text-2xl md:text-3xl font-serif text-foreground ink-bleed leading-none">
                                                    {PIECE_DATA[piece.kind]?.kanji || piece.kind}
                                                </div>
                                                <div className="text-[8px] md:text-[10px] uppercase tracking-tighter text-foreground/40 mt-1 font-sans">
                                                    {PIECE_DATA[piece.kind]?.namePt}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Black Hand (Bottom/Player) */}
            <div className="flex md:flex-col flex-wrap gap-4 md:gap-2 p-4 zen-card bg-foreground/5 md:min-h-[200px] md:w-24">
                <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold mb-2 w-full md:w-auto">Sente</span>
                {Object.entries(blackHand).map(([kind, count]) => count > 0 && (
                    <div
                        key={kind}
                        onClick={() => handleHandClick(kind, 0)}
                        className={cn(
                            "relative cursor-pointer transition-all hover:scale-110",
                            selectedHand?.kind === kind && "scale-125 text-accent ink-bleed"
                        )}
                    >
                        <div className="text-2xl md:text-3xl font-serif">{PIECE_DATA[kind]?.kanji || kind}</div>
                        <span className="absolute -bottom-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
