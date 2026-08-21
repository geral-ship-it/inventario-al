"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatarDataHora, formatarPreco } from "@/lib/format";
import { LOJAS, LOJAS_AUTOMATIZAVEIS } from "@/lib/types";

export default function PrecosPage() {
  const produtos = useAppStore((s) => s.produtos);
  const precos = useAppStore((s) => s.precos);
  const atualizarPreco = useAppStore((s) => s.atualizarPreco);

  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [loja, setLoja] = useState<(typeof LOJAS)[number]>("Continente");
  const [preco, setPreco] = useState<number>(0);

  const precosDoProduto = precos
    .filter((p) => p.produtoId === produtoId)
    .sort((a, b) => a.preco - b.preco);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Preços por loja</h1>
        <p className="text-sm text-slate-500">
          Continente, Pingo Doce, Auchan e Lidl têm catálogo online — pensados para
          atualização automática periódica. Makro, Recheio e Poupança exigem registo
          próprio, por isso ficam com inserção manual.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Produto</th>
              {LOJAS.map((l) => (
                <th key={l} className="px-3 py-2 font-medium text-right">
                  {l}
                  {LOJAS_AUTOMATIZAVEIS.includes(l) && (
                    <span className="block text-[10px] text-emerald-600 font-normal">auto</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtos.map((p) => {
              const linha = LOJAS.map((l) => precos.find((pr) => pr.produtoId === p.id && pr.loja === l));
              const valores = linha.filter(Boolean).map((pr) => pr!.preco);
              const minimo = valores.length ? Math.min(...valores) : null;
              return (
                <tr key={p.id} className={produtoId === p.id ? "bg-slate-50" : ""}>
                  <td
                    className="px-3 py-2 font-medium cursor-pointer hover:underline"
                    onClick={() => setProdutoId(p.id)}
                  >
                    {p.nome}
                  </td>
                  {linha.map((pr, i) => (
                    <td
                      key={LOJAS[i]}
                      className={`px-3 py-2 text-right ${
                        pr && pr.preco === minimo ? "text-emerald-600 font-semibold" : "text-slate-500"
                      }`}
                    >
                      {pr ? formatarPreco(pr.preco) : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-medium text-sm mb-3">Registar / atualizar preço</h2>
          <div className="grid gap-2">
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={loja}
                onChange={(e) => setLoja(e.target.value as (typeof LOJAS)[number])}
                className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
              >
                {LOJAS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min={0}
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                className="w-24 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <button
              onClick={() => {
                if (!produtoId || preco <= 0) return;
                atualizarPreco(produtoId, loja, preco, false);
                setPreco(0);
              }}
              className="rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-700"
            >
              Guardar preço (registo manual)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-medium text-sm">
              Histórico do produto selecionado ({produtos.find((p) => p.id === produtoId)?.nome})
            </h2>
          </div>
          {precosDoProduto.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Ainda sem preços registados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {precosDoProduto.map((pr) => (
                <li key={pr.id} className="px-4 py-2 text-sm flex items-center justify-between">
                  <span>
                    {pr.loja} — {formatarPreco(pr.preco)}{" "}
                    {pr.automatico && (
                      <span className="text-[10px] text-emerald-600 uppercase ml-1">auto</span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">{formatarDataHora(pr.atualizadoEm)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 max-w-2xl">
        Nota técnica: a atualização automática para Continente, Pingo Doce, Auchan e Lidl vai
        ser feita por uma tarefa agendada que consulta os catálogos públicos destas lojas.
        Como os sites mudam com frequência, esta parte vai precisar de manutenção periódica —
        os preços manuais continuam sempre disponíveis como alternativa fiável.
      </p>
    </div>
  );
}
