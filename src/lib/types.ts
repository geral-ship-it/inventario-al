// Tipos de dados principais da aplicação de gestão de inventário

export type Role = "gestao" | "administrativa" | "arrecadacoes" | "saida_rapida";

// Roles com acesso à app completa (podem gerir catálogo, preços, etc.)
export const ROLES_GESTAO_CATALOGO: Role[] = ["gestao", "administrativa"];

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: Role;
  pin?: string; // usado apenas por perfis "saida_rapida" (Modo Saída Rápida)
}

export type CategoriaProduto =
  | "cafe_bebidas"
  | "higiene_pessoal"
  | "limpeza"
  | "equipamento"
  | "loica_vidro"
  | "manutencao";

// "unitario": o QR representa a própria unidade que sai (ex: garrafa de
//   vinho, saco de café já fechado) — entrada/saída lidas 1 a 1.
// "lote": o QR só existe na caixa/embalagem (ex: caixa de cápsulas). A
//   leitura serve para dar ENTRADA de uma caixa nova (soma
//   unidadesPorEmbalagem ao stock); a saída de unidades individuais não
//   tem QR próprio, por isso não é lida no Modo Saída Rápida — fica para
//   contagem/estimativa periódica.
export type TipoRastreio = "unitario" | "lote";

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  unidade: string; // ex: "unidade", "pacote", "rolo", "cápsula"
  stockMinimoArmazem: number; // limite para disparar alerta
  qrCode: string; // valor codificado no QR (aqui: o próprio id)
  ativo: boolean;
  tipoRastreio: TipoRastreio;
  unidadesPorEmbalagem?: number; // só relevante quando tipoRastreio === "lote"
}

export interface StockArmazem {
  produtoId: string;
  quantidade: number;
}

export interface MovimentoStock {
  id: string;
  produtoId: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string; // ex: "Reposição de compra", "Envio para Rua São Julião"
  autorId: string;
  data: string; // ISO
}

export interface Apartamento {
  id: string;
  nome: string; // ex: "Rato 1", "Harmonia"
  zona: string;
}

export interface ItemChecklist {
  produtoId: string;
  quantidadeReferencia: number;
}

export interface Arrecadacao {
  id: string;
  nome: string; // ex: "Arrecadação Rua São Julião"
  apartamentoIds: string[]; // pode servir vários apartamentos
  tipo: "arrecadacao" | "armario";
  checklist: ItemChecklist[];
}

export interface FaltaReportada {
  id: string;
  arrecadacaoId: string;
  produtoId: string;
  quantidadeFalta: number;
  reportadoPor: string;
  data: string; // ISO
  resolvido: boolean;
}

export type EstadoListaCompras = "aberta" | "fechada" | "concluida";

export interface ItemListaCompras {
  id: string;
  produtoId: string;
  quantidade: number;
  origem: "arrecadacao" | "armazem" | "manual";
  arrecadacaoId?: string;
  recebido: boolean;
  lojaEscolhida?: string;
  precoPago?: number;
}

export interface ListaCompras {
  id: string;
  criadaEm: string; // ISO
  fechadaEm?: string;
  estado: EstadoListaCompras;
  itens: ItemListaCompras[];
}

// Criado automaticamente quando uma lista de compras é concluída, para
// cada item destinado a uma arrecadação — permite somar o gasto
// acumulado por arrecadação ao longo do tempo.
export interface GastoArrecadacao {
  id: string;
  arrecadacaoId: string;
  produtoId: string;
  quantidade: number;
  custo: number; // custo total (quantidade × preço estimado/pago)
  data: string; // ISO
}

export interface PrecoLoja {
  id: string;
  produtoId: string;
  loja: string; // "Continente" | "Pingo Doce" | "Auchan" | "Lidl" | "Makro" | "Recheio" | "Poupança"
  preco: number;
  atualizadoEm: string; // ISO
  automatico: boolean;
}

export const LOJAS = [
  "Continente",
  "Pingo Doce",
  "Auchan",
  "Lidl",
  "Makro",
  "Recheio",
  "Poupança",
] as const;

export const LOJAS_AUTOMATIZAVEIS = ["Continente", "Pingo Doce", "Auchan", "Lidl"];
