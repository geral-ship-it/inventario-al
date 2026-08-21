"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { CATEGORIA_LABELS, formatarData } from "@/lib/format";

export default function PainelPage() {
  const produtos = useAppStore((s) => s.produtos);
  const stockArmazem = useAppStore((s) => s.stockArmazem);
  const arrecadacoes = useAppStore((s) => s.arrecadacoes);
  const faltas = useAppStore((s) => s.faltas);
  const listasCompras = useAppStore((s) => s.listasCompras);

  const stockBaixo = produtos
    .map((p) => {
      const stock = stockArmazem.find((s) => s.produtoId === p.id)?.quantidade ?? 0;
      return { produto: p, stock };
    })
    .filter((x) => x.stock <= x.produto.stockMinimoArmazem)
    .sort((a, b) => a.stock / a.produto.stockMinimoArmazem - b.stock / b.produto.stockMinimoArmazem);

  const faltasPendentes = faltas.filter((f) => !f.resolvido);
  const listaAberta = listasCompras.find((l) => l.estado === "aberta");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Painel geral</h1>
        <p className="text-sm text-slate-500">
          Resumo do inventÃ¡rio, arrecadaÃ§Ãµes e lista de compras em curso.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Produtos com stock baixo</p>
          <p className="text-2xl font-semibold text-red-600">{stockBaixo.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Faltas reportadas por resolver</p>
          <p className="text-2xl font-semibold text-amber-600">{faltasPendentes.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Itens na lista de compras aberta</p>
          <p className="text-2xl font-semibold text-slate-900">
            {listaAberta?.itens.length ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-medium">Alertas de stock a acabar</h2>
          <Link href="/inventario" className="text-sm text-slate-600 underline">
            Ver inventÃ¡rio
          </Link>
        </div>
        {stockBaixo.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Sem alertas neste momento.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stockBaixo.slice(0, 8).map(({ produto, stock }) => (
              <li key={produto.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{produto.nome}</p>
                  <p className="text-xs text-slate-500">{CATEGORIA_LABELS[produto.categoria]}</p>
                </div>
                <span className="text-red-600 font-medium">
                  {stock} / {produto.stockMinimoArmazem} {produto.unidade}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-medium">Faltas reportadas nas arrecadaÃ§Ãµes</h2>
          <Link href="/arrecadacoes" className="text-sm text-slate-600 underline">
            Ver arrecadaÃ§Ãµes
          </Link>
        </div>
        {faltasPendentes.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Nada por resolver.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {faltasPendentes.slice(0, 8).map((f) => {
              const produto = produtos.find((p) => p.id === f.produtoId);
              const arrecadacao = arrecadacoes.find((a) => a.id === f.arrecadacaoId);
              return (
                <li key={f.id} className="px-4 py-2.5 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {produto?.nome} â {arrecadacao?.nome}
                    </p>
                    <p className="text-xs text-slate-500">
                      Reportado em {formatarData(f.data)}
                    </p>
                  </div>
                  <span className="text-amber-600 font-medium">
                    faltam {f.quantidadeFalta}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
