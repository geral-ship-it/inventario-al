// Deteção simples de nomes de produto parecidos, para evitar duplicados
// como "Sabonete líquido de mãos" / "Sabonete" / "Sabão".

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // remove acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

const PALAVRAS_IGNORAR = new Set(["de", "da", "do", "para", "com", "e", "em", "a", "o"]);

function palavrasRelevantes(texto: string): string[] {
  return normalizar(texto)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !PALAVRAS_IGNORAR.has(w));
}

export function encontrarParecidos<T extends { nome: string }>(
  nomeNovo: string,
  existentes: T[],
  max = 3
): T[] {
  const nomeNorm = normalizar(nomeNovo);
  if (nomeNorm.length < 3) return [];
  const palavrasNovo = new Set(palavrasRelevantes(nomeNovo));

  const pontuados = existentes
    .map((p) => {
      const nomeExistenteNorm = normalizar(p.nome);
      // Correspondência direta por substring (em qualquer direção)
      const substring =
        nomeExistenteNorm.includes(nomeNorm) || nomeNorm.includes(nomeExistenteNorm);

      // Sobreposição de palavras relevantes (Jaccard simplificado)
      const palavrasExistente = new Set(palavrasRelevantes(p.nome));
      const intersecao = [...palavrasNovo].filter((w) => palavrasExistente.has(w)).length;
      const uniao = new Set([...palavrasNovo, ...palavrasExistente]).size || 1;
      const jaccard = intersecao / uniao;

      const pontuacao = substring ? 1 : jaccard;
      return { produto: p, pontuacao };
    })
    .filter((x) => x.pontuacao >= 0.34)
    .sort((a, b) => b.pontuacao - a.pontuacao);

  return pontuados.slice(0, max).map((x) => x.produto);
}
