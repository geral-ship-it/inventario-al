import {
  Apartamento,
  Arrecadacao,
  ListaCompras,
  PrecoLoja,
  Produto,
  StockArmazem,
  UserProfile,
} from "./types";
import { PIN_INICIAL_EQUIPA_LIMPEZA } from "./config";

export const USERS_SEED: UserProfile[] = [
  { id: "u1", nome: "Indira", email: "indira@empresa.pt", role: "gestao" },
  {
    id: "u3",
    nome: "Administrativa",
    email: "administrativa@empresa.pt",
    role: "administrativa",
  },
  {
    id: "u4",
    nome: "Equipa de limpeza (Modo Saída Rápida)",
    email: "equipa@empresa.pt",
    role: "saida_rapida",
    pin: PIN_INICIAL_EQUIPA_LIMPEZA,
  },
];

// Produtos cujo QR só existe na caixa/embalagem (não em cada unidade
// individual). A entrada regista-se por caixa (soma as unidades); a saída
// de unidades individuais não é lida por QR — fica para contagem/estimativa
// periódica (ver Produto.tipoRastreio no ficheiro types.ts).
const PRODUTOS_POR_LOTE: Record<string, number> = {
  p01: 10, // Cápsulas Nespresso — caixa de 10
  p02: 16, // Cápsulas Dolce Gusto — caixa de 16
  p03: 10, // Cápsulas Delta/Nespresso-compatível — caixa de 10
  p05: 50, // Açúcar em pacotinhos — caixa de 50
  p06: 25, // Chá em saquetas — caixa de 25
  p07: 50, // Azeite em pacotinhos — caixa de 50
};

