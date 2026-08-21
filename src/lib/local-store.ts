"use client";

// Estado local ao dispositivo — quem está "sessão iniciada" neste browser/tablet,
// se este dispositivo já desbloqueou o acesso completo, e o Modo Saída Rápida
// (PIN). Isto NÃO é sincronizado entre utilizadores de propósito: cada
// telemóvel/tablet mantém o seu próprio estado. Os dados do negócio (produtos,
// stock, arrecadações, etc.) vivem em `store.ts` e são sincronizados via
// `/api/state` (ver `SyncProvider`).

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { USERS_SEED } from "./seed-data";
import { UserProfile } from "./types";
import { SENHA_ACESSO_COMPLETO } from "./config";

const UTILIZADOR_POR_OMISSAO =
  USERS_SEED.find((u) => u.role === "administrativa")?.id ?? USERS_SEED[0].id;

type NivelAcesso = "completo" | "arrecadacoes" | null;

interface LocalState {
  utilizadorAtualId: string;
  modoRapidoUtilizadorId: string | null;
  acessoLiberado: boolean;
  nivelAcesso: NivelAcesso;
  setUtilizadorAtual: (id: string) => void;
  entrarModoRapido: (pin: string, utilizadores: UserProfile[]) => boolean;
  sairModoRapido: () => void;
  desbloquear: (
    password: string,
    senhaArrecadacoes: string,
    utilizadores: UserProfile[]
  ) => boolean;
  bloquear: () => void;
}

export const useLocalStore = create<LocalState>()(
  persist(
    (set) => ({
      utilizadorAtualId: UTILIZADOR_POR_OMISSAO,
      modoRapidoUtilizadorId: null,
      acessoLiberado: false,
      nivelAcesso: null,

      setUtilizadorAtual: (id) => set({ utilizadorAtualId: id }),

      entrarModoRapido: (pin, utilizadores) => {
        const utilizador = utilizadores.find(
          (u) => u.role === "saida_rapida" && u.pin === pin
        );
        if (!utilizador) return false;
        set({ modoRapidoUtilizadorId: utilizador.id });
        return true;
      },

      sairModoRapido: () => set({ modoRapidoUtilizadorId: null }),

      desbloquear: (password, senhaArrecadacoes, utilizadores) => {
        if (SENHA_ACESSO_COMPLETO && password === SENHA_ACESSO_COMPLETO) {
          set({ acessoLiberado: true, nivelAcesso: "completo" });
          return true;
        }
        if (senhaArrecadacoes && password === senhaArrecadacoes) {
          const equipaArrecadacoes = utilizadores.find(
            (u) => u.role === "arrecadacoes"
          );
          set((state) => ({
            acessoLiberado: true,
            nivelAcesso: "arrecadacoes",
            utilizadorAtualId: equipaArrecadacoes?.id ?? state.utilizadorAtualId,
          }));
          return true;
        }
        return false;
      },

      bloquear: () => set({ acessoLiberado: false, nivelAcesso: null }),
    }),
    { name: "inventario-al-dispositivo" }
  )
);
