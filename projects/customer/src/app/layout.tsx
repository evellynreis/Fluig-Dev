import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fluig Dev",
  description:
    "Plataforma para gerar, analisar, corrigir, validar e documentar datasets TOTVS Fluig.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
