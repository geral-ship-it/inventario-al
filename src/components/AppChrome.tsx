"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const modoRapido = pathname?.startsWith("/scan");

  if (modoRapido) {
    // Modo Saída Rápida: ecrã único, sem navegação nem acesso ao resto da app.
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-slate-400 py-4">
        Dados sincronizados entre todos os dispositivos e utilizadores.
      </footer>
    </>
  );
}
