"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORIA_LABELS, formatarPreco } from "@/lib/format";

interface OpcaoMes {
  chave: string; // "todos" ou "AAAA-MM"
  label: string;
}

function chaveMes(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(chave: string): string {
  const [ano, mes] = chave.split("-").map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export default function RelatoriosPage() {
  const produtos = useAppStore((s) => s.produtos);
  const movimentos = useAppStore((s) => s.movimentos);
  const gastosArrecadacao = useAppStore((s) => s.gastosArrecadacao);
  const arrecadacoes = useAppStore((s) => s.arrecadacoes);

  const [periodo, setPeriodo] = useState("todos");
  const [ordem, setOrdem] = useState<"desc" | "asc">("desc");

  const opcoesMes = useMemo<OpcaoMes[]>(() => {
    const chaves = new Set(
      movimentos.filter((m) => m.tipo === "saida").map((m) => chaveMes(m.data))
    );
    return [
      { chave: "todos", label: "Todo o histórico" },
      ...Array.from(chaves)
        .sort((a, b) => (a < b ? 1 : -1))
        .map((chave) => ({ chave, label: labelMes(chave) })),
    ];
  }, [movimentos]);

  const saidasFiltradas = useMemo(() => {
    return movimentos.filter((m) => {
      if (m.tipo !== "saida") return false;
      if (periodo === "todos") return true;
      return chaveMes(m.data) === periodo;
    });
  }, [movimentos, periodo]);

  const consumoPorProduto = useMemo(() => {
    const totais = new Map<string, number>();
    for (const m of saidasFiltradas) {
      totais.set(m.produtoId, (totais.get(m.produtoId) ?? 0) + m.quantidade);
    }
    const linhas = produtos
      .filter((p) => p.ativo)
      .map((p) => ({
        produto: p,
        quantidade: totais.get(p.id) ?? 0,
      }));
    linhas.sort((a, b) =>
      ordem === "desc" ? b.quantidade - a.quantidade : a.quantidade - b.quantidade
    );
    return linhas;
  }, [produtos, saidasFiltradas, ordem]);

  const maisConsumido = consumoPorProduto.length > 0 ? [...consumoPorProduto].sort((a, b) => b.quantidade - a.quantidade)[0] : null;
  const menosConsumido =
    consumoPorProduto.length > 0
      ? [...consumoPorProduto].sort((a, b) => a.quantidade - b.quantidade)[0]
      : null;

  const gastoTotalOperacao = gastosArrecadacao.reduce((soma, g) => soma + g.custo, 0);
  const gastoPorMesOperacao = useMemo(() => {
    const totais = new Map<string, number>();
    for (const g of gastosArrecadacao) {
      const chave = chaveMes(g.data);
      totais.set(chave, (totais.get(chave) ?? 0) + g.custo);
    }
    return Array.from(totais.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([chave, valor]) => ({ chave, label: labelMes(chave), valor }));
  }, [gastosArrecadacao]);

  // Exporta em CSV (delimitado por ";", que é o que o Excel em português
  // espera por definição) — o Excel abre isto diretamente, sem precisar de
  // nenhuma biblioteca extra na aplicação.
  function linhaCsv(campos: (string | number)[]): string {
    return campos
      .map((c) => {
        const texto = String(c);
        return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
      })
      .join(";");
  }

  function exportarCsv() {
    const linhas: string[] = [];

    linhas.push("Produtos mais / menos consumidos");
    linhas.push(linhaCsv(["#", "Produto", "Categoria", "Quantidade consumida", "Unidade"]));
    consumoPorProduto.forEach((linha, i) => {
      linhas.push(
        linhaCsv([
          i + 1,
          linha.produto.nome,
          CATEGORIA_LABELS[linha.produto.categoria],
          linha.quantidade,
          linha.produto.unidade,
        ])
      );
    });

    linhas.push("");
    linhas.push("Gasto total por mês (toda a operação)");
    linhas.push(linhaCsv(["Mês", "Gasto total (EUR)"]));
    gastoPorMesOperacao
      .slice()
      .reverse()
      .forEach((m) => linhas.push(linhaCsv([m.label, m.valor.toFixed(2)])));
    linhas.push(linhaCsv(["TOTAL", gastoTotalOperacao.toFixed(2)]));

    // BOM UTF-8 para os acentos aparecerem corretamente no Excel.
    const conteudo = "﻿" + linhas.join("\n");
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const sufixo = periodo === "todos" ? "todo-o-historico" : periodo;
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-inventario-${sufixo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Relatórios</h1>
          <p className="text-sm text-slate-500">
            Consumo de produtos e gasto da operação, calculados a partir do histórico de
            movimentos e das compras já concluídas — não é preciso nenhum Excel à parte para isto
            funcionar, mas podes exportar os dados abaixo se precisares.
          </p>
        </div>
        <button
          onClick={exportarCsv}
          className="rounded-md border border-slate-300 text-sm font-medium px-3 py-1.5 hover:bg-slate-50 whitespace-nowrap"
        >
          Exportar para Excel (.csv)
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Gasto total (toda a operação)</p>
          <p className="text-2xl font-semibold text-slate-900">{formatarPreco(gastoTotalOperacao)}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Produto mais consumido</p>
          <p className="text-base font-semibold text-slate-900 truncate">
            {maisConsumido && maisConsumido.quantidade > 0 ? maisConsumido.produto.nome : "—"}
          </p>
          {maisConsumido && maisConsumido.quantidade > 0 && (
            <p className="text-xs text-slate-400">
              {maisConsumido.quantidade} {maisConsumido.produto.unidade}(s)
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Produto menos consumido</p>
          <p className="text-base font-semibold text-slate-900 truncate">
            {menosConsumido ? menosConsumido.produto.nome : "—"}
          </p>
          {menosConsumido && (
            <p className="text-xs text-slate-400">
              {menosConsumido.quantidade} {menosConsumido.produto.unidade}(s)
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">Produtos mais / menos consumidos</h2>
          <div className="flex items-center gap-2">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="border border-slate-200 rounded-md px-2 py-1 text-xs capitalize"
            >
              {opcoesMes.map((o) => (
                <option key={o.chave} value={o.chave} className="capitalize">
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setOrdem((o) => (o === "desc" ? "asc" : "desc"))}
              className="text-xs text-slate-500 underline whitespace-nowrap"
            >
              {ordem === "desc" ? "A ver: mais consumidos primeiro" : "A ver: menos consumidos primeiro"}
            </button>
          </div>
        </div>
        {saidasFiltradas.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Ainda sem saídas de stock registadas neste período.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {consumoPorProduto.map((linha, i) => (
              <li key={linha.produto.id} className="px-4 py-2 text-sm flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-slate-400 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{linha.produto.nome}</p>
                    <p className="text-xs text-slate-400">{CATEGORIA_LABELS[linha.produto.categoria]}</p>
                  </div>
                </div>
                <span className="font-medium shrink-0 pl-2">
                  {linha.quantidade} {linha.produto.unidade}(s)
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">
          Calculado a partir das saídas de stock do armazém (registadas em Inventário e no Modo
          Saída Rápida). Produtos sem saídas no período aparecem com 0.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-medium">Gasto total por mês (toda a operação)</h2>
          <span className="text-sm font-semibold">{formatarPreco(gastoTotalOperacao)}</span>
        </div>
        {gastoPorMesOperacao.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Ainda sem compras concluídas.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {gastoPorMesOperacao.map((m) => (
              <li key={m.chave} className="px-4 py-2 text-sm flex items-center justify-between">
                <span className="capitalize">{m.label}</span>
                <span className="font-medium">{formatarPreco(m.valor)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">
          Soma do gasto de todas as arrecadações ({arrecadacoes.length}), calculado a partir do
          preço registado em cada compra concluída da lista quinzenal.
        </p>
      </div>
    </div>
  );
}
