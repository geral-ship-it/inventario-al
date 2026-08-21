"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatarData, formatarPreco } from "@/lib/format";

export default function ArrecadacaoDetalheClient({ id: idInicial }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  // Em produção estática, um id que não foi pré-gerado é servido através de um
  // redirect de fallback (ver netlify.toml) usando o HTML de outra página; por
  // isso o id real é sempre derivado do URL do browser, não da prop de build.
  const idDoUrl = pathname?.split("/").filter(Boolean).pop();
  const id = idDoUrl || idInicial;
  const arrecadacoes = useAppStore((s) => s.arrecadacoes);
  const apartamentos = useAppStore((s) => s.apartamentos);
  const produtos = useAppStore((s) => s.produtos);
  const faltas = useAppStore((s) => s.faltas);
  const gastosArrecadacao = useAppStore((s) => s.gastosArrecadacao);
  const reportarFalta = useAppStore((s) => s.reportarFalta);
  const resolverFalta = useAppStore((s) => s.resolverFalta);
  const atualizarChecklistArrecadacao = useAppStore((s) => s.atualizarChecklistArrecadacao);
  const associarApartamento = useAppStore((s) => s.associarApartamento);

  const arrecadacao = arrecadacoes.find((a) => a.id === id);

  const [produtoParaAdicionar, setProdutoParaAdicionar] = useState("");
  const [quantidadeParaAdicionar, setQuantidadeParaAdicionar] = useState(1);
  const [apartamentoParaAssociar, setApartamentoParaAssociar] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);

  if (!arrecadacao) {
    return (
      <div className="text-sm text-slate-500">
        Arrecadação não encontrada.{" "}
        <button className="underline" onClick={() => router.push("/arrecadacoes")}>
          Voltar
        </button>
      </div>
    );
  }

  const nomesApts = arrecadacao.apartamentoIds
    .map((id) => apartamentos.find((a) => a.id === id))
    .filter(Boolean);
  const apartamentosDisponiveis = apartamentos.filter(
    (a) => !arrecadacao.apartamentoIds.includes(a.id)
  );
  const faltasArrecadacao = faltas.filter((f) => f.arrecadacaoId === arrecadacao.id);

  const gastosDestaArrecadacao = gastosArrecadacao.filter(
    (g) => g.arrecadacaoId === arrecadacao.id
  );
  const gastoTotal = gastosDestaArrecadacao.reduce((soma, g) => soma + g.custo, 0);
  const gastoPorMes = gastosDestaArrecadacao.reduce<Record<string, number>>((acc, g) => {
    const mes = new Date(g.data).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
    acc[mes] = (acc[mes] ?? 0) + g.custo;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <button
          className="text-sm text-slate-500 underline mb-2"
          onClick={() => router.push("/arrecadacoes")}
        >
          ← Voltar a arrecadações
        </button>
        <h1 className="text-xl font-semibold">{arrecadacao.nome}</h1>
        <p className="text-sm text-slate-500">
          Serve: {nomesApts.length > 0 ? nomesApts.map((a) => a!.nome).join(", ") : "nenhum apartamento associado"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-medium">Checklist semanal de referência</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {arrecadacao.checklist.map((item) => {
              const produto = produtos.find((p) => p.id === item.produtoId);
              return (
                <li key={item.produtoId} className="px-4 py-2 flex items-center justify-between text-sm">
                  <span>{produto?.nome}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      defaultValue={item.quantidadeReferencia}
                      onBlur={(e) =>
                        atualizarChecklistArrecadacao(
                          arrecadacao.id,
                          item.produtoId,
                          Number(e.target.value)
                        )
                      }
                      className="w-16 border border-slate-200 rounded-md px-1.5 py-1 text-right"
                    />
                    <button
                      className="text-xs text-amber-600 font-medium"
                      onClick={() => {
                        reportarFalta(arrecadacao.id, item.produtoId, item.quantidadeReferencia);
                        setMensagem(`Falta de "${produto?.nome}" reportada e enviada para a lista de compras.`);
                      }}
                    >
                      Reportar falta
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <select
              value={produtoParaAdicionar}
              onChange={(e) => setProdutoParaAdicionar(e.target.value)}
              className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">Adicionar produto à checklist…</option>
              {produtos
                .filter((p) => !arrecadacao.checklist.some((c) => c.produtoId === p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </select>
            <input
              type="number"
              min={1}
              value={quantidadeParaAdicionar}
              onChange={(e) => setQuantidadeParaAdicionar(Number(e.target.value))}
              className="w-16 border border-slate-200 rounded-md px-1.5 py-1.5 text-sm"
            />
            <button
              onClick={() => {
                if (!produtoParaAdicionar) return;
                atualizarChecklistArrecadacao(
                  arrecadacao.id,
                  produtoParaAdicionar,
                  quantidadeParaAdicionar
                );
                setProdutoParaAdicionar("");
                setQuantidadeParaAdicionar(1);
              }}
              className="rounded-md bg-slate-900 text-white text-sm px-3 hover:bg-slate-700"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="font-medium">Faltas reportadas</h2>
            </div>
            {faltasArrecadacao.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Nenhuma falta reportada ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {faltasArrecadacao.map((f) => {
                  const produto = produtos.find((p) => p.id === f.produtoId);
                  return (
                    <li key={f.id} className="px-4 py-2.5 text-sm flex items-center justify-between">
                      <div>
                        <p className={f.resolvido ? "line-through text-slate-400" : "font-medium"}>
                          {produto?.nome} — faltam {f.quantidadeFalta}
                        </p>
                        <p className="text-xs text-slate-400">{formatarData(f.data)}</p>
                      </div>
                      {!f.resolvido && (
                        <button
                          className="text-xs text-emerald-600 font-medium"
                          onClick={() => resolverFalta(f.id)}
                        >
                          Marcar resolvida
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-medium">Gasto acumulado</h2>
              <span className="text-sm font-semibold">{formatarPreco(gastoTotal)}</span>
            </div>
            {Object.keys(gastoPorMes).length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                Ainda sem compras concluídas atribuídas a esta arrecadação.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {Object.entries(gastoPorMes).map(([mes, valor]) => (
                  <li key={mes} className="px-4 py-2 text-sm flex items-center justify-between">
                    <span className="capitalize">{mes}</span>
                    <span className="font-medium">{formatarPreco(valor)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="px-4 pb-3 text-[11px] text-slate-400">
              Calculado a partir do preço registado em cada compra concluída da lista quinzenal
              destinada a esta arrecadação.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-medium text-sm mb-3">Apartamentos associados</h2>
            <div className="flex gap-2">
              <select
                value={apartamentoParaAssociar}
                onChange={(e) => setApartamentoParaAssociar(e.target.value)}
                className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Associar apartamento…</option>
                {apartamentosDisponiveis.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!apartamentoParaAssociar) return;
                  associarApartamento(arrecadacao.id, apartamentoParaAssociar);
                  setApartamentoParaAssociar("");
                }}
                className="rounded-md bg-slate-900 text-white text-sm px-3 hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>

          {mensagem && <p className="text-xs text-slate-500">{mensagem}</p>}
        </div>
      </div>
    </div>
  );
}