// Catálogo compilado a partir da conversa. "sewing_kit_new" foi acrescentado
// a pedido (kit de costura, fita adesiva e velcro para pequenas reparações).
const PRODUTOS_BASE: Omit<Produto, "tipoRastreio" | "unidadesPorEmbalagem">[] = [
  // Café / bebidas de boas-vindas
  { id: "p01", nome: "Cápsulas Nespresso", categoria: "cafe_bebidas", unidade: "cápsula", stockMinimoArmazem: 40, qrCode: "p01", ativo: true },
  { id: "p02", nome: "Cápsulas Dolce Gusto", categoria: "cafe_bebidas", unidade: "cápsula", stockMinimoArmazem: 40, qrCode: "p02", ativo: true },
  { id: "p03", nome: "Cápsulas Delta/Nespresso-compatível", categoria: "cafe_bebidas", unidade: "cápsula", stockMinimoArmazem: 40, qrCode: "p03", ativo: true },
  { id: "p04", nome: "Café em pó (máquina)", categoria: "cafe_bebidas", unidade: "saco", stockMinimoArmazem: 6, qrCode: "p04", ativo: true },
  { id: "p05", nome: "Açúcar (pacotinhos)", categoria: "cafe_bebidas", unidade: "pacotinho", stockMinimoArmazem: 100, qrCode: "p05", ativo: true },
  { id: "p06", nome: "Chá (saquetas)", categoria: "cafe_bebidas", unidade: "saqueta", stockMinimoArmazem: 60, qrCode: "p06", ativo: true },
  { id: "p07", nome: "Azeite (pacotinhos)", categoria: "cafe_bebidas", unidade: "pacotinho", stockMinimoArmazem: 60, qrCode: "p07", ativo: true },
  { id: "p08", nome: "Garrafa de vinho (boas-vindas)", categoria: "cafe_bebidas", unidade: "garrafa", stockMinimoArmazem: 8, qrCode: "p08", ativo: true },

  // Higiene pessoal
  { id: "p09", nome: "Gel de duche", categoria: "higiene_pessoal", unidade: "frasco", stockMinimoArmazem: 15, qrCode: "p09", ativo: true },
  { id: "p10", nome: "Champô", categoria: "higiene_pessoal", unidade: "frasco", stockMinimoArmazem: 15, qrCode: "p10", ativo: true },
  { id: "p11", nome: "Sabonete líquido de mãos", categoria: "higiene_pessoal", unidade: "frasco", stockMinimoArmazem: 15, qrCode: "p11", ativo: true },
  { id: "p12", nome: "Amaciador", categoria: "higiene_pessoal", unidade: "garrafa", stockMinimoArmazem: 6, qrCode: "p12", ativo: true },

  // Limpeza e consumíveis de casa
  { id: "p13", nome: "Papel higiénico", categoria: "limpeza", unidade: "rolo", stockMinimoArmazem: 40, qrCode: "p13", ativo: true },
  { id: "p14", nome: "Papel de cozinha", categoria: "limpeza", unidade: "rolo", stockMinimoArmazem: 30, qrCode: "p14", ativo: true },
  { id: "p15", nome: "Esponjas", categoria: "limpeza", unidade: "unidade", stockMinimoArmazem: 20, qrCode: "p15", ativo: true },
  { id: "p16", nome: "Panos multiuso (bancada)", categoria: "limpeza", unidade: "unidade", stockMinimoArmazem: 20, qrCode: "p16", ativo: true },
  { id: "p17", nome: "Panos da loiça", categoria: "limpeza", unidade: "unidade", stockMinimoArmazem: 20, qrCode: "p17", ativo: true },
  { id: "p18", nome: "Toalhitas desmaquilhantes", categoria: "limpeza", unidade: "pacote", stockMinimoArmazem: 10, qrCode: "p18", ativo: true },
  { id: "p19", nome: "Detergente multiuso / lava-tudo", categoria: "limpeza", unidade: "garrafa", stockMinimoArmazem: 8, qrCode: "p19", ativo: true },
  { id: "p20", nome: "Lixívia", categoria: "limpeza", unidade: "garrafa", stockMinimoArmazem: 8, qrCode: "p20", ativo: true },
  { id: "p21", nome: "Tira-gordura", categoria: "limpeza", unidade: "garrafa", stockMinimoArmazem: 6, qrCode: "p21", ativo: true },
  { id: "p22", nome: "Limpa-vidros", categoria: "limpeza", unidade: "garrafa", stockMinimoArmazem: 6, qrCode: "p22", ativo: true },
  { id: "p23", nome: "Blocos sanitários", categoria: "limpeza", unidade: "unidade", stockMinimoArmazem: 20, qrCode: "p23", ativo: true },
  { id: "p24", nome: "Sacos de lixo", categoria: "limpeza", unidade: "rolo", stockMinimoArmazem: 15, qrCode: "p24", ativo: true },

  // Equipamento / bens duráveis
  { id: "p25", nome: "Secador de cabelo (sobressalente)", categoria: "equipamento", unidade: "unidade", stockMinimoArmazem: 2, qrCode: "p25", ativo: true },
  { id: "p26", nome: "Torradeira (sobressalente)", categoria: "equipamento", unidade: "unidade", stockMinimoArmazem: 2, qrCode: "p26", ativo: true },
  { id: "p27", nome: "Cafeteira elétrica (sobressalente)", categoria: "equipamento", unidade: "unidade", stockMinimoArmazem: 2, qrCode: "p27", ativo: true },
  { id: "p28", nome: "Máquina de café (sobressalente)", categoria: "equipamento", unidade: "unidade", stockMinimoArmazem: 1, qrCode: "p28", ativo: true },

  // Loiça e vidro
  { id: "p29", nome: "Copos de vinho", categoria: "loica_vidro", unidade: "unidade", stockMinimoArmazem: 12, qrCode: "p29", ativo: true },
  { id: "p30", nome: "Copos de água", categoria: "loica_vidro", unidade: "unidade", stockMinimoArmazem: 12, qrCode: "p30", ativo: true },
  { id: "p31", nome: "Pratos", categoria: "loica_vidro", unidade: "unidade", stockMinimoArmazem: 12, qrCode: "p31", ativo: true },

  // Pequenas reparações (novo, pedido pela cliente)
  { id: "p32", nome: "Kit de costura básico", categoria: "manutencao", unidade: "unidade", stockMinimoArmazem: 5, qrCode: "p32", ativo: true },
  { id: "p33", nome: "Fita adesiva", categoria: "manutencao", unidade: "rolo", stockMinimoArmazem: 5, qrCode: "p33", ativo: true },
  { id: "p34", nome: "Velcro (fita autoadesiva)", categoria: "manutencao", unidade: "rolo", stockMinimoArmazem: 3, qrCode: "p34", ativo: true },
];

export const PRODUTOS_SEED: Produto[] = PRODUTOS_BASE.map((p) =>
  PRODUTOS_POR_LOTE[p.id]
    ? { ...p, tipoRastreio: "lote" as const, unidadesPorEmbalagem: PRODUTOS_POR_LOTE[p.id] }
    : { ...p, tipoRastreio: "unitario" as const }
);

// Stock inicial do armazém — alguns propositadamente baixos, para
// demonstrar os alertas de "stock a acabar".
export const STOCK_ARMAZEM_SEED: StockArmazem[] = PRODUTOS_SEED.map((p, i) => ({
  produtoId: p.id,
  quantidade: i % 5 === 0 ? Math.max(0, Math.floor(p.stockMinimoArmazem * 0.4)) : p.stockMinimoArmazem * 2,
}));

