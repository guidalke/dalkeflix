import { Router } from 'express';
import { listarFilmes, buscarFilmePorId, cadastrarFilme, atualizarFilme, atualizarFavorito, excluirFilme } from '../controllers/filmesController.js';

const router = Router();
router.get('/filmes', listarFilmes);
router.get('/filmes/:id', buscarFilmePorId);
router.post('/filmes', cadastrarFilme);
router.put('/filmes/:id', atualizarFilme);
router.put('/filmes/:id/favorito', atualizarFavorito);
router.delete('/filmes/:id', excluirFilme);
export default router;
