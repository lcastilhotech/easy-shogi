import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background relative flex items-center justify-center p-6 lg:p-12 overflow-hidden">
            {/* Background Texture/Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

            <div className="relative z-10 w-full flex flex-col items-center gap-12">
                <header className="flex flex-col items-center gap-4">
                    <div className="font-serif text-6xl text-foreground/10 select-none">
                        認証
                    </div>
                    <h1 className="text-4xl font-serif text-foreground">Acesso Easy Shogi</h1>
                </header>

                <AuthForm />

                <footer className="text-foreground/20 text-[10px] uppercase tracking-[0.3em] font-sans">
                    Tradição • Minimalismo • Maestria
                </footer>
            </div>

            {/* Abstract Design Elements */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 border zen-border opacity-5 rotate-45 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent opacity-[0.02] pointer-events-none" />
        </div>
    );
}
