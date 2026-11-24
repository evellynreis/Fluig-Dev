
import {
  BookOpen,
  Database,
  History,
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Braces,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "WORKSPACE",
    items: [
      {
        href: "/dashboard",
        label: "Visão geral",
        icon: LayoutDashboard,
      },
      {
        href: "/generator",
        label: "Gerar dataset",
        icon: Sparkles,
      },
      {
        href: "/constraints",
        label: "Gerador de constraints",
        icon: Braces,
      },
      {
        href: "/validator",
        label: "Validador de código",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "BIBLIOTECA",
    items: [
      {
        href: "/library",
        label: "Meus datasets",
        icon: Database,
      },
      {
        href: "/history",
        label: "Histórico",
        icon: History,
      },
      {
        href: "/examples",
        label: "Exemplos",
        icon: Lightbulb,
      },
      {
        href: "/docs",
        label: "Documentação",
        icon: BookOpen,
      },
    ],
  },
];

export const toolItems = [
  {
    href: "/generator",
    label: "Gerador de datasets",
    description: "Crie estruturas de datasets a partir de uma descrição.",
    icon: Sparkles,
    status: "Disponível",
    available: true,
  },
  {
    href: "/constraints",
    label: "Gerador de constraints",
    description: "Monte filtros e condições para consultas Fluig.",
    icon: Braces,
    status: "Disponível",
    available: true,
  },
  {
    href: "/validator",
    label: "Validador de código",
    description: "Revise sintaxe e estrutura dos datasets.",
    icon: ShieldCheck,
    status: "Disponível",
    available: true,
  },
  {
    href: "/library",
    label: "Biblioteca de datasets",
    description: "Organize e reutilize seus códigos.",
    icon: Database,
    status: "Disponível",
    available: true,
  },
] as const;
