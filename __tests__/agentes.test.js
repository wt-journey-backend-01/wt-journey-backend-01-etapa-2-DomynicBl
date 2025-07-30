// __tests__/agentes.test.js

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
jest.mock('../repositories/casosRepository'); // Adicionando o mock

// Testes dos endpoints de /agentes
describe('Testes dos Endpoints de /agentes', () => {
    
    const mockAgentes = [
        { id: '1', nome: 'Agente A', dataDeIncorporacao: '2020-01-01', cargo: 'inspetor' },
        { id: '2', nome: 'Agente B', dataDeIncorporacao: '2021-01-01', cargo: 'delegado' }
    ];
    const mockCasos = [
        { id: 'caso-1', titulo: 'Caso do Agente A', descricao: '...', status: 'aberto', agente_id: '1' }
    ];

    beforeEach(() => {
        jest.clearAllMocks(); // Resetar os mocks antes de cada teste
        agentesRepository.findAll.mockReturnValue(mockAgentes);
        agentesRepository.findById.mockImplementation(id => mockAgentes.find(a => a.id === id));
        agentesRepository.create.mockImplementation(agente => ({ id: '3', ...agente }));
        agentesRepository.update.mockImplementation((id, data) => ({ id, ...data }));
        agentesRepository.patch.mockImplementation((id, data) => ({ ...mockAgentes.find(a => a.id === id), ...data }));
        agentesRepository.remove.mockReturnValue(true);
        // Mock padrão para casosRepository
        casosRepository.findAll.mockReturnValue([]);
    });

    test('Deve listar todos os agentes', async () => {
        const res = await request(app).get('/agentes');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    test('Deve retornar 400 ao tentar criar um agente com data de incorporação no futuro', async () => {
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + 1);
        const dataFuturaString = dataFutura.toISOString().split('T')[0];

        const novoAgente = { nome: 'Viajante do Tempo', dataDeIncorporacao: dataFuturaString, cargo: 'observador' };
        const res = await request(app).post('/agentes').send(novoAgente);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('dataDeIncorporacao', 'Data de incorporação não pode ser no futuro.');
    });

    test('Deve retornar 400 ao tentar atualizar (PUT) um agente com o campo id no body', async () => {
        const dadosAtualizados = { id: 'id-malicioso', nome: 'Agente A Atualizado', dataDeIncorporacao: '2020-01-02', cargo: 'inspetor-chefe' };
        const res = await request(app).put('/agentes/1').send(dadosAtualizados);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('id', "Não é permitido alterar o campo 'id'.");
    });

    test('Deve retornar 400 ao tentar atualizar (PATCH) um agente com o campo id no body', async () => {
        const dadosParciais = { id: 'id-malicioso', cargo: 'delegado-chefe' };
        const res = await request(app).patch('/agentes/2').send(dadosParciais);

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('id', "Não é permitido alterar o campo 'id'.");
    });

    test('Deve deletar um agente SEM casos associados', async () => {
        casosRepository.findAll.mockReturnValue([]); 
        const res = await request(app).delete('/agentes/2');
        expect(res.statusCode).toEqual(204);
    });

    test('Deve retornar 400 ao tentar deletar um agente COM casos associados', async () => {
        casosRepository.findAll.mockReturnValue(mockCasos); 
        const res = await request(app).delete('/agentes/1');
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('delecao');
        expect(res.body.errors.delecao).toContain('Não é possível excluir o agente');
    });
});
