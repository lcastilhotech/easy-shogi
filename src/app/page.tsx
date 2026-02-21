import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col md:flex-row">
      {/* Background Texture/Grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      {/* SVG Filters for Ink Bleed */}
      <svg className="hidden">
        <filter id="ink-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
      </svg>

      {/* Left Column: Vertical Brand / Japanese Art */}
      <div className="relative w-full md:w-32 py-12 flex items-center justify-center md:border-r zen-border">
        <div className="flex md:flex-col gap-8 md:gap-12 transform md:-rotate-180 md:[writing-mode:vertical-rl] text-foreground/20 font-serif text-6xl md:text-8xl select-none">
          将棋
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-24 py-16 relative z-10">
        <div className="max-w-4xl space-y-12">
          <header className="space-y-4">
            <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm">
              Aprendizado Progressivo
            </p>
            <h1 className="text-6xl md:text-8xl font-serif leading-[1.1] text-foreground">
              Easy <br className="hidden md:block" />
              <span className="text-foreground/80">Shogi</span>
            </h1>
          </header>

          <p className="max-w-xl text-xl leading-relaxed text-foreground/60 font-sans">
            A ponte entre a tradição japonesa e o aprendizado moderno.
            Domine as peças, táticas e puzzles através de uma interface
            purista e progressiva.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Link
              href="/puzzles"
              className="zen-card px-10 py-5 text-lg font-medium flex items-center justify-center group"
            >
              Começar Puzzles
              <span className="ml-3 transform group-hover:translate-x-2 transition-transform">→</span>
            </Link>

            <Link
              href="/enciclopedia"
              className="px-10 py-5 text-lg font-medium border zen-border hover:bg-foreground hover:text-background transition-colors flex items-center justify-center"
            >
              Ver Peças
            </Link>
          </div>
        </div>

        {/* Footer Decorative Line */}
        <div className="absolute bottom-12 left-0 w-full px-8 md:px-24">
          <div className="h-px bg-foreground/10 w-full" />
        </div>
      </main>

      {/* Right Column: Abstract Minimalist Visual */}
      <div className="hidden lg:flex w-1/4 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative">
          <div className="w-64 h-64 border zen-border transform rotate-12 flex items-center justify-center">
            <div className="w-56 h-56 border zen-border -rotate-6 flex items-center justify-center">
              <span className="text-9xl font-serif text-foreground/5 ink-bleed select-none">王</span>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-none mix-blend-multiply" />
        </div>
      </div>
    </div>
  );
}
