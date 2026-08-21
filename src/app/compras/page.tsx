"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatarData, formatarPreco } from "@/lib/format";
import { LOJAS } from "@/lib/types";
import QrScanner from "@/components/QrScanner";

export default function ComprasPage() {
  const produtos = useAppStore((s) => s.produtos);
  const arrecadacoes = useAppStore((s) => s.arrecadacoes);
  const listasCompras = useAppStore((s) => s.listasCompras);
  const precos = useAppStore((s) => s.precos);
  const criarItemManualNaListaAberta = useAppStore((s) => s.criarItemManualNaListaAberta);
  const fecharListaAberta = useAppStore((s) => s.fecharListaAberta);
  const marcarItemRecebido = useAppStore((s) => s.marcarItemRecebido);
  const definirLojaItem = useAppStore((s) => s.definirLojaItem);
  const concluirLista = useAppStore((s) => s.concluirLista);

  const [produtoManual, setProdutoManual] = useState("");
  const [quantidadeManual, setQuantidadeManual] = useState(1);
  const [mostrarScanner, setMostrarScanner] = useState(false);
  const [mensagemQr, setMensagemQr] = useState<string | null>(null);

  const listaAberta = listasCompras.find((l) => l.estado === "aberta");
  const listaFechada = listasCompras.find((l) => l.estado === "fechada");
  const historico = listasCompras.filter((l) => l.estado == "concluida");

  function precoMaisBarato(produtoId: string) {
    const opcoes = precos.filter((p) => p.produtoId === produtoId);
    if (opcoes.length === 0) return null;
    return opcoes.reduce((min, p) => (p.preco < min.preco ? p : min), opcoes[0]);
  }

  function precoNaLoja(produtoId: string, loja: string) {
    return precos.find((p) => p.produtoId === produtoId && p.loja === loja)?.preco;
  }

  function handleQr(texto: string) {
    const produto = produtos.find((p) => p.qrCode === texto || p.id === texto);
    if (!produto) {
      setMensagemQr("QR code nÃ£o corresponde a nenhum produto do catÃ¡logo.");
      return;
    }
    criarItemManualNaListaAberta(produto.id, 1);
    setMensagemQr(`â${produto.nome}â adicionado Ã  lista de compras.`);
  }

  const totalPorLoja = useMemo(() => {
    const totais: Record<string, number> = {};
    if (!listaAberta) return totais;
    listaAberta.itens.forEach((it) => {
      const opcoes = precos.filter((p) => p.produtoId === it.produtoId);
      if (opcoes.length === 0) return;
      const maisBarato = opcoes.reduce((min, p) => (p.preco < min.preco ? p : min), opcoes[0]);
      const loja = it.lojaEscolhida ?? maisBarato.loja;
      const preco = it.lojaEscolhida
        ? opcoes.find((p) => p.loja === it.lojaEscolhida)?.preco
        : maisBarato.preco;
      if (!loja || preco === undefined) return;
      totais[loja] = (totais[loja] ?? 0) + preco * it.quantidade;
    });
    return totais;
  }, [listaAberta, precos]);

  const totalGeral = Object.values(totalPorLoja).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Lista de compras</h1>
        <p className="text-sm text-slate-500">
          Lista quinzenal. Junta pedidos das arrecadaÃ§Ãµes, itens do armazÃ©m e itens manuais;
          quando estiver pronta, fecha para ir Ã s compras.
        </p>
      </div>

      {listaAberta && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-medium">Lista aberta</h2>
              <p className="text-xs text-slate-400">Criada em {formatarData(listaAberta.criadaEm)}</p>
            </div>
            <button
              onClick={fecharListaAberta}
              disabled={listaAberta.itens.length === 0}
              className="rounded-md bg-slate-900 text-white text-sm font-medium px-3 py-1.5 disabled:opacity-40 hover:bg-slate-700"
            >
              Fechar lista (ir Ã s compras)
            </button>
          </div>

          {listaAberta.itens.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Ainda sem itens nesta lista.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {listaAberta.itens.map((it) => {
                const produto = produtos.find((p) => p.id === it.produtoId);
                const arrecadacao = arrecadacoes.find((a) => a.id === it.arrecadacaoId);
                const barato = precoMaisBarato(it.produtoId);
                const opcoesPreco = precos.filter((p) => p.produtoId === it.produtoId);
                return (
                  <li key={it.id} className="px-4 py-2.5 text-sm flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {produto?.nome} Ã {it.quantidade}
                      </p>
                      <p className="text-xs text-slate-400">
                        {it.origem === "arrecadacao"
                          ? `Pedido por: ${arrecadacao?.nome}`
                          : it.origem === "armazem"
                          ? "Stock baixo no armazÃ©m"
                          : "Adicionado manualmente"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {opcoesPreco.length > 0 ? (
                        <select
                          value={it.lojaEscolhida ?? barato?.loja ?? ""}
                          onChange={(e) => {
                            const preco = precoNaLoja(it.produtoId, e.target.value) ?? 0;
                            definirLojaItem(listaAberta.id, it.id, e.target.value, preco);
                          }}
                          className="border border-slate-200 rounded-md px-1.5 py-1 text-xs"
                        >
                          {opcoesPreco
                            .sort((a, b) => a.preco - b.preco)
                            .map((p) => (
                              <option key={p.loja} value={p.loja}>
                                {p.loja} â {formatarPreco(p.preco)}
                                {barato && p.loja === barato.loja ? " (mais barato)" : ""}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400">sem preÃ§o registado</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {totalGeral > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-sm space-y-1">
              <p className="font-medium mb-1">Carrinho â total estimado por loja</p>
              {Object.entries(totalPorLoja).map(([loja, total]) => (
                <div key={loja} className="flex items-center justify-between text-xs">
                  <span>{loja}</span>
                  <span>{formatarPreco(total)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-semibold">
                <span>Total geral</span>
                <span>{formatarPreco(totalGeral)}</span>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Adicionar item</span>
              <button
                onClick={() => setMostrarScanner((v) => !v)}
                className="text-xs text-slate-600 underline"
              >
                {mostrarScanner ? "Esconder leitor QR" : "Ler QR code"}
              </button>
            </div>

            {mostrarScanner && (
              <div className="max-w-xs">
                <QrScanner onResult={handleQr} />
                {mensagemQr && <p className="text-xs text-slate-500 mt-1">{mensagemQr}</p>}
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={produtoManual}
                onChange={(e) => setProdutoManual(e.target.value)}
                className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Adicionar item manualmenteâ¦</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={quantidadeManual}
                onChange={(e) => setQuantidadeManual(Number(e.target.value))}
                className="w-16 border border-slate-200 rounded-md px-1.5 py-1.5 text-sm"
              />
              <button
                onClick={() => {
                  if (!produtoManual) return;
                  criarItemManualNaListaAberta(produtoManual, quantidadeManual);
                  setProdutoManual("");
                  setQuantidadeManual(1);
                }}
                className="rounded-md bg-slate-900 text-white text-sm px-3 hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {listaFechada && (
        <div className="bg-white rounded-lg border border-amber-200">
          <div className="px-4 py-3 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
            <div>
              <h2 className="font-medium">Lista fechada â a aguardar recepÃ§Ã£o</h2>
              <p className="text-xs text-slate-500">
                Fechada em {listaFechada.fechadaEm && formatarData(listaFechada.fechadaEm)}. Marca cada
                item como recebido Ã  medida que a administrativa entrega no armazÃ©m.
              </p>
            </div>
            <button
              onClick={() => concluirLista(listaFechada.id)}
              className="rounded-md bg-emerald-600 text-white text-sm font-medium px-3 py-1.5 hover:bg-emerald-700"
            >
              Confirmar reposiÃ§Ã£o e dar entrada no stock
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {listaFechada.itens.map((it) => {
              const produto = produtos.find((p) => p.id === it.produtoId);
              return (
                <li key={it.id} className="px-4 py-2.5 text-sm flex items-center justify-between">
                  <span>
                    {produto?.nome} Ã {it.quantidade}
                    {it.lojaEscolhida && (
                      <span className="text-xs text-slate-400"> â {it.lojaEscolhida}</span>
                    )}
                  </span>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={it.recebido}
                      onChange={() => marcarItemRecebido(listaFechada.id, it.id)}
                    />
                    Recebido
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-medium">HistÃ³rico de listas concluÃ­das</h2>
        </div>
        {historico.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Ainda sem listas concluÃ­das.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {historico.map((l) => (
              <li key={l.id} className="px-4 py-2.5 text-sm flex items-center justify-between">
                <span>Lista de {formatarData(l.criadaEm)}</span>
                <span className="text-slate-400 text-xs">{l.itens.length} itens</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Lojas configuradas para comparaÃ§Ã£o de preÃ§os: {LOJAS.join(", ")}.
      </p>
    </div>
  );
}
