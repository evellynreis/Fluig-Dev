"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Database, Settings2, Sparkles } from "lucide-react";
import { navGroups } from "@/lib/constants/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link className="brand" href="/dashboard" aria-label="Fluig Dev - página inicial">
        <span className="brand-mark"><Database size={21} /></span>
        <span className="brand-copy">
          <strong>Fluig <span>Dev</span></strong>
          <small>DEV WORKSPACE</small>
        </span>
      </Link>

      <div className="workspace-switcher">
        <span className="workspace-copy">
          <strong>Meu ambiente</strong>
          <small>Desenvolvimento local</small>
        </span>
      </div>

      <nav className="nav" aria-label="Navegação principal">
        {navGroups.map((group) => (
          <div className="nav-group" key={group.title}>
            <p className="nav-caption">{group.title}</p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-item${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  title={label}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="tip-card">
          <Sparkles size={16} className="tip-icon" />
          <strong>Desenvolva com mais agilidade</strong>
          <p>Transforme requisitos em soluções Fluig com assistência inteligente.</p>
        </div>
        <Link className={`nav-item settings-item${pathname === "/settings" ? " active" : ""}`} href="/settings">
          <Settings2 size={18} />
          <span>Configurações</span>
        </Link>
        <div className="profile-row">
          <span className="profile-avatar">D</span>
          <span className="profile-copy">
            <strong>Desenvolvedor</strong>
            <small>Workspace pessoal</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
