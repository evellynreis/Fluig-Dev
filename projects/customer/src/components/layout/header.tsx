
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/generator": "Gerar dataset",
  "/constraints": "Gerador de constraints",
  "/validator": "Validador de código",
  "/library": "Meus datasets",
  "/history": "Histórico",
  "/examples": "Exemplos",
  "/settings": "Configurações",
  "/docs": "Documentação",
};

export function Header() {
  const path = usePathname();

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <Link href="/dashboard">Workspace</Link>
        <span className="crumb-separator">/</span>
        <strong>{titles[path] ?? "Workspace"}</strong>
      </div>

      <div className="topbar-actions">
        <span className="connection-pill local">
          <i className="status-dot" />
          Aplicação local
        </span>

        <span className="theme-indicator">
          <Moon size={18} />
        </span>

        <span className="top-avatar">D</span>
      </div>
    </header>
  );
}
