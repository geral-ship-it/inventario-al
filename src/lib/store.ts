"use client";

import { create } from "zustand";
import {
  APARTAMENTOS_SEED,
  ARRECADACOES_SEED,
  LISTAS_COMPRAS_SEED,
  PRECOS_SEED,
  PRODUTOS_SEED,
  STOCK_ARMAZEM_SEED,
  USERS_SEED,
} from "./seed-data";
import { SENHA_INICIAL_ARRECADACOES } from "./config";
import {
  Apartamento,
  Arrecadacao,
  FaltaReportada,
  GastoArrecadacao,
  ItemListaCompras,
  ListaCompras,
  MovimentoStock,
  PrecoLoja,
  Produto,
  Role,
  StockArmazem,
  UserProfile,
} from "./types";
import { useLocalStore } from "./local-store";

// Campos partilhados entre todos os utilizadores (sincronizados via /api/state
// + Netlify Blobs — ver SyncProvider). Não incluir aqui nada específico do
// dispositivo (isso vive em local-store.ts).
export interface DadosPartilhados {
  produtos: Produto[];
  stockArmazem: StockArmazem[];
  movimentos: MovimentoStock[];
  apartamentos: Apartamento[];
  arrecadacoes: Arrecadacao[];
  faltas: FaltaReportada[];
  listasCompras: ListaCompras[];
  precos: PrecoLoja[];
  utilizadores: UserProfile[];
  gastosArrecadacao: GastoArrecadacao[];
  // Password partilhada do nível de acesso "Arrecadações" (restrito só a
  // essa secção). Guardada aqui (não como env var fixa) para poder ser
  // trocada na página "Gerir acesso" sem voltar a publicar o site.
  senhaArrecadacoes: string;
}

interface AppState extends DadosPartilhados {
  // Ações
  hydrate: (dados: DadosPartilhados) => void;
  getStockProduto: (produtoId: string) => number;
  precoMaisBarato: (produtoId: string) => PrecoLoja | null;
  registarMovimento: (
    produtoId: string,
    tipo: "entrada" | "saida",
    quantidade: number,
    motivo: string,
    autorIdOverride?: string
  ) => void;
  adicionarProduto: (
    produto: Omit<Produto, "id" | "qrCode" | "tipoRastreio" | "unidadesPorEmbalagem"> & {
      tipoRastreio: Produto["tipoRastreio"];
      unidadesPorEmbalagem?: number;
    }
  ) => void;
  reportarFalta: (
    arrecadacaoId: string,
    produtoId: string,
    quantidadeFalta: number
  ) => void;
  resolverFalta: (faltaId: string) => void;
  criarItemManualNaListaAberta: (produtoId: string, quantidade: number) => void;
  enviarParaListaCompras: (produtoId: string, quantidade: number) => void;
  fecharListaAberta: () => void;
  marcarItemRecebido: (listaId: string, itemId: string) => void;
  definirLojaItem: (listaId: string, itemId: string, loja: string, preco: number) => void;
  concluirLista: (listaId: string) => void;
  atualizarChecklistArrecadacao: (
    arrecadacaoId: string,
    produtoId: string,
    quantidadeReferencia: number
  ) => void;
  criarArrecadacao: (nome: string, tipo: "arrecadacao" | "armario") => void;
  associarApartamento: (arrecadacaoId: string, apartamentoId: string) => void;
  atualizarPreco: (
    produtoId: string,
    loja: PrecoLoja["loja"],
    preco: number,
    automatico: boolean
  ) => void;
  adicionarUtilizador: (nome: string, role: Role) => UserProfile;
  removerUtilizador: (id: string) => void;
  atualizarPinSaidaRapida: (pin: string) => void;
  atualizarSenhaArrecadacoes: (senha: string) => void;
}

function garantirListaAberta(listas: ListaCompras[]): {
  listas: ListaCompras[];
  listaAberta: ListaCompras;
} {
  let listaAberta = listas.find((l) => l.estado === "aberta");
  if (!listaAberta) {
    listaAberta = {
      id: `lc-${Date.now()}`,
      criadaEm: new Date().toISOString(),
      estado: "aberta",
      itens: [],
    };
    listas = [listaAberta, ...listas];
  }
  return { listas, listaAberta };
}

