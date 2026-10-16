import express from 'express';
import cors from 'cors';
import filmesRoutes from './routes/filmesRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(filmesRoutes);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));
