"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore, extrairDadosPartilhados, DadosPartilhados } from "@/lib/store";

const INTERVALO_POLL_MS = 8000;
const DEBOUNCE_PUSH_MS = 1200;

type EstadoSync = "a carregar" | "sincronizado" | "a guardar" | "erro";

interface RespostaEstado {
  versao: number;
  atualizadoEm: string;
  dados: DadosPartilhados;
}

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const [estado, setEstado] = useState<EstadoSync>("a carregar");

  // Refs (não React state) porque são só "livros de contas" internos do
  // ciclo de sincronização — não devem provocar re-renders.
  const versaoConhecidaRef = useRef(0);
  const aHidratarRef = useRef(false); // impede que hydrate() dispare um push
  const prontoRef = useRef(false); // só reage a mudanças depois da 1ª carga
  const pushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelado = false;

    function aplicarHidratacao(resposta: RespostaEstado) {
      aHidratarRef.current = true;
      hydrate(resposta.dados);
      aHidratarRef.current = false;
      versaoConhecidaRef.current = resposta.versao;
    }

    async function carregarInicial() {
      try {
        const resp = await fetch("/api/state", { cache: "no-store" });
        if (!resp.ok) throw new Error(`GET /api/state falhou (${resp.status})`);
        const corpo: RespostaEstado = await resp.json();
        if (cancelado) return;
        aplicarHidratacao(corpo);
        prontoRef.current = true;
        setEstado("sincronizado");
      } catch {
        if (!cancelado) setEstado("erro");
      }
    }

    async function empurrarAlteracoes() {
      pushTimeoutRef.current = null;
      setEstado("a guardar");
      const dados = extrairDadosPartilhados(useAppStore.getState());
      try {
        const resp = await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versaoBase: versaoConhecidaRef.current, dados }),
        });
        const corpo: RespostaEstado = await resp.json();
        if (resp.status === 409) {
          // Outra pessoa gravou primeiro. Aceitamos a versão dela em vez de
          // sobrepor às cegas — a nossa alteração local mais recente fica
          // por gravar; o utilizador pode repeti-la se necessário.
          aplicarHidratacao(corpo);
          setEstado("sincronizado");
          return;
        }
        if (!resp.ok) throw new Error(`POST /api/state falhou (${resp.status})`);
        versaoConhecidaRef.current = corpo.versao;
        setEstado("sincronizado");
      } catch {
        setEstado("erro");
      }
    }

    carregarInicial();

    const unsubscribe = useAppStore.subscribe(() => {
      if (!prontoRef.current || aHidratarRef.current) return;
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
      pushTimeoutRef.current = setTimeout(empurrarAlteracoes, DEBOUNCE_PUSH_MS);
    });

    const intervalo = setInterval(async () => {
      // Não interrompe uma escrita pendente/local por gravar.
      if (!prontoRef.current || pushTimeoutRef.current) return;
      try {
        const resp = await fetch("/api/state", { cache: "no-store" });
        if (!resp.ok) return;
        const corpo: RespostaEstado = await resp.json();
        if (corpo.versao !== versaoConhecidaRef.current) {
          aplicarHidratacao(corpo);
          setEstado("sincronizado");
        }
      } catch {
        // Silencioso: mantém os últimos dados conhecidos até voltar a haver ligação.
      }
    }, INTERVALO_POLL_MS);

    return () => {
      cancelado = true;
      unsubscribe();
      clearInterval(intervalo);
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
    };
  }, [hydrate]);

  return (
    <>
      {children}
      <div
        className="fixed bottom-2 right-2 text-[10px] px-2 py-1 rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm z-50"
        title="Estado da sincronização com os outros dispositivos"
      >
        {estado === "a carregar" && "A carregar dados partilhados…"}
        {estado === "sincronizado" && "● Sincronizado"}
        {estado === "a guardar" && "A guardar…"}
        {estado === "erro" && "⚠ Sem ligação — a usar os últimos dados conhecidos"}
      </div>
    </>
  );
}
