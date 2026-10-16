const enderecoConfigurado = process.env.EXPO_PUBLIC_API_URL;
export const API_URL = enderecoConfigurado || 'http://localhost:3000';

export async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Não foi possível concluir a solicitação.');
  }

  return dados;
}
