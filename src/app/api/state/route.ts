import { getStore } from "@netlify/blobs";
import { NextRequest, NextResponse } from "next/server";
import {
  APARTAMENTOS_SEED,
  ARRECADACOES_SEED,
  LISTAS_COMPRAS_SEED,
  PRECOS_SEED,
  PRODUTOS_SEED,
  STOCK_ARMAZEM_SEED,
  USERS_SEED,
} from "@/lib/seed-data";
import { SENHA_INICIAL_ARRECADACOES } from "@/lib/config";
import type { DadosPartilhados } from "@/lib/store";

// Este endpoint tem de correr sempre no servidor (nunca ser pré-otimizado
// como estático) porque lê/escreve o Netlify Blob partilhado a cada pedido.
export const dynamic = "force-dynamic";

const CHAVE_ESTADO = "estado-partilhado";

interface EstadoGuardado {
  versao: number;
  atualizadoEm: string;
  dados: DadosPartilhados;
}

function estadoInicial(): DadosPartilhados {
  return {
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
  };
}

function abrirLoja() {
  // "strong" para que, numa equipa pequena, duas pessoas a mexer quase ao
  // mesmo tempo vejam sempre a versão mais recente (em vez de propagação
  // eventual de ~60s).
  return getStore({ name: "inventario-al", consistency: "strong" });
}

export async function GET() {
  try {
    const loja = abrirLoja();
    const atual = await loja.get(CHAVE_ESTADO, { type: "json" });
    if (!atual) {
      const inicial: EstadoGuardado = {
        versao: 1,
        atualizadoEm: new Date().toISOString(),
        dados: estadoInicial(),
      };
      await loja.setJSON(CHAVE_ESTADO, inicial);
      return NextResponse.json(inicial);
    }
    return NextResponse.json(atual);
  } catch (erro) {
    return NextResponse.json(
      {
        erro: "Não foi possível ler o estado partilhado (Netlify Blobs).",
        detalhe: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let corpo: { versaoBase?: unknown; dados?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido no pedido." }, { status: 400 });
  }

  const { versaoBase, dados } = corpo;
  if (typeof versaoBase !== "number" || typeof dados !== "object" || dados === null) {
    return NextResponse.json(
      { erro: "Pedido inválido: esperado { versaoBase: number, dados: object }." },
      { status: 400 }
    );
  }

  try {
    const loja = abrirLoja();
    const atual = await loja.get(CHAVE_ESTADO, { type: "json" }) as EstadoGuardado | null;
    const versaoAtual = atual?.versao ?? 0;

    if (atual && versaoAtual !== versaoBase) {
      // Alguém gravou entretanto: devolve a versão atual para o cliente
      // reconciliar em vez de deixar apagar as alterações da outra pessoa.
      return NextResponse.json({ conflito: true, ...atual }, { status: 409 });
    }

    const novoEstado: EstadoGuardado = {
      versao: versaoAtual + 1,
      atualizadoEm: new Date().toISOString(),
      dados: dados as DadosPartilhados,
    };
    await loja.setJSON(CHAVE_ESTADO, novoEstado);
    return NextResponse.json(novoEstado);
  } catch (erro) {
    return NextResponse.json(
      {
        erro: "Não foi possível gravar o estado partilhado (Netlify Blobs).",
        detalhe: erro instanceof Error ? erro.message : String(erro),
      },
      { status: 500 }
    );
  }
}
