"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useLocalStore } from "@/lib/local-store";

export default function ArrecadacoesPage() {
  const arrecadacoes = useAppStore((s) => s.arrecadacoes);
  const apartamentos = useAppStore((s) => s.apartamentos);
  const faltas = useAppStore((s) => s.faltas);
  const criarArrecadacao = useAppStore((s) => s.criarArrecadacao);
  const acessoRestrito = useLocalStore((s) => s.nivelAcesso) === "arrecadacoes";

  const [nomeNovo, setNomeNovo] = useState("");
  const [tipoNovo, setTipoNovo] = useState<"arrecadacao" | "armario">("arrecadacao");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Arrecadações</h1>
        <p className="text-sm text-slate-500">
          Cada arrecadação pode servir um ou vários apartamentos. Abre uma para rever a
          checklist semanal ou reportar o que falta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {arrecadacoes.map((a) => {
          const nomesApts = a.apartamentoIds
            .map((id) => apartamentos.find((ap) => ap.id === id)?.nome)
            .filter(Boolean);
          const faltasAtivas = faltas.filter((f) => f.arrecadacaoId === a.id && !f.resolvido);
          return (
            <Link
              key={a.id}
              href={`/arrecadacoes/${a.id}`}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-medium">{a.nome}</h2>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
                  {a.tipo === "armario" ? "Armário" : "Arrecadação"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {nomesApts.length > 0 ? nomesApts.join(", ") : "Sem apartamento associado"}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {a.checklist.length} produtos na checklist
              </p>
              {faltasAtivas.length > 0 && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  {faltasAtivas.length} falta(s) por resolver
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {!acessoRestrito && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 max-w-md">
          <h2 className="font-medium text-sm mb-3">Adicionar nova arrecadação</h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Nome (ex: Arrecadação Rato — Zona Nova)"
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            />
            <select
              value={tipoNovo}
              onChange={(e) => setTipoNovo(e.target.value as "arrecadacao" | "armario")}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="arrecadacao">Arrecadação</option>
              <option value="armario">Armário</option>
            </select>
            <button
              onClick={() => {
                if (!nomeNovo.trim()) return;
                criarArrecadacao(nomeNovo.trim(), tipoNovo);
                setNomeNovo("");
              }}
              className="rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-700"
            >
              Criar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
