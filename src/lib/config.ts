// Password de acesso completo (Gestão / Administrativa), PIN inicial da
// equipa de limpeza (Modo Saída Rápida) e password inicial da equipa de
// arrecadações (acesso restrito só às arrecadações).
//
// Ficam definidos como variáveis de ambiente no Netlify (Project
// configuration → Environment variables), não como texto neste ficheiro —
// o repositório do GitHub é público, por isso não devem ficar guardados
// aqui. Para trocar a password de acesso completo, muda a variável no
// Netlify e volta a publicar o site. O PIN da equipa de limpeza e a
// password da equipa de arrecadações podem ser trocados diretamente na
// página "Gerir acesso" dentro da app, sem precisar de mexer em código
// nem voltar a publicar.
export const SENHA_ACESSO_COMPLETO = process.env.NEXT_PUBLIC_SENHA_ACESSO_COMPLETO ?? "";
export const PIN_INICIAL_EQUIPA_LIMPEZA =
  process.env.NEXT_PUBLIC_PIN_INICIAL_EQUIPA_LIMPEZA ?? "";
export const SENHA_INICIAL_ARRECADACOES =
  process.env.NEXT_PUBLIC_SENHA_INICIAL_ARRECADACOES ?? "";
