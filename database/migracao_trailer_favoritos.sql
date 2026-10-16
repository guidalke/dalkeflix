USE catalogo_filmes;

-- Execute uma única vez em um banco que já tenha a tabela filmes.
ALTER TABLE filmes
  ADD COLUMN trailer_url VARCHAR(500) NULL,
  ADD COLUMN favorito BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE filmes
SET trailer_url = 'https://www.youtube.com/watch?v=cf40RaNis4Q'
WHERE titulo = 'A Volta dos que Não Foram';
