"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useLocalStore } from "@/lib/local-store";
import { CATEGORIA_LABELS } from "@/lib/format";
import { CategoriaProduto, ROLES_GESTAO_CATALOGO, TipoRastreio } from "@/lib/types";
import QrLabel from "@/components/QrLabel";
import { encontrarParecidos } from "@/lib/similaridade";

export default function ProdutosPage() {
  const produtos = useAppStore((s) => s.produtos);
  const adicionarProduto = useAppStore((s) => s.adicionarProduto);
  const utilizadores = useAppStore((s) => s.utilizadores);
  const utilizadorAtualId = useLocalStore((s) => s.utilizadorAtualId);

  const utilizadorAtual = utilizadores.find((u) => u.id === utilizadorAtualId);
  const podeGerirCatalogo = utilizadorAtual
    ? ROLES_GESTAO_CATALOGO.includes(utilizadorAtual.role)
    : false;

  const [mostrarEtiquetas, setMostrarEtiquetas] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    categoria: "limpeza" as CategoriaProduto,
    unidade: "unidade",
    stockMinimoArmazem: 5,
    tipoRastreio: "unitario" as TipoRastreio,
    unidadesPorEmbalagem: 10,
  });
  const [confirmarMesmoAssim, setConfirmarMesmoAssim] = useState(false);

  const parecidos = useMemo(
    () => encontrarParecidos(novo.nome, produtos),
    [novo.nome, produtos]
  );

  function submeter() {
    if (!novo.nome.trim()) return;
    if (parecidos.length > 0 && !confirmarMesmoAssim) return; // pede confirmação primeiro
    adicionarProduto({
      nome: novo.nome.trim(),
      categoria: novo.categoria,
      unidade: novo.unidade,
      stockMinimoArmazem: novo.stockMinimoArmazem,
      ativo: true,
      tipoRastreio: novo.tipoRastreio,
      unidadesPorEmbalagem: novo.tipoRastreio === "lote" ? novo.unidadesPorEmbalagem : undefined,
    });
    setNovo({
      nome: "",
      categoria: "limpeza",
      unidade: "unidade",
      stockMinimoArmazem: 5,
      tipoRastreio: "unitario",
      unidadesPorEmbalagem: 10,
    });
    setConfirmarMesmoAssim(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold">Catálogo de produtos</h1>
          <p className="text-sm text-slate-500">
            Esta é a lista &ldquo;oficial&rdquo; do que existe (categorias, unidades, etiquetas QR). Mexe-se
            pouco — só quando aparece um produto novo. Para ver quanto têm em stock agora e
            registar entradas/saídas do dia a dia, usa a página <strong>Inventário</strong>.
          </p>
        </div>
        <button
          onClick={() => setMostrarEtiquetas((v) => !v)}
          className="rounded-md border border-slate-300 text-sm font-medium px-3 py-1.5 hover:bg-slate-50 print:hidden"
        >
          {mostrarEtiquetas ? "Ver lista" : "Ver / imprimir etiquetas QR"}
        </button>
      </div>

      {mostrarEtiquetas ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 bg-white p-4 rounded-lg border border-slate-200">
          {produtos.map((p) => (
            <QrLabel key={p.id} valor={p.qrCode} nome={p.nome} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Produto</th>
                <th className="px-3 py-2 font-medium">Categoria</th>
                <th className="px-3 py-2 font-medium">Unidáde</th>
                <th className="px-3 py-2 font-medium">Rastreio</th>
                <th className="px-3 py-2 font-medium text-right">Stock mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-medium">{p.nome}</td>
                  <td className="px-3 py-2 text-slate-500">{CATEGORIA_LABELS[p.categoria]}</td>
                  <td className="px-3 py-2 text-slate-500">{p.unidade}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {p.tipoRastreio === "lote" ? (
                      <span title={`Caixa de ${p.unidadesPorEmbalagem} ${p.unidade}s`}>
                        Por caixa ({p.unidadesPorEmbalagem})
                      </span>
                    ) : (
                      "Unitário"
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500">{p.stockMinimoArmazem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {podeGerirCatalogo ? (
        <div className="bg-white rounded-lg border border-slate-200 p-4 max-w-lg print:hidden">
          <h2 className="font-medium text-sm mb-3">Adicionar novo produto ao catálogo</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nome do produto"
              value={novo.nome}
              onChange={(e) => {
                setNovo({ ...novo, nome: e.target.value });
                setConfirmarMesmoAssim(false);
              }}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm sm:col-span-2"
            />

            {parecidos.length > 0 && (
              <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800 space-y-1">
                <p className="font-medium">Já existe produto parecido no catálogo:</p>
                <ul className="list-disc list-inside">
                  {parecidos.map((p) => (
                    <li key={p.id}>{p.nome}</li>
                  ))}
                </ul>
                <p>Se for mesmo o mesmo produto, usa esse em vez de criar um novo.</p>
                <label className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={confirmarMesmoAssim}
                    onChange={(e) => setConfirmarMesmoAssim(e.target.checked)}
                  />
                  É mesmo um produto diferente — criar na mesma
                </label>
              </div>
            )}

            <select
              value={novo.categoria}
              onChange={(e) => setNovo({ ...novo, categoria: e.target.value as CategoriaProduto })}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              {Object.entries(CATEGORIA_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Unidade (ex: rolo, frasco)"
              value={novo.unidade}
              onChange={(e) => setNovo({ ...novo, unidade: e.target.value })}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              min={0}
              placeholder="Stock mínimo no armazém"
              value={novo.stockMinimoArmazem}
              onChange={(e) => setNovo({ ...novo, stockMinimoArmazem: Number(e.target.value) })}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            />
            <select
              value={novo.tipoRastreio}
              onChange={(e) => setNovo({ ...novo, tipoRastreio: e.target.value as TipoRastreio })}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="unitario">Rastreio unitário (QR = a unidade)</option>
              <option value="lote">Por caixa/lote (QR só na caixa)</option>
            </select>
            {novo.tipoRastreio === "lote" && (
              <input
                type="number"
                min={1}
                placeholder="Unidades por caixa"
                value={novo.unidadesPorEmbalagem}
                onChange={(e) =>
                  setNovo({ ...novo, unidadesPorEmbalagem: Number(e.target.value) })
                }
                className="border border-slate-200 rounded-md px-2 py-1.5 text-sm sm:col-span-2"
              />
            )}
          </div>
          <button
            onClick={submeter}
            disabled={parecidos.length > 0 && !confirmarMesmoAssim}
            className="mt-3 w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-700 disabled:opacity-40"
          >
            Adicionar produto
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 print:hidden">
          Só a gestão e a administrativa podem adicionar produtos novos ao catálogo, para evitar
          duplicados com nomes diferentes para o mesmo produto.
        </p>
      )}
    </div>
  );
}
