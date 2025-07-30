// __tests__/casos.test.js

const request = require('supertest');
const express = require('express');

// Importar os módulos da nossa aplicação
const casosRouter = require('../routes/casosRoutes');
const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');

// Criar um app Express falso apenas para os testes
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
        agentesRepository.findById.mockImplementation(id => (id === mockAgenteExistente.id ? mockAgenteExistente : null));
        casosRepository.findAll.mockReturnValue(mockCasos);
        casosRepository.findById.mockImplementation(id => mockCasos.find(c => c.id === id));
        casosRepository.create.mockImplementation(caso => ({ id: 'caso-3', ...caso }));
        casosRepository.remove.mockReturnValue(true);
    });

    // Teste para GET /casos
    test('Deve listar todos os casos', async () => {
        const res = await request(app).get('/casos');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    // Teste para POST /casos com sucesso
    test('Deve criar um novo caso com sucesso', async () => {
        const novoCaso = {
            titulo: 'Novo Caso de Teste',
            descricao: 'Descrição do novo caso',
            status: 'aberto',
            agente_id: 'agente-1'
        };

        const res = await request(app)
            .post('/casos')
            .send(novoCaso);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id', 'caso-3');
    });

    // Teste para POST /casos com agente_id inválido
    test('Deve retornar 400 ao criar um caso com agente_id inexistente', async () => {
        const novoCaso = {
            titulo: 'Caso com Agente Fantasma',
            descricao: '...',
            status: 'aberto',
            agente_id: 'agente-fantasma'
        };

        const res = await request(app)
            .post('/casos')
            .send(novoCaso);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('agente_id');
    });
    
    // Teste para POST /casos com status inválido
    test('Deve retornar 400 ao criar um caso com status inválido', async () => {
        const novoCaso = {
            titulo: 'Caso com Status Ruim',
            descricao: '...',
            status: 'pendente',
            agente_id: 'agente-1'
        };

        const res = await request(app)
            .post('/casos')
            .send(novoCaso);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('status');
    });

    // Teste para DELETE /casos/:id
    test('Deve deletar um caso', async () => {
        const res = await request(app).delete('/casos/caso-1');
        expect(res.statusCode).toEqual(204);
    });

    // Teste para GET /casos?status=aberto
    test('Deve filtrar casos por status', async () => {
        casosRepository.findAll.mockReturnValue(mockCasos.filter(c => c.status === 'aberto'));
        const res = await request(app).get('/casos?status=aberto');
        expect(res.statusCode).toEqual(200);
        expect(res.body.every(c => c.status === 'aberto')).toBe(true);
    });
});
