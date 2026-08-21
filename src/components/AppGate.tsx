"use client";

import { useState } from "react";
import { useLocalStore } from "@/lib/local-store";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const acessoLiberado = useLocalStore((s) => s.acessoLiberado);
  const desbloquear = useLocalStore((s) => s.desbloquear);

  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  if (acessoLiberado) {
    return <>{children}</>;
  }

  function tentar() {
    if (desbloquear(password)) {
      setErro(null);
    } else {
      setErro("Password incorreta.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-xs text-center space-y-4">
        <h1 className="text-lg font-semibold">Inventário AL</h1>
        <p className="text-sm text-slate-500">Introduz a password de acesso para continuar.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErro(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") tentar();
          }}
          className="w-full border border-slate-300 rounded-md px-3 py-3 text-center text-lg"
          placeholder="Password"
        />
        {erro && <p className="text-xs text-red-600">{erro}</p>}
        <button
          onClick={tentar}
          className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-3 hover:bg-slate-700"
        >
          Entrar
        </button>
        <a href="/scan" className="block text-xs text-slate-400 underline">
          Sou da equipa de limpeza — Modo Saída Rápida
        </a>
      </div>
    </div>
  );
}