// Apartamentos — 13 no total. Nomeados onde já sabemos, os restantes
// com nome genérico para serem renomeados na app.
export const APARTAMENTOS_SEED: Apartamento[] = [
  { id: "ap01", nome: "Rua São Julião 1", zona: "São Julião" },
  { id: "ap02", nome: "Rua São Julião 2", zona: "São Julião" },
  { id: "ap03", nome: "Harmonia", zona: "Harmonia" },
  { id: "ap04", nome: "Prédio 4 Apts – Frac. A", zona: "Prédio 4 apts" },
  { id: "ap05", nome: "Prédio 4 Apts – Frac. B", zona: "Prédio 4 apts" },
  { id: "ap06", nome: "Prédio 4 Apts – Frac. C", zona: "Prédio 4 apts" },
  { id: "ap07", nome: "Prédio 4 Apts – Frac. D", zona: "Prédio 4 apts" },
  { id: "ap08", nome: "Rato 1", zona: "Rato" },
  { id: "ap09", nome: "Rato 2", zona: "Rato" },
  { id: "ap10", nome: "Apartamento com arrecadação própria", zona: "Outra zona" },
  { id: "ap11", nome: "Apartamento 11 (a nomear)", zona: "A definir" },
  { id: "ap12", nome: "Apartamento 12 (a nomear)", zona: "A definir" },
  { id: "ap13", nome: "Apartamento 13 (a nomear)", zona: "A definir" },
];

const checklistPadrao = () => [
  { produtoId: "p01", quantidadeReferencia: 8 },
  { produtoId: "p05", quantidadeReferencia: 8 },
  { produtoId: "p06", quantidadeReferencia: 4 },
  { produtoId: "p13", quantidadeReferencia: 2 },
  { produtoId: "p14", quantidadeReferencia: 1 },
  { produtoId: "p19", quantidadeReferencia: 1 },
  { produtoId: "p23", quantidadeReferencia: 1 },
  { produtoId: "p24", quantidadeReferencia: 1 },
];

export const ARRECADACOES_SEED: Arrecadacao[] = [
  {
    id: "ar01",
    nome: "Arrecadação Rua São Julião",
    apartamentoIds: ["ap01", "ap02"],
    tipo: "arrecadacao",
    checklist: checklistPadrao(),
  },
  {
    id: "ar02",
    nome: "Arrecadação Harmonia",
    apartamentoIds: ["ap03"],
    tipo: "arrecadacao",
    checklist: checklistPadrao(),
  },
  {
    id: "ar03",
    nome: "Armário Prédio 4 Apts",
    apartamentoIds: ["ap04", "ap05", "ap06", "ap07"],
    tipo: "armario",
    checklist: checklistPadrao().slice(0, 4),
  },
  {
    id: "ar04",
    nome: "Arrecadação Rato 1 (interna)",
    apartamentoIds: ["ap08"],
    tipo: "arrecadacao",
    checklist: checklistPadrao(),
  },
  {
    id: "ar05",
    nome: "Arrecadação Apartamento próprio",
    apartamentoIds: ["ap10"],
    tipo: "arrecadacao",
    checklist: checklistPadrao(),
  },
];

export const LISTAS_COMPRAS_SEED: ListaCompras[] = [
  {
    id: "lc01",
    criadaEm: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    estado: "aberta",
    itens: [
      { id: "it01", produtoId: "p13", quantidade: 20, origem: "armazem", recebido: false },
      { id: "it02", produtoId: "p23", quantidade: 10, origem: "arrecadacao", arrecadacaoId: "ar01", recebido: false },
      { id: "it03", produtoId: "p06", quantidade: 30, origem: "arrecadacao", arrecadacaoId: "ar02", recebido: false },
    ],
  },
];

export const PRECOS_SEED: PrecoLoja[] = [
  { id: "pr01", produtoId: "p13", loja: "Continente", preco: 3.49, atualizadoEm: new Date().toISOString(), automatico: true },
  { id: "pr02", produtoId: "p13", loja: "Pingo Doce", preco: 3.29, atualizadoEm: new Date().toISOString(), automatico: true },
  { id: "pr03", produtoId: "p13", loja: "Lidl", preco: 2.99, atualizadoEm: new Date().toISOString(), automatico: true },
  { id: "pr04", produtoId: "p13", loja: "Makro", preco: 2.75, atualizadoEm: new Date().toISOString(), automatico: false },
  { id: "pr05", produtoId: "p19", loja: "Auchan", preco: 2.19, atualizadoEm: new Date().toISOString(), automatico: true },
  { id: "pr06", produtoId: "p19", loja: "Recheio", preco: 1.95, atualizadoEm: new Date().toISOString(), automatico: false },
];
