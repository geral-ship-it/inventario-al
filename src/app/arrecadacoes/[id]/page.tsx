import { ARRECADACOES_SEED } from "@/lib/seed-data";
import ArrecadacaoDetalheClient from "./arrecadacao-detalhe-client";

export function generateStaticParams() {
  return ARRECADACOES_SEED.map((a) => ({ id: a.id }));
}

export default async function ArrecadacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArrecadacaoDetalheClient id={id} />;
}
