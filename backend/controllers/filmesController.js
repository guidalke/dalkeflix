import conexao from '../database/conexao.js';

function validarFilme(dados = {}) {
  dados = dados || {};
  const { titulo, genero, ano, avaliacao, descricao } = dados;
  const anoNumerico = Number(ano);
  const nota = Number(avaliacao);
  const trailerUrl = dados.trailerUrl || '';

  if (
    typeof titulo !== 'string' || !titulo.trim() ||
    typeof genero !== 'string' || !genero.trim() ||
    typeof descricao !== 'string' || !descricao.trim() ||
    ano === undefined || !Number.isInteger(anoNumerico) || anoNumerico < 1888 || anoNumerico > new Date().getFullYear() + 5 ||
    avaliacao === undefined || !Number.isFinite(nota) || nota < 0 || nota > 10
  ) {
    return null;
  }

  if (trailerUrl && !ehLinkDoYouTube(trailerUrl)) {
    return null;
  }

  return {
    titulo: titulo.trim(),
    genero: genero.trim(),
    ano: anoNumerico,
    avaliacao: nota,
    descricao: descricao.trim(),
    trailerUrl: trailerUrl || null,
  };
}

function ehLinkDoYouTube(link) {
  try {
    const endereco = new URL(link);
    const dominiosAceitos = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'];
    return ['http:', 'https:'].includes(endereco.protocol) && dominiosAceitos.includes(endereco.hostname);
  } catch {
    return false;
  }
}

export async function listarFilmes(req, res) {
  try {
    const [filmes] = await conexao.query(
      'SELECT id, titulo, genero, ano, avaliacao, descricao, trailer_url, favorito FROM filmes ORDER BY id'
    );
    return res.json(filmes);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao carregar filmes. Verifique a conexão com o banco.' });
  }
}

export async function buscarFilmePorId(req, res) {
  try {
    const [filmes] = await conexao.execute(
      'SELECT id, titulo, genero, ano, avaliacao, descricao, trailer_url, favorito FROM filmes WHERE id = ?',
      [req.params.id]
    );

    if (!filmes.length) {
      return res.status(404).json({ mensagem: 'Filme não encontrado.' });
    }
    return res.json(filmes[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao buscar filme.' });
  }
}

export async function cadastrarFilme(req, res) {
  const filme = validarFilme(req.body);
  if (!filme) {
    return res.status(400).json({ mensagem: 'Confira os campos, a nota e o link opcional do YouTube.' });
  }

  try {
    const [resultado] = await conexao.execute(
      'INSERT INTO filmes (titulo, genero, ano, avaliacao, descricao, trailer_url) VALUES (?, ?, ?, ?, ?, ?)',
      [filme.titulo, filme.genero, filme.ano, filme.avaliacao, filme.descricao, filme.trailerUrl]
    );
    return res.status(201).json({ id: resultado.insertId, mensagem: 'Filme cadastrado com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao cadastrar filme.' });
  }
}

export async function atualizarFilme(req, res) {
  const filme = validarFilme(req.body);
  if (!filme) {
    return res.status(400).json({ mensagem: 'Confira os campos, a nota e o link opcional do YouTube.' });
  }

  try {
    const [resultado] = await conexao.execute(
      'UPDATE filmes SET titulo = ?, genero = ?, ano = ?, avaliacao = ?, descricao = ?, trailer_url = ? WHERE id = ?',
      [filme.titulo, filme.genero, filme.ano, filme.avaliacao, filme.descricao, filme.trailerUrl, req.params.id]
    );

    if (!resultado.affectedRows) {
      const [achados] = await conexao.execute('SELECT id FROM filmes WHERE id = ?', [req.params.id]);
      if (!achados.length) {
        return res.status(404).json({ mensagem: 'Filme não encontrado.' });
      }
    }
    return res.json({ mensagem: 'Filme atualizado com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar filme.' });
  }
}

export async function atualizarFavorito(req, res) {
  const favorito = req.body?.favorito;
  if (typeof favorito !== 'boolean') {
    return res.status(400).json({ mensagem: 'Informe se o filme deve ser favorito.' });
  }

  try {
    const [filmes] = await conexao.execute('SELECT favorito FROM filmes WHERE id = ?', [req.params.id]);
    if (!filmes.length) {
      return res.status(404).json({ mensagem: 'Filme não encontrado.' });
    }

    if (favorito && !filmes[0].favorito) {
      const [[resultado]] = await conexao.query('SELECT COUNT(*) AS quantidade FROM filmes WHERE favorito = TRUE');
      if (resultado.quantidade >= 3) {
        return res.status(400).json({ mensagem: 'Você pode marcar até 3 filmes como favoritos.' });
      }
    }

    await conexao.execute('UPDATE filmes SET favorito = ? WHERE id = ?', [favorito, req.params.id]);
    return res.json({ mensagem: favorito ? 'Filme adicionado aos favoritos.' : 'Filme removido dos favoritos.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao atualizar os favoritos.' });
  }
}

export async function excluirFilme(req, res) {
  try {
    const [resultado] = await conexao.execute('DELETE FROM filmes WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) {
      return res.status(404).json({ mensagem: 'Filme não encontrado.' });
    }
    return res.json({ mensagem: 'Filme excluído com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: 'Erro ao excluir filme.' });
  }
}
