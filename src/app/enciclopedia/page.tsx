import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PIECE_DATA } from '@/lib/shogi-logic';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function EnciclopediaPage() {
    return (
        <div className="min-h-screen bg-background p-8 md:p-16">
            <header className="max-w-6xl mx-auto mb-16 space-y-4">
                <Link href="/" className="text-accent underline-offset-4 hover:underline mb-8 inline-block">
                    ← Voltar para o Início
                </Link>
                <h1 className="text-5xl md:text-7xl font-serif text-foreground">
                    Enciclopédia de <span className="text-foreground/60">Peças</span>
                </h1>
                <p className="text-xl text-foreground/60 max-w-2xl">
                    Cada peça no Shogi possui sua própria história e movimentos únicos.
                    Aprenda a identificar cada uma por seu Kanji e nome tradicional.
                </p>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.entries(PIECE_DATA).filter(([key]) => !key.startsWith('+')).map(([key, data]) => (
                        <div key={key} className="zen-card p-8 flex flex-col items-center">
                            <div className="text-7xl font-serif text-foreground mb-4 select-none">
                                {data.kanji}
                            </div>
                            <h2 className="text-2xl font-serif text-foreground">{data.namePt}</h2>
                            <p className="text-accent font-medium text-sm tracking-widest">{data.nameJp.toUpperCase()}</p>

                            <hr className="w-full my-6 border-foreground/10" />

                            <div className="space-y-4 w-full">
                                <h3 className="text-xs uppercase tracking-widest text-foreground/40 font-sans font-bold">Movimentação</h3>
                                <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                                    {Array.from({ length: 9 }).map((_, i) => {
                                        const dx = (i % 3) - 1;
                                        const dy = Math.floor(i / 3) - 1;
                                        const isMove = data.movePattern.some(m => m[0] === dx && m[1] === dy);
                                        const isCenter = dx === 0 && dy === 0;

                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-full aspect-square border zen-border",
                                                    isMove ? "bg-accent" : "bg-foreground/5",
                                                    isCenter && "bg-foreground"
                                                )}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Promoted Pieces Section */}
                <section className="mt-24 space-y-12">
                    <h2 className="text-4xl font-serif text-foreground border-b zen-border pb-4">Peças Promovidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(PIECE_DATA).filter(([key]) => key.startsWith('+')).map(([key, data]) => (
                            <div key={key} className="zen-card p-8 flex flex-col items-center border-accent/20">
                                <div className="text-7xl font-serif text-accent mb-4 select-none">
                                    {data.kanji}
                                </div>
                                <h2 className="text-2xl font-serif text-foreground">{data.namePt}</h2>
                                <p className="text-accent/60 font-medium text-sm tracking-widest font-sans">{data.nameJp.toUpperCase()}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
