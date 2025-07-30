require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Importa a nova biblioteca
const path = require('path'); // Módulo nativo do Node.js para lidar com caminhos

const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Carrega o arquivo YAML de especificação da API
const swaggerDocument = YAML.load(path.join(__dirname, './docs/api-spec.yaml'));

app.use(express.json());

// Rota para a documentação da API
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API
app.use(agentesRouter);
app.use(casosRouter);

// Middleware para tratamento de erros genéricos
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
    console.log(`Documentação da API disponível em http://localhost:${PORT}/docs`);
});