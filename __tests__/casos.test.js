// __tests__/casos.test.js

const request = require('supertest');
const express = 'express';

// Importar os módulos da nossa aplicação
const casosRouter = require('../routes/casosRoutes');
const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');

const app = require('express')(); // Usar uma instância real do express
app.use(require('express').json());
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

    test('Deve listar todos os casos', async () => {
        const res = await request(app).get('/casos');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    test('Deve criar um novo caso com sucesso', async () => {
        const novoCaso = {
            titulo: 'Novo Caso de Teste',
            descricao: 'Descrição do novo caso',
            status: 'aberto',
            agente_id: 'agente-1'
        };
        const res = await request(app).post('/casos').send(novoCaso);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id', 'caso-3');
    });

    test('Deve retornar 404 ao criar um caso com agente_id inexistente', async () => {
        const novoCaso = {
            titulo: 'Caso com Agente Fantasma',
            descricao: '...',
            status: 'aberto',
            agente_id: 'agente-fantasma'
        };

        const res = await request(app).post('/casos').send(novoCaso);

        expect(res.statusCode).toEqual(404); // Espera 404 em vez de 400
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

    test('Deve retornar 400 ao tentar atualizar (PUT) um caso com o campo id no body', async () => {
        const dadosAtualizados = {
            id: 'id-malicioso',
            titulo: 'Título Atualizado',
            descricao: 'Descrição Atualizada',
            status: 'solucionado',
            agente_id: 'agente-1'
        };
        const res = await request(app).put('/casos/caso-1').send(dadosAtualizados);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('id', "Não é permitido alterar o campo 'id'.");
    });

    test('Deve retornar 400 ao tentar atualizar (PATCH) um caso com o campo id no body', async () => {
        const dadosParciais = { id: 'id-malicioso', status: 'solucionado' };
        const res = await request(app).patch('/casos/caso-1').send(dadosParciais);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('id', "Não é permitido alterar o campo 'id'.");
    });
});
