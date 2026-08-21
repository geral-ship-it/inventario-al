"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Role } from "@/lib/types";
import { SENHA_ACESSO_COMPLETO } from "@/lib/config";

const LABEL_ROLE: Record<Role, string> = {
  gestao: "Gestão",
  administrativa: "Administrativa",
  arrecadacoes: "Arrecadações",
  saida_rapida: "Funcionária (scan)",
};

const URL_APP = "https://inventario-al.netlify.app";

function copiar(texto: string, onOk: () => void) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(texto).then(onOk).catch(() => {});
  }
}

export default function UtilizadoresPage() {
  const utilizadores = useAppStore((s) => s.utilizadores);
  const adicionarUtilizador = useAppStore((s) => s.adicionarUtilizador);
  const removerUtilizador = useAppStore((s) => s.removerUtilizador);
  const atualizarPinSaidaRapida = useAppStore((s) => s.atualizarPinSaidaRapida);
  const senhaArrecadacoes = useAppStore((s) => s.senhaArrecadacoes);
  const atualizarSenhaArrecadacoes = useAppStore((s) => s.atualizarSenhaArrecadacoes);

  const pessoasAcessoCompleto = utilizadores.filter(
    (u) => u.role === "gestao" || u.role === "administrativa"
  );
  const equipaLimpeza = utilizadores.find((u) => u.role === "saida_rapida");
  const equipaArrecadacoes = utilizadores.find((u) => u.role === "arrecadacoes");

  const [novoNome, setNovoNome] = useState("");
  const [novoRole, setNovoRole] = useState<Role>("administrativa");
  const [convite, setConvite] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const [aRemoverId, setARemoverId] = useState<string | null>(null);

  const [novoPin, setNovoPin] = useState(equipaLimpeza?.pin ?? "");
  const [pinGuardado, setPinGuardado] = useState(false);

  const [novaSenhaArrecadacoes, setNovaSenhaArrecadacoes] = useState(senhaArrecadacoes);
  const [senhaArrecadacoesGuardada, setSenhaArrecadacoesGuardada] = useState(false);

  function textoConvite(nome: string) {
    return `Olá ${nome}! Já tens acesso à app de inventário: ${URL_APP} — a password é: ${SENHA_ACESSO_COMPLETO}`;
  }

  function adicionar() {
    if (!novoNome.trim()) return;
    const criado = adicionarUtilizador(novoNome.trim(), novoRole);
    setConvite(textoConvite(criado.nome));
    setCopiado(false);
    setNovoNome("");
  }

  function guardarPin() {
    if (!novoPin.trim()) return;
    atualizarPinSaidaRapida(novoPin.trim());
    setPinGuardado(true);
    setTimeout(() => setPinGuardado(false), 2000);
  }

  function guardarSenhaArrecadacoes() {
    if (!novaSenhaArrecadacoes.trim()) return;
    atualizarSenhaArrecadacoes(novaSenhaArrecadacoes.trim());
    setSenhaArrecadacoesGuardada(true);
    setTimeout(() => setSenhaArrecadacoesGuardada(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Gerir acesso</h1>
        <p className="text-sm text-slate-500">
          A app tem três níveis de acesso: uma password partilhada para quem gere tudo
          (Gestão / Administrativa), uma password partilhada para a equipa de arrecadações
          (só vê arrecadações), e um PIN partilhado para a equipa de limpeza, que só entra
          no ecrã de leitura de QR (Modo Saída Rápida).
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-medium text-sm">Password de acesso completo</h2>
        <p className="text-xs text-slate-500">
          Partilha esta password com quem deve ter acesso a toda a app.
        </p>
        <div className="flex items-center gap-2">
          <code className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm font-mono">
            {SENHA_ACESSO_COMPLETO}
          </code>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-medium text-sm">Pessoas com acesso completo</h2>
        <div className="divide-y divide-slate-100">
          {pessoasAcessoCompleto.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{u.nome}</p>
                <p className="text-xs text-slate-400">{LABEL_ROLE[u.role]}</p>
              </div>
              {aRemoverId === u.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600">Remover {u.nome}?</span>
                  <button
                    onClick={() => {
                      removerUtilizador(u.id);
                      setARemoverId(null);
                    }}
                    className="text-xs font-medium text-red-600 underline"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setARemoverId(null)}
                    className="text-xs font-medium text-slate-400 underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setARemoverId(u.id)}
                  className="text-xs font-medium text-slate-400 hover:text-red-600 underline"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">Adicionar nova pessoa</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Nome (ex: Rui)"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="flex-1 border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            />
            <select
              value={novoRole}
              onChange={(e) => setNovoRole(e.target.value as Role)}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm"
            >
              <option value="gestao">Gestão</option>
              <option value="administrativa">Administrativa</option>
            </select>
            <button
              onClick={adicionar}
              disabled={!novoNome.trim()}
              className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-1.5 hover:bg-slate-700 disabled:opacity-40"
            >
              Adicionar
            </button>
          </div>

          {convite && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-md p-3 text-xs text-emerald-800 space-y-2">
              <p className="font-medium">Pronto! Manda-lhe esta mensagem (ex: por WhatsApp):</p>
              <p className="bg-white border border-emerald-200 rounded-md p-2 font-mono">
                {convite}
              </p>
              <button
                onClick={() => copiar(convite, () => setCopiado(true))}
                className="rounded-md border border-emerald-300 text-emerald-800 text-xs font-medium px-3 py-1 hover:bg-emerald-100"
              >
                {copiado ? "Copiado!" : "Copiar mensagem"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-medium text-sm">Equipa de arrecadações</h2>
        <p className="text-xs text-slate-500">
          Quem entrar com esta password só vê a secção de Arrecadações: os nomes, os
          produtos de cada uma e o botão para reportar o que falta (dar baixa). Não vê
          Produtos, Preços, Lista de Compras nem o Painel geral. As ações ficam registadas
          coletivamente como &ldquo;{equipaArrecadacoes?.nome ?? "Equipa de arrecadações"}&rdquo;.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <span className="text-xs text-slate-400">Link a partilhar:</span>
          <code className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-mono">
            {URL_APP}
          </code>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <span className="text-xs text-slate-400">Password atual:</span>
          <input
            type="text"
            value={novaSenhaArrecadacoes}
            onChange={(e) => setNovaSenhaArrecadacoes(e.target.value)}
            className="border border-slate-200 rounded-md px-2 py-1.5 text-sm w-40"
          />
          <button
            onClick={guardarSenhaArrecadacoes}
            className="rounded-md border border-slate-300 text-sm font-medium px-3 py-1.5 hover:bg-slate-50"
          >
            {senhaArrecadacoesGuardada ? "Guardada!" : "Guardar nova password"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h2 className="font-medium text-sm">Equipa de limpeza (Modo Saída Rápida)</h2>
        <p className="text-xs text-slate-500">
          Todas as pessoas com este PIN entram só no ecrã de leitura de QR — não veem o
          resto da app (sem lista de compras, preços, etc.). As ações ficam registadas
          coletivamente como &ldquo;{equipaLimpeza?.nome ?? "Equipa de limpeza"}&rdquo;.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <span className="text-xs text-slate-400">Link a partilhar:</span>
          <code className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-mono">
            {URL_APP}/scan
          </code>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <span className="text-xs text-slate-400">PIN atual:</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={novoPin}
            onChange={(e) => setNovoPin(e.target.value)}
            className="border border-slate-200 rounded-md px-2 py-1.5 text-sm w-28 text-center tracking-widest"
          />
          <button
            onClick={guardarPin}
            className="rounded-md border border-slate-300 text-sm font-medium px-3 py-1.5 hover:bg-slate-50"
          >
            {pinGuardado ? "Guardado!" : "Guardar novo PIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
