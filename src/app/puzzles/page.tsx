"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Board from '@/components/Board';
import { motion, AnimatePresence } from 'framer-motion';

interface Puzzle {
    id: string;
    title: string;
    sfen: string;
    solution: string[];
    difficulty: number;
}

export default function PuzzlesPage() {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPuzzles() {
            const { data, error } = await supabase
                .from('puzzles')
                .select('*')
                .order('difficulty', { ascending: true });

            if (!error && data) {
                setPuzzles(data);
            }
            setLoading(false);
        }
        fetchPuzzles();
    }, []);

    const currentPuzzle = puzzles[currentPuzzleIndex];

    const handleMove = (from: { x: number, y: number }, to: { x: number, y: number }) => {
        // SFEN move notation e.g. 7g7f
        const moveStr = `${from.x}${getColumnChar(from.y)}${to.x}${getColumnChar(to.y)}`;
        // Simplified validation: check if the move matches the first solution move
        if (currentPuzzle.solution.includes(moveStr)) {
            setStatus('success');
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const getColumnChar = (y: number) => String.fromCharCode(96 + y); // 1->a, 2->b...

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-2xl font-serif animate-pulse">Carregando Puzzles...</div>
        </div>
    );

    if (!currentPuzzle) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
            <h1 className="text-4xl font-serif">Nenhum puzzle encontrado</h1>
            <p className="text-foreground/60">Parece que o banco de dados ainda não tem desafios.</p>
            <Link href="/" className="zen-card px-8 py-3">Voltar ao Início</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
            <header className="max-w-4xl w-full mb-12 flex justify-between items-end">
                <div className="space-y-2">
                    <Link href="/" className="text-accent text-sm underline-offset-4 hover:underline">← Home</Link>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground">{currentPuzzle.title}</h1>
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 ${i < currentPuzzle.difficulty ? 'bg-accent' : 'bg-foreground/10'}`} />
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold">Progresso</p>
                    <p className="text-2xl font-serif">{currentPuzzleIndex + 1} / {puzzles.length}</p>
                </div>
            </header>

            <main className="flex flex-col lg:flex-row gap-16 items-start">
                <div className="relative">
                    <Board
                        initialSfen={currentPuzzle.sfen}
                        onMove={handleMove}
                    />

                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-8 left-0 w-full text-center text-accent font-serif text-2xl"
                            >
                                Correto!
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-8 left-0 w-full text-center text-foreground font-serif text-2xl"
                            >
                                Tente novamente
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <aside className="max-w-xs space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-xs uppercase tracking-widest text-foreground/40 font-bold">Dica</h3>
                        <p className="text-lg text-foreground/80 font-serif leading-relaxed italic">
                            "O movimento sutil muitas vezes decide o destino do Rei."
                        </p>
                    </div>

                    {status === 'success' && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => {
                                setStatus('idle');
                                setCurrentPuzzleIndex((prev) => (prev + 1) % puzzles.length);
                            }}
                            className="w-full zen-card bg-foreground text-background py-5 text-xl font-serif"
                        >
                            Próximo Desafio →
                        </motion.button>
                    )}
                </aside>
            </main>
        </div>
    );
}
