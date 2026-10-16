CREATE DATABASE IF NOT EXISTS catalogo_filmes;
USE catalogo_filmes;

CREATE TABLE IF NOT EXISTS filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  genero VARCHAR(60) NOT NULL,
  ano SMALLINT UNSIGNED NOT NULL,
  avaliacao DECIMAL(3,1) NOT NULL,
  descricao TEXT NOT NULL,
  trailer_url VARCHAR(500) NULL,
  favorito BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (avaliacao >= 0 AND avaliacao <= 10)
);
