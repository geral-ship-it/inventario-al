"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Nav from "./Nav";
import AppGate from "./AppGate";
import { useLocalStore } from "@/lib/local-store";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const modoRapido = pathname?.startsWith("/scan");
  const nivelAcesso = useLocalStore((s) => s.nivelAcesso);

  // Nível "arrecadações": acesso restrito só a essa secção — qualquer outro
  // caminho é redirecionado para lá.
  const forasDoPermitido =
    !modoRapido && nivelAcesso === "arrecadacoes" && !pathname?.startsWith("/arrecadacoes");

  useEffect(() => {
    if (forasDoPermitido) {
      router.replace("/arrecadacoes");
    }
  }, [forasDoPermitido, router]);

  if (modoRapido) {
    // Modo Saída Rápida: ecrã único, sem navegação nem acesso ao resto da app.
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <AppGate>
      <Nav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {forasDoPermitido ? null : children}
      </main>
      <footer className="text-center text-xs text-slate-400 py-4">
        Dados sincronizados entre todos os dispositivos e utilizadores.
      </footer>
    </AppGate>
  );
}