export const useAppStore = create<AppState>()(
  (set, get) => ({
      produtos: PRODUTOS_SEED,
      stockArmazem: STOCK_ARMAZEM_SEED,
      movimentos: [],
      apartamentos: APARTAMENTOS_SEED,
      arrecadacoes: ARRECADACOES_SEED,
      faltas: [],
      listasCompras: LISTAS_COMPRAS_SEED,
      precos: PRECOS_SEED,
      utilizadores: USERS_SEED,
      gastosArrecadacao: [],
      senhaArrecadacoes: SENHA_INICIAL_ARRECADACOES,

      hydrate: (dados) => set(dados),

      getStockProduto: (produtoId) => {
        const item = get().stockArmazem.find((s) => s.produtoId === produtoId);
        return item?.quantidade ?? 0;
      },

      precoMaisBarato: (produtoId) => {
        const opcoes = get().precos.filter((p) => p.produtoId === produtoId);
        if (opcoes.length === 0) return null;
        return opcoes.reduce((min, p) => (p.preco < min.preco ? p : min), opcoes[0]);
      },

      registarMovimento: (produtoId, tipo, quantidade, motivo, autorIdOverride) => {
        const autorId = autorIdOverride ?? useLocalStore.getState().utilizadorAtualId;
        const movimento: MovimentoStock = {
          id: `mv-${Date.now()}`,
          produtoId,
          tipo,
          quantidade,
          motivo,
          autorId,
          data: new Date().toISOString(),
        };
        set((state) => {
          const stock = state.stockArmazem.map((s) =>
            s.produtoId === produtoId
              ? {
                  ...s,
                  quantidade:
                    tipo === "entrada"
                      ? s.quantidade + quantidade
                      : Math.max(0, s.quantidade - quantidade),
                }
              : s
          );
          return {
            stockArmazem: stock,
            movimentos: [movimento, ...state.movimentos],
          };
        });
      },

      adicionarProduto: (produto) => {
        const id = `p-${Date.now()}`;
        set((state) => ({
          produtos: [...state.produtos, { ...produto, id, qrCode: id } as Produto],
          stockArmazem: [...state.stockArmazem, { produtoId: id, quantidade: 0 }],
        }));
      },

      reportarFalta: (arrecadacaoId, produtoId, quantidadeFalta) => {
        const reportadoPor = useLocalStore.getState().utilizadorAtualId;
        const falta: FaltaReportada = {
          id: `f-${Date.now()}`,
          arrecadacaoId,
          produtoId,
          quantidadeFalta,
          reportadoPor,
          data: new Date().toISOString(),
          resolvido: false,
        };
        set((state) => ({ faltas: [falta, ...state.faltas] }));
        // Envia automaticamente para a lista de compras aberta
        get().criarItemManualNaListaAberta(produtoId, quantidadeFalta);
        set((state) => {
          const { listas, listaAberta } = garantirListaAberta(state.listasCompras);
          const item: ItemListaCompras = {
            id: `it-${Date.now()}`,
            produtoId,
            quantidade: quantidadeFalta,
            origem: "arrecadacao",
            arrecadacaoId,
            recebido: false,
          };
          const novaLista = { ...listaAberta, itens: [...listaAberta.itens, item] };
          return {
            listasCompras: listas.map((l) => (l.id === novaLista.id ? novaLista : l)),
          };
        });
      },

      resolverFalta: (faltaId) =>
        set((state) => ({
          faltas: state.faltas.map((f) =>
            f.id === faltaId ? { ...f, resolvido: true } : f
          ),
        })),

      criarItemManualNaListaAberta: (produtoId, quantidade) => {
        set((state) => {
          const { listas, listaAberta } = garantirListaAberta(state.listasCompras);
          const item: ItemListaCompras = {
            id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            produtoId,
            quantidade,
            origem: "manual",
            recebido: false,
          };
          const novaLista = { ...listaAberta, itens: [...listaAberta.itens, item] };
          return {
            listasCompras: listas.map((l) => (l.id === novaLista.id ? novaLista : l)),
          };
        });
      },

      enviarParaListaCompras: (produtoId, quantidade) => {
        set((state) => {
          const { listas, listaAberta } = garantirListaAberta(state.listasCompras);
          const item: ItemListaCompras = {
            id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            produtoId,
            quantidade,
            origem: "armazem",
            recebido: false,
          };
          const novaLista = { ...listaAberta, itens: [...listaAberta.itens, item] };
          return {
            listasCompras: listas.map((l) => (l.id === novaLista.id ? novaLista : l)),
          };
        });
      },

      fecharListaAberta: () => {
        set((state) => ({
          listasCompras: state.listasCompras.map((l) =>
            l.estado === "aberta"
              ? { ...l, estado: "fechada", fechadaEm: new Date().toISOString() }
              : l
          ),
        }));
      },

      marcarItemRecebido: (listaId, itemId) => {
        set((state) => ({
          listasCompras: state.listasCompras.map((l) =>
            l.id === listaId
              ? {
                  ...l,
                  itens: l.itens.map((it) =>
                    it.id === itemId ? { ...it, recebido: !it.recebido } : it
                  ),
                }
              : l
          ),
        }));
      },

      definirLojaItem: (listaId, itemId, loja, preco) => {
        set((state) => ({
          listasCompras: state.listasCompras.map((l) =>
            l.id === listaId
              ? {
                  ...l,
                  itens: l.itens.map((it) =>
                    it.id === itemId ? { ...it, lojaEscolhida: loja, precoPago: preco } : it
                  ),
                }
              : l
          ),
        }));
      },

      concluirLista: (listaId) => {
        const lista = get().listasCompras.find((l) => l.id === listaId);
        if (!lista) return;
        // Dá entrada no armazém para cada item recebido, e regista o gasto
        // atribuído à arrecadação de origem (quando aplicável).
        const novosGastos: GastoArrecadacao[] = [];
        lista.itens
          .filter((it) => it.recebido)
          .forEach((it) => {
            get().registarMovimento(
              it.produtoId,
              "entrada",
              it.quantidade,
              "Reposição de compra (lista quinzenal)"
            );
            if (it.origem === "arrecadacao" && it.arrecadacaoId) {
              const precoUnitario = it.precoPago ?? get().precoMaisBarato(it.produtoId)?.preco ?? 0;
              novosGastos.push({
                id: `ga-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                arrecadacaoId: it.arrecadacaoId,
                produtoId: it.produtoId,
                quantidade: it.quantidade,
                custo: precoUnitario * it.quantidade,
                data: new Date().toISOString(),
              });
            }
          });
        set((state) => ({
          listasCompras: state.listasCompras.map((l) =>
            l.id === listaId ? { ...l, estado: "concluida" } : l
          ),
          gastosArrecadacao: [...novosGastos, ...state.gastosArrecadacao],
        }));
      },

      atualizarChecklistArrecadacao: (arrecadacaoId, produtoId, quantidadeReferencia) => {
        set((state) => ({
          arrecadacoes: state.arrecadacoes.map((a) => {
            if (a.id !== arrecadacaoId) return a;
            const existe = a.checklist.find((c) => c.produtoId === produtoId);
            const checklist = existe
              ? a.checklist.map((c) =>
                  c.produtoId === produtoId ? { ...c, quantidadeReferencia } : c
                )
              : [...a.checklist, { produtoId, quantidadeReferencia }];
            return { ...a, checklist };
          }),
        }));
      },

      criarArrecadacao: (nome, tipo) => {
        const id = `ar-${Date.now()}`;
        set((state) => ({
          arrecadacoes: [
            ...state.arrecadacoes,
            { id, nome, tipo, apartamentoIds: [], checklist: [] },
          ],
        }));
      },

      associarApartamento: (arrecadacaoId, apartamentoId) => {
        set((state) => ({
          arrecadacoes: state.arrecadacoes.map((a) =>
            a.id === arrecadacaoId && !a.apartamentoIds.includes(apartamentoId)
              ? { ...a, apartamentoIds: [...a.apartamentoIds, apartamentoId] }
              : a
          ),
        }));
      },

      atualizarPreco: (produtoId, loja, preco, automatico) => {
        set((state) => {
          const existe = state.precos.find(
            (p) => p.produtoId === produtoId && p.loja === loja
          );
          const atualizadoEm = new Date().toISOString();
          if (existe) {
            return {
              precos: state.precos.map((p) =>
                p.produtoId === produtoId && p.loja === loja
                  ? { ...p, preco, atualizadoEm, automatico }
                  : p
              ),
            };
          }
          return {
            precos: [
              ...state.precos,
              {
                id: `pr-${Date.now()}`,
                produtoId,
                loja,
                preco,
                atualizadoEm,
                automatico,
              },
            ],
          };
        });
      },

      adicionarUtilizador: (nome, role) => {
        const id = `u-${Date.now()}`;
        const email = `${nome
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "")}@empresa.pt`;
        const novoUtilizador: UserProfile = { id, nome: nome.trim(), email, role };
        set((state) => ({ utilizadores: [...state.utilizadores, novoUtilizador] }));
        return novoUtilizador;
      },

      removerUtilizador: (id) => {
        set((state) => ({
          utilizadores: state.utilizadores.filter((u) => u.id !== id),
        }));
      },

      atualizarPinSaidaRapida: (pin) => {
        set((state) => ({
          utilizadores: state.utilizadores.map((u) =>
            u.role === "saida_rapida" ? { ...u, pin } : u
          ),
        }));
      },

      atualizarSenhaArrecadacoes: (senha) => {
        set({ senhaArrecadacoes: senha });
      },
    })
);

// Extrai apenas os campos partilhados (sem as funções de ação) para envio a
// /api/state. Usado pelo SyncProvider.
export function extrairDadosPartilhados(state: AppState): DadosPartilhados {
  const {
    produtos,
    stockArmazem,
    movimentos,
    apartamentos,
    arrecadacoes,
    faltas,
    listasCompras,
    precos,
    utilizadores,
    gastosArrecadacao,
    senhaArrecadacoes,
  } = state;
  return {
    produtos,
    stockArmazem,
    movimentos,
    apartamentos,
    arrecadacoes,
    faltas,
    listasCompras,
    precos,
    utilizadores,
    gastosArrecadacao,
    senhaArrecadacoes,
  };
}
