"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useLocalStore } from "@/lib/local-store";
import QrScanner from "@/components/QrScanner";

export default function SaidaRapidaPage() {
  const modoRapidoUtilizadorId = useLocalStore((s) => s.modoRapidoUtilizadorId);
  const entrarModoRapido = useLocalStore((s) => s.entrarModoRapido);
  const sairModoRapido = useLocalStore((s) => s.sairModoRapido);
  const utilizadores = useAppStore((s) => s.utilizadores);
  const produtos = useAppStore((s) => s.produtos);
  const stockArmazem = useAppStore((s) => s.stockArmazem);
  const registarMovimento = useAppStore((s) => s.registarMovimento);

  const [pin, setPin] = useState("");
  const [erroPin, setErroPin] = useState<string | null>(null);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [confirmado, setConfirmado] = useState<string | null>(null);

  if (!modoRapidoUtilizadorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-xs text-center space-y-4">
          <h1 className="text-lg font-semibold">Modo Saída Rápida</h1>
          <p className="text-sm text-slate-500">Introduz o PIN da equipa para continuar.</p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-3 text-center text-2xl tracking-widest"
            placeholder="••••"
            maxLength={8}
          />
          {erroPin && <p className="text-xs text-red-600">{erroPin}</p>}
          <button
            onClick={() => {
              if (entrarModoRapido(pin, utilizadores)) {
                setPin("");
                setErroPin(null);
              } else {
                setErroPin("PIN incorreto.");
              }
            }}
            className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-3 hover:bg-slate-700"
          >
            Entrar
          </button>
          <Link href="/" className="block text-xs text-slate-400 underline">
            Voltar à app completa
          </Link>
        </div>
      </div>
    );
  }

  const utilizador = utilizadores.find((u) => u.id === modoRapidoUtilizadorId);
  const produto = produtos.find((p) => p.id === produtoId);
  const stock = produto ? stockArmazem.find((s) => s.produtoId === produto.id)?.quantidade ?? 0 : 0;

  function handleQr(texto: string) {
    const p = produtos.find((prod) => prod.qrCode === texto || prod.id === texto);
    if (!p) {
      setConfirmado(null);
      setProdutoId(null);
      return;
    }
    setProdutoId(p.id);
    setQuantidade(1);
    setConfirmado(null);
  }

  function confirmarSaida() {
    if (!produto) return;
    registarMovimento(
      produto.id,
      "saida",
      quantidade,
      `Saída via Modo Saída Rápida (${utilizador?.nome ?? "equipa"})`,
      modoRapidoUtilizadorId ?? undefined
    );
    setConfirmado(`Saída de ${quantidade} ${produto.unidade}(s) de "${produto.nome}" registada.`);
    setProdutoId(null);
    setQuantidade(1);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-6 gap-4">
      <div className="w-full max-w-sm flex items-center justify-between">
        <p className="text-sm font-medium">Olá, {utilizador?.nome ?? "equipa"}</p>
        <button onClick={sairModoRapido} className="text-xs text-slate-400 underline">
          Sair
        </button>
      </div>

      <div className="w-full max-w-sm">
        <QrScanner onResult={handleQr} />
      </div>

      {confirmado && (
        <p className="w-full max-w-sm text-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-3">
          {confirmado}
        </p>
      )}

      {produto && produto.tipoRastreio === "lote" && (
        <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
          <p className="font-medium">{produto.nome}</p>
          <p className="mt-1">
            Este produto controla-se por caixa ({produto.unidadesPorEmbalagem} {produto.unidade}s por
            caixa). A saída de unidades individuais não é registada aqui — avisa a administrativa/gestão
            para o registo periódico, ou usa este ecrã só quando abrires uma caixa nova (entrada).
          </p>
        </div>
      )}

      {produto && produto.tipoRastreio === "unitario" && (
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-5 text-center space-y-3">
          <p className="text-lg font-semibold">{produto.nome}</p>
          <p className="text-xs text-slate-400">
            Stock atual: {stock} {produto.unidade}(s)
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="w-12 h-12 rounded-full border border-slate-300 text-xl font-semibold"
            >
              −
            </button>
            <span className="text-3xl font-semibold w-12 text-center">{quantidade}</span>
            <button
              onClick={() => setQuantidade((q) => q + 1)}
              className="w-12 h-12 rounded-full border border-slate-300 text-xl font-semibold"
            >
              +
            </button>
          </div>
          <button
            onClick={confirmarSaida}
            className="w-full rounded-md bg-slate-900 text-white text-base font-semibold py-3 hover:bg-slate-700"
          >
            Confirmar saída
          </button>
        </div>
      )}
    </div>
  );
}
