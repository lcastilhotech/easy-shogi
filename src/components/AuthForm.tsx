"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Conta criada com sucesso!' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                window.location.href = '/puzzles';
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md zen-card p-12 bg-background space-y-8"
        >
            <header className="text-center space-y-2">
                <div className="text-4xl font-serif text-foreground select-none">
                    {mode === 'login' ? 'Entre' : 'Junte-se'}
                </div>
                <p className="text-foreground/40 text-sm tracking-widest uppercase font-sans">
                    {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua jornada'}
                </p>
            </header>

            <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold ml-1">E-mail</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-foreground/5 border zen-border px-4 py-3 outline-none focus:bg-white transition-colors font-sans"
                        placeholder="seu@email.com"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold ml-1">Senha</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-foreground/5 border zen-border px-4 py-3 outline-none focus:bg-white transition-colors font-sans"
                        placeholder="••••••••"
                    />
                </div>

                {message && (
                    <p className={`text-sm text-center font-serif ${message.type === 'error' ? 'text-accent' : 'text-green-600'}`}>
                        {message.text}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full zen-card bg-[#1A1A1A] text-white py-4 font-serif text-xl hover:translate-x-1 hover:translate-y-1 transition-transform disabled:opacity-50"
                >
                    {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
            </form>

            <div className="text-center">
                <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-xs uppercase tracking-tighter text-[#1A1A1A]/60 hover:text-accent font-bold transition-colors underline underline-offset-4"
                >
                    {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                </button>
            </div>
        </motion.div>
    );
}
