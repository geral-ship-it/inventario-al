"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useLocalStore } from "@/lib/local-store";

const LINKS = [
  { href: "/", label: "Painel" },
  { href: "/inventario", label: "Inventário" },
  { href: "/arrecadacoes", label: "Arrecadações" },
  { href: "/compras", label: "Lista de Compras" },
  { href: "/produtos", label: "Produtos" },
  { href: "/precos", label: "Preços" },
  { href: "/utilizadores", label: "Gerir acesso" },
];

export default function Nav() {
  const pathname = usePathname();
  const utilizadores = useAppStore((s) => s.utilizadores);
  const utilizadorAtualId = useLocalStore((s) => s.utilizadorAtualId);
  const setUtilizadorAtual = useLocalStore((s) => s.setUtilizadorAtual);
  const bloquear = useLocalStore((s) => s.bloquear);
  const nivelAcesso = useLocalStore((s) => s.nivelAcesso);
  const acessoRestrito = nivelAcesso === "arrecadacoes";

  // O perfil "saída rápida" entra pelo /scan com PIN, não por aqui.
  const utilizadoresApp = utilizadores.filter((u) => u.role !== "saida_rapida");
  const linksVisiveis = acessoRestrito
    ? LINKS.filter((link) => link.href === "/arrecadacoes")
    : LINKS;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-2">
          <div className="font-semibold text-slate-900 tracking-tight">
            Inventário AL
          </div>
          <div className="flex items-center gap-2">
            {!acessoRestrito && (
              <Link
                href="/scan"
                className="text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-100 whitespace-nowrap"
              >
                Modo Saída Rápida
              </Link>
            )}
            {!acessoRestrito && (
              <select
                className="text-sm border border-slate-200 rounded-md px-2 py-1 bg-slate-50"
                value={utilizadorAtualId}
                onChange={(e) => setUtilizadorAtual(e.target.value)}
              >
                {utilizadoresApp.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.role})
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={bloquear}
              title="Bloquear o acesso completo neste dispositivo"
              className="text-xs font-medium text-slate-400 hover:text-slate-600 underline whitespace-nowrap"
            >
              Bloquear
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-1">
          {linksVisiveis.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors mx-1 ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
