"use client";

// Estado local ao dispositivo — quem está "sessão iniciada" neste browser/tablet
// e o Modo Saída Rápida (PIN). Isto NÃO é sincronizado entre utilizadores de
// propósito: cada telemóvel/tablet mantém a sua própria identidade. Os dados do
// negócio (produtos, stock, arrecadações, etc.) vivem em `store.ts` e são
// sincronizados via `/api/state` (ver `SyncProvider`).

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { USERS_SEED } from "./seed-data";
import { UserProfile } from "./types";

interface LocalState {
  utilizadorAtualId: string;
  modoRapidoUtilizadorId: string | null;
  setUtilizadorAtual: (id: string) => void;
  entrarModoRapido: (pin: string, utilizadores: UserProfile[]) => boolean;
  sairModoRapido: () => void;
}

export const useLocalStore = create<LocalState>()(
  persist(
    (set) => ({
      utilizadorAtualId: USERS_SEED[2].id, // administrativa por omissão
      modoRapidoUtilizadorId: null,

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
    }),
    { name: "inventario-al-dispositivo" }
  )
);
