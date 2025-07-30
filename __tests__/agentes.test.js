const request = require('supertest');
const express = require('express');

const agentesRouter = require('../routes/agentesRoutes');
const agentesRepository = require('../repositories/agentesRepository');
const casosRepository = require('../repositories/casosRepository');

const app = express();
app.use(express.json());
app.use(agentesRouter);

// Mock dos repositórios
jest.mock('../repositories/agentesRepository');
jest.mock('../repositories/casosRepository');

describe('Endpoints de /agentes', () => {
    
    let mockAgentes;
    let mockCasos;

    beforeEach(() => {
        // Reinicia os mocks e dados antes de cada teste
        jest.clearAllMocks();
        
        mockAgentes = [
            { id: '1', nome: 'Agente A', dataDeIncorporacao: '2020-01-15', cargo: 'inspetor' },
            { id: '2', nome: 'Agente B', dataDeIncorporacao: '2018-05-20', cargo: 'delegado' },
            { id: '3', nome: 'Agente C', dataDeIncorporacao: '2021-11-10', cargo: 'inspetor' }
        ];

        mockCasos = [
            { id: 'caso-1', titulo: 'Caso do Agente A', descricao: '...', status: 'aberto', agente_id: '1' }
        ];

        // Configuração dos mocks dos repositórios
        agentesRepository.findAll.mockReturnValue(mockAgentes);
        agentesRepository.findById.mockImplementation(id => mockAgentes.find(a => a.id === id) || null);
        agentesRepository.create.mockImplementation(agente => {
            const novoAgente = { id: '4', ...agente };
            mockAgentes.push(novoAgente);
            return novoAgente;
        });
        agentesRepository.update.mockImplementation((id, data) => ({ id, ...data }));
        agentesRepository.patch.mockImplementation((id, data) => ({ ...mockAgentes.find(a => a.id === id), ...data }));
        agentesRepository.remove.mockReturnValue(true);
        casosRepository.findAll.mockReturnValue(mockCasos);
    });

    describe('GET /agentes', () => {
        test('Deve listar todos os agentes', async () => {
            const res = await request(app).get('/agentes');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(3);
        });

        test('Deve filtrar agentes por cargo', async () => {
            const res = await request(app).get('/agentes?cargo=inspetor');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
            expect(res.body.every(a => a.cargo === 'inspetor')).toBe(true);
        });

        test('Deve ordenar agentes por data de incorporação (ascendente)', async () => {
            const res = await request(app).get('/agentes?sort=dataDeIncorporacao');
            expect(res.statusCode).toEqual(200);
            expect(res.body[0].id).toBe('2'); // Agente B (2018) é o mais antigo
            expect(res.body[2].id).toBe('3'); // Agente C (2021) é o mais recente
        });

        test('Deve ordenar agentes por data de incorporação (descendente)', async () => {
            const res = await request(app).get('/agentes?sort=-dataDeIncorporacao');
            expect(res.statusCode).toEqual(200);
            expect(res.body[0].id).toBe('3'); // Agente C (2021) é o mais recente
            expect(res.body[2].id).toBe('2'); // Agente B (2018) é o mais antigo
        });
        
        test('Deve retornar 400 para parâmetros de query inválidos', async () => {
            const res = await request(app).get('/agentes?nome=Agente');
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('query');
        });
        
        test('Deve retornar 400 para formato de data de incorporação inválido no filtro', async () => {
            const res = await request(app).get('/agentes?dataDeIncorporacao=15-01-2020');
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('dataDeIncorporacao');
        });
    });

    describe('GET /agentes/:id', () => {
        test('Deve retornar um agente específico pelo ID', async () => {
            const res = await request(app).get('/agentes/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', '1');
            expect(res.body.nome).toBe('Agente A');
        });

        test('Deve retornar 404 para um ID de agente inexistente', async () => {
            const res = await request(app).get('/agentes/999');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /agentes', () => {
        test('Deve criar um novo agente com sucesso', async () => {
            const novoAgente = { nome: 'Agente D', dataDeIncorporacao: '2022-01-01', cargo: 'perito' };
            const res = await request(app).post('/agentes').send(novoAgente);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.nome).toBe('Agente D');
        });

        test('Deve retornar 400 ao criar um agente com data de incorporação no futuro', async () => {
            const dataFutura = new Date();
            dataFutura.setDate(dataFutura.getDate() + 1);
            const dataFuturaString = dataFutura.toISOString().split('T')[0];

            const novoAgente = { nome: 'Viajante do Tempo', dataDeIncorporacao: dataFuturaString, cargo: 'observador' };
            const res = await request(app).post('/agentes').send(novoAgente);
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('dataDeIncorporacao', 'Data de incorporação não pode ser no futuro.');
        });

        test('Deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
            const res = await request(app).post('/agentes').send({ nome: 'Incompleto' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('dataDeIncorporacao');
            expect(res.body.errors).toHaveProperty('cargo');
        });
    });

    describe('PUT /agentes/:id', () => {
        test('Deve atualizar um agente por completo', async () => {
            const dadosAtualizados = { nome: 'Agente A Modificado', dataDeIncorporacao: '2020-01-16', cargo: 'inspetor-chefe' };
            const res = await request(app).put('/agentes/1').send(dadosAtualizados);
            expect(res.statusCode).toEqual(200);
            expect(res.body.nome).toBe('Agente A Modificado');
            expect(res.body.cargo).toBe('inspetor-chefe');
        });

        test('Deve retornar 400 ao tentar atualizar um agente com o campo id no body', async () => {
            const dadosAtualizados = { id: 'id-malicioso', nome: 'Agente A Atualizado', dataDeIncorporacao: '2020-01-02', cargo: 'inspetor-chefe' };
            const res = await request(app).put('/agentes/1').send(dadosAtualizados);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('id', "Não é permitido alterar o campo 'id'.");
        });
    });

    describe('PATCH /agentes/:id', () => {
        test('Deve atualizar parcialmente um agente', async () => {
            const res = await request(app).patch('/agentes/1').send({ cargo: 'delegado-substituto' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.cargo).toBe('delegado-substituto');
            expect(res.body.nome).toBe('Agente A'); // Garante que outros campos não mudaram
        });

        test('Deve retornar 400 ao tentar atualizar (PATCH) com um corpo vazio', async () => {
            const res = await request(app).patch('/agentes/2').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('body');
        });

        test('Deve retornar 400 ao tentar atualizar (PATCH) com o campo id no body', async () => {
            const dadosParciais = { id: 'id-malicioso', cargo: 'delegado-chefe' };
            const res = await request(app).patch('/agentes/2').send(dadosParciais);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('id', "Não é permitido alterar o campo 'id'.");
        });
    });

    describe('DELETE /agentes/:id', () => {
        test('Deve deletar um agente SEM casos associados', async () => {
            // O Agente '2' não está em `mockCasos`
            const res = await request(app).delete('/agentes/2');
            expect(res.statusCode).toEqual(204);
        });

        test('Deve retornar 400 ao tentar deletar um agente COM casos associados', async () => {
            // O Agente '1' está em `mockCasos`
            const res = await request(app).delete('/agentes/1');
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('delecao');
        });
    });
});