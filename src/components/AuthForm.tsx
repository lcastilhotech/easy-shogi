"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const router = useRouter();

    const getErrorMessage = (error: any) => {
        if (typeof error === 'string') return error;
        const msg = error.message || '';

        if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
        if (msg.includes('User not found')) return 'E-mail não cadastrado.';
        if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
        if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
        if (msg.includes('Email not confirmed')) return 'Por favor, confirme seu e-mail.';
        if (msg.includes('Invalid API key')) return 'E-mail não cadastrado';

        return msg || 'Ocorreu um erro inesperado.';
    };

    const validateForm = () => {
        if (!email.includes('@')) {
            setMessage({ type: 'error', text: 'Por favor, insira um e-mail válido.' });
            return false;
        }
        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return false;
        }
        return true;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

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
                router.push('/puzzles');
                router.refresh();
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setMessage({ type: 'error', text: getErrorMessage(error) });
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
                <div className="text-4xl font-serif text-foreground select-none" data-testid="auth-title">
                    {mode === 'login' ? 'Entre' : 'Junte-se'}
                </div>
                <p className="text-foreground/70 text-sm tracking-widest uppercase font-sans">
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
                        data-testid="password-input"
                    />
                </div>

                {message && (
                    <p className={`text-sm text-center font-serif ${message.type === 'error' ? 'text-accent' : 'text-green-600'}`} data-testid="auth-message">
                        {message.text}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full zen-card py-4 font-serif text-xl text-[#1A1A1A] hover:bg-foreground hover:text-white transition-all disabled:opacity-50"
                    data-testid="submit-button"
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
