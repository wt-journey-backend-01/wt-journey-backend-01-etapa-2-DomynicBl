// server.js

require('dotenv').config(); // Carrega as variáveis do arquivo .env

const express = require('express');
const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');

const app = express();
// Usa a porta do .env ou a porta 3000 como padrão
const PORT = process.env.PORT || 3000;

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());

// Rotas para os recursos da API
app.use(agentesRouter);
app.use(casosRouter);

// Middleware para tratamento de erros genéricos
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
});
