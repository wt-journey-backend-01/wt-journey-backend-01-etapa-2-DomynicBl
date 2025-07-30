// __tests__/casos.test.js

const request = require('supertest');
const express = require('express');

// Importar os módulos da nossa aplicação
const casosRouter = require('../routes/casosRoutes');
const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');

const app = express();
app.use(express.json());
app.use(casosRouter);

// Mock dos repositórios
jest.mock('../repositories/casosRepository');
jest.mock('../repositories/agentesRepository');

// Testes dos endpoints de /casos
describe('Testes dos Endpoints de /casos', () => {
    
    const mockAgenteExistente = { id: 'agente-1', nome: 'Agente Mock', dataDeIncorporacao: '2020-01-01', cargo: 'inspetor' };
    const mockCasos = [
        { id: 'caso-1', titulo: 'Caso A', descricao: 'Descrição A', status: 'aberto', agente_id: 'agente-1' },
        { id: 'caso-2', titulo: 'Caso B', descricao: 'Descrição B', status: 'solucionado', agente_id: 'agente-1' }
    ];

    beforeEach(() => {
        // Resetar mocks
        jest.clearAllMocks();
        agentesRepository.findById.mockImplementation(id => (id === mockAgenteExistente.id ? mockAgenteExistente : null));
        casosRepository.findAll.mockReturnValue(mockCasos);
        casosRepository.findById.mockImplementation(id => mockCasos.find(c => c.id === id));
        casosRepository.create.mockImplementation(caso => ({ id: 'caso-3', ...caso }));
        casosRepository.update.mockImplementation((id, data) => ({ id, ...data }));
        casosRepository.patch.mockImplementation((id, data) => ({ ...mockCasos.find(c => c.id === id), ...data }));
        casosRepository.remove.mockReturnValue(true);
    });

    describe('GET /casos', () => {
        test('Deve listar todos os casos', async () => {
            const res = await request(app).get('/casos');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET /casos/:id', () => {
        test('Deve retornar um caso específico pelo ID', async () => {
            const res = await request(app).get('/casos/caso-1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'caso-1');
        });

        test('Deve retornar 404 para um caso com ID inexistente', async () => {
            casosRepository.findById.mockReturnValue(null);
            const res = await request(app).get('/casos/id-inexistente');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /casos', () => {
        test('Deve criar um novo caso com sucesso', async () => {
            const novoCaso = {
                titulo: 'Novo Caso de Teste',
                descricao: 'Descrição do novo caso',
                status: 'aberto',
                agente_id: 'agente-1'
            };
            const res = await request(app).post('/casos').send(novoCaso);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.titulo).toBe(novoCaso.titulo);
        });

        test('Deve retornar 404 ao criar um caso com agente_id inexistente', async () => {
            const novoCaso = {
                titulo: 'Caso com Agente Fantasma',
                descricao: '...',
                status: 'aberto',
                agente_id: 'agente-fantasma'
            };
            const res = await request(app).post('/casos').send(novoCaso);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain("Agente com id 'agente-fantasma' não encontrado.");
        });
        
        test('Deve retornar 400 ao criar um caso com status inválido', async () => {
            const novoCaso = {
                titulo: 'Caso com Status Ruim',
                descricao: '...',
                status: 'pendente',
                agente_id: 'agente-1'
            };
            const res = await request(app).post('/casos').send(novoCaso);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('status');
        });
    });

    describe('PUT /casos/:id', () => {
        test('Deve atualizar um caso por completo com sucesso', async () => {
            const dadosAtualizados = {
                titulo: 'Título Atualizado',
                descricao: 'Descrição Atualizada',
                status: 'solucionado',
                agente_id: 'agente-1'
            };
            const res = await request(app).put('/casos/caso-1').send(dadosAtualizados);
            expect(res.statusCode).toEqual(200);
            expect(res.body.titulo).toBe(dadosAtualizados.titulo);
        });
        
        test('Deve retornar 400 ao tentar atualizar (PUT) um caso sem um campo obrigatório', async () => {
            const dadosIncompletos = {
                descricao: 'Descrição Atualizada',
                status: 'solucionado',
                agente_id: 'agente-1'
            };
            const res = await request(app).put('/casos/caso-1').send(dadosIncompletos);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('titulo');
        });
    });

    describe('PATCH /casos/:id', () => {
        test('Deve atualizar um caso parcialmente com sucesso', async () => {
            const dadosParciais = { status: 'solucionado' };
            const res = await request(app).patch('/casos/caso-1').send(dadosParciais);
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('solucionado');
            expect(res.body.titulo).toBe('Caso A'); // Garante que outros campos não mudaram
        });

        test('Deve retornar 400 ao tentar atualizar (PATCH) um caso com um corpo vazio', async () => {
            const res = await request(app).patch('/casos/caso-1').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('body');
        });

        test('Deve retornar 400 ao tentar atualizar (PATCH) um caso com o campo id no body', async () => {
            const dadosParciais = { id: 'id-malicioso', status: 'solucionado' };
            const res = await request(app).patch('/casos/caso-1').send(dadosParciais);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('id');
        });
    });

    describe('DELETE /casos/:id', () => {
        test('Deve deletar um caso com sucesso', async () => {
            const res = await request(app).delete('/casos/caso-1');
            expect(res.statusCode).toEqual(204);
        });

        test('Deve retornar 404 ao tentar deletar um caso com ID inexistente', async () => {
            casosRepository.findById.mockReturnValue(null);
            const res = await request(app).delete('/casos/id-inexistente');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('GET /casos/:caso_id/agente', () => {
        test('Deve retornar os dados do agente responsável pelo caso', async () => {
            const res = await request(app).get('/casos/caso-1/agente');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'agente-1');
            expect(res.body).toHaveProperty('nome', 'Agente Mock');
        });

        test('Deve retornar 404 se o caso não for encontrado', async () => {
            casosRepository.findById.mockReturnValue(null);
            const res = await request(app).get('/casos/id-inexistente/agente');
            expect(res.statusCode).toEqual(404);
        });
    });
});
