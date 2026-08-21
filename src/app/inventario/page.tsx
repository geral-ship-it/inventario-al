"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORIA_LABELS, formatarDataHora } from "@/lib/format";
import QrScanner from "@/components/QrScanner";
import { CategoriaProduto } from "@/lib/types";

export default function InventarioPage() {
  const produtos = useAppStore((s) => s.produtos);
  const stockArmazem = useAppStore((s) => s.stockArmazem);
  const movimentos = useAppStore((s) => s.movimentos);
  const registarMovimento = useAppStore((s) => s.registarMovimento);
  const enviarParaListaCompras = useAppStore((s) => s.enviarParaListaCompras);

  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProduto | "todas">("todas");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const okCategoria = categoria === "todas" || p.categoria === categoria;
      const okPesquisa = p.nome.toLowerCase().includes(pesquisa.toLowerCase());
      return okCategoria && okPesquisa && p.ativo;
    });
  }, [produtos, categoria, pesquisa]);

  const produtoSelecionado = produtos.find((p) => p.id === produtoSelecionadoId);
  const stockSelecionado =
    stockArmazem.find((s) => s.produtoId === produtoSelecionadoId)?.quantidade ?? 0;

  function handleQr(texto: string) {
    const produto = produtos.find((p) => p.qrCode === texto || p.id === texto);
    if (produto) {
      setProdutoSelecionadoId(produto.id);
      setMensagem(`QR lido: ${produto.nome}`);
    } else {
      setMensagem("QR code nÃ£o corresponde a nenhum produto do catÃ¡logo.");
    }
  }

  function aplicarMovimento(tipo: "entrada" | "saida") {
    if (!produtoSelecionado || quantidade <= 0) return;
    registarMovimento(
      produtoSelecionado.id,
      tipo,
      quantidade,
      motivo || (tipo === "entrada" ? "ReposiÃ§Ã£o manual" : "SaÃ­da para apartamento/arrecadaÃ§Ã£o")
    );
    setMensagem(
      `${tipo === "entrada" ? "Entrada" : "SaÃ­da"} de ${quantidade} ${produtoSelecionado.unidade}(s) de "${produtoSelecionado.nome}" registada.`
    );
    setQuantidade(1);
    setMotivo("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">InventÃ¡rio â armazÃ©m principal</h1>
        <p className="text-sm text-slate-500">
          EcrÃ£ do dia a dia: quanto tÃªm em stock agora, e onde se regista cada entrada/saÃ­da. LÃª
          o QR code do produto ou pesquisa manualmente. (Para gerir o catÃ¡logo de produtos em si â
          nomes, categorias, etiquetas QR â usa a pÃ¡gina <strong>Produtos</strong>.)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <QrScanner onResult={handleQr} />

          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
            <label className="block text-sm font-medium">Pesquisa manual de produto</label>
            <select
              className="w-full border border-slate-200 rounded-md px-2 py-2 text-sm"
              value={produtoSelecionadoId ?? ""}
              onChange={(e) => setProdutoSelecionadoId(e.target.value || null)}
            >
              <option value="">â Selecionar produto â</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>

            {produtoSelecionado && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-sm">
                  Stock atual:{" "}
                  <span className="font-semibold">
                    {stockSelecionado} {produtoSelecionado.unidade}(s)
                  </span>{" "}
                  <span className="text-xs text-slate-400">
                    (mÃ­nimo {produtoSelecionado.stockMinimoArmazem})
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-20 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Motivo (opcional)"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
                  />
                </div>
                {produtoSelecionado.tipoRastreio === "lote" && (
                  <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                    Produto por caixa: {produtoSelecionado.unidadesPorEmbalagem}{" "}
                    {produtoSelecionado.unidade}s por caixa. A saÃ­da individual nÃ£o tem QR prÃ³prio â
                    usa &ldquo;Nova caixa aberta&rdquo; quando abrires uma, e ajusta a saÃ­da Ã  mÃ£o quando fizeres
                    a contagem periÃ³dica.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => aplicarMovimento("entrada")}
                    className="flex-1 rounded-md bg-emerald-600 text-white text-sm font-medium py-2 hover:bg-emerald-700"
                  >
                    + Entrada
                  </button>
                  <button
                    onClick={() => aplicarMovimento("saida")}
                    className="flex-1 rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-700"
                  >
                    â SaÃ­da
                  </button>
                </div>
                {produtoSelecionado.tipoRastreio === "lote" && produtoSelecionado.unidadesPorEmbalagem && (
                  <button
                    onClick={() => {
                      registarMovimento(
                        produtoSelecionado.id,
                        "entrada",
                        produtoSelecionado.unidadesPorEmbalagem!,
                        "Nova caixa aberta"
                      );
                      setMensagem(
                        `Caixa nova de "${produtoSelecionado.nome}" registada (+${produtoSelecionado.unidadesPorEmbalagem} ${produtoSelecionado.unidade}s).`
                      );
                    }}
                    className="w-full rounded-md border border-emerald-300 text-emerald-700 text-sm font-medium py-2 hover:bg-emerald-50"
                  >
                    Nova caixa aberta (+{produtoSelecionado.unidadesPorEmbalagem})
                  </button>
                )}
                <button
                  onClick={() => {
                    enviarParaListaCompras(produtoSelecionado.id, produtoSelecionado.stockMinimoArmazem);
                    setMensagem(`"${produtoSelecionado.nome}" enviado para a lista de compras.`);
                  }}
                  className="w-full rounded-md border border-slate-300 text-sm font-medium py-2 hover:bg-slate-50"
                >
                  Enviar para lista de compras
                </button>
              </div>
            )}

            {mensagem && <p className="text-xs text-slate-500 pt-1">{mensagem}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="border border-slate-200 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[200px]"
            />
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaProduto | "todas")}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="todas">Todas as categorias</option>
              {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Produto</th>
                  <th className="px-3 py-2 font-medium">Categoria</th>
                  <th className="px-3 py-2 font-medium text-right">Stock</th>
                  <th className="px-3 py-2 font-medium text-right">MÃ­nimo</th>
                  <th className="px-3 py-2 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.map((p) => {
                  const stock = stockArmazem.find((s) => s.produtoId === p.id)?.quantidade ?? 0;
                  const baixo = stock <= p.stockMinimoArmazem;
                  return (
                    <tr
                      key={p.id}
                      className={`cursor-pointer hover:bg-slate-50 ${baixo ? "bg-red-50" : ""}`}
                      onClick={() => setProdutoSelecionadoId(p.id)}
                    >
                      <td className="px-3 py-2 font-medium">{p.nome}</td>
                      <td className="px-3 py-2 text-slate-500">{CATEGORIA_LABELS[p.categoria]}</td>
                      <td className={`px-3 py-2 text-right ${baixo ? "text-red-600 font-semibold" : ""}`}>
                        {stock} {p.unidade}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-400">{p.stockMinimoArmazem}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            enviarParaListaCompras(p.id, p.stockMinimoArmazem);
                            setMensagem(`"${p.nome}" enviado para a lista de compras.`);
                          }}
                          className="text-xs text-slate-500 underline hover:text-slate-900"
                        >
                          + Lista
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <h2 className="font-medium text-sm">Ãltimos movimentos</h2>
            </div>
            {movimentos.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Ainda sem movimentos registados.</p>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {movimentos.slice(0, 20).map((m) => {
                  const produto = produtos.find((p) => p.id === m.produtoId);
                  return (
                    <li key={m.id} className="px-4 py-2 text-xs flex items-center justify-between">
                      <span>
                        <span
                          className={
                            m.tipo === "entrada" ? "text-emerald-600" : "text-slate-700"
                          }
                        >
                          {m.tipo === "entrada" ? "+" : "â"}
                          {m.quantidade}
                        </span>{" "}
                        {produto?.nome} â {m.motivo}
                      </span>
                      <span className="text-slate-400">{formatarDataHora(m.data)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
