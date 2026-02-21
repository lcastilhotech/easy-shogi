import type { Metadata } from "next";
import { Outfit, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy Shogi | Aprenda Shogi de forma simples",
  description: "Plataforma interativa para aprendizagem do jogo Shogi com minimalismo japonês.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${outfit.variable} ${notoSerifJp.variable} antialiased selection:bg-rose-100 selection:text-rose-900`}
      >
        {children}
      </body>
    </html>
  );
}
