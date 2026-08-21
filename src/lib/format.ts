import { CategoriaProduto } from "./types";

export const CATEGORIA_LABELS: Record<CategoriaProduto, string> = {
  cafe_bebidas: "Café e bebidas",
  higiene_pessoal: "Higiene pessoal",
  limpeza: "Limpeza e consumíveis",
  equipamento: "Equipamento",
  loica_vidro: "Loiça e vidro",
  manutencao: "Manutenção / reparações",
};

export function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}
