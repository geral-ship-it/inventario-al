// Password de acesso completo (Gestão / Administrativa).
//
// Fica definida como variável de ambiente no Netlify (Project configuration
// → Environment variables → NEXT_PUBLIC_SENHA_ACESSO_COMPLETO), não como
// texto neste ficheiro — o repositório do GitHub é público, por isso a
// password não deve ficar guardada aqui. Para trocar a password, basta
// mudar o valor dessa variável no Netlify e voltar a publicar o site.
export const SENHA_ACESSO_COMPLETO = process.env.NEXT_PUBLIC_SENHA_ACESSO_COMPLETO ?? "";
