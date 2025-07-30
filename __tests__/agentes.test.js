// __tests__/agentes.test.js

const request = require('supertest');
const express = require('express');

const agentesRouter = require('../routes/agentesRoutes');
const agentesRepository = require('../repositories/agentesRepository');
const casosRepository = require('../repositories/casosRepository'); // Importando para o mock

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
        // Resetar os mocks antes de cada teste
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

    test('Deve retornar um agente pelo ID', async () => {
        const res = await request(app).get('/agentes/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', '1');
    });
    
    test('Deve retornar 404 para um ID de agente inexistente', async () => {
        agentesRepository.findById.mockReturnValue(null);
        const res = await request(app).get('/agentes/999');
        expect(res.statusCode).toEqual(404);
    });

    test('Deve criar um novo agente', async () => {
        const novoAgente = { nome: 'Agente C', dataDeIncorporacao: '2022-01-01', cargo: 'perito' };
        const res = await request(app).post('/agentes').send(novoAgente);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('Deve retornar 400 ao tentar criar um agente sem nome', async () => {
        const novoAgente = { dataDeIncorporacao: '2022-01-01', cargo: 'perito' };
        const res = await request(app).post('/agentes').send(novoAgente);
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('nome');
    });

    test('Deve atualizar um agente por completo', async () => {
        const dadosAtualizados = { nome: 'Agente A Atualizado', dataDeIncorporacao: '2020-01-02', cargo: 'inspetor-chefe' };
        const res = await request(app).put('/agentes/1').send(dadosAtualizados);
        expect(res.statusCode).toEqual(200);
        expect(res.body.nome).toBe(dadosAtualizados.nome);
    });

    test('Deve atualizar um agente parcialmente', async () => {
        const dadosParciais = { cargo: 'delegado-chefe' };
        const res = await request(app).patch('/agentes/2').send(dadosParciais);
        expect(res.statusCode).toEqual(200);
        expect(res.body.cargo).toBe(dadosParciais.cargo);
    });

    test('Deve deletar um agente SEM casos associados', async () => {
        // Garantimos que não há casos para o Agente '2'
        casosRepository.findAll.mockReturnValue([]); 
        const res = await request(app).delete('/agentes/2');
        expect(res.statusCode).toEqual(204);
    });

    test('Deve retornar 400 ao tentar deletar um agente COM casos associados', async () => {
        // Simulamos que o Agente '1' tem um caso
        casosRepository.findAll.mockReturnValue(mockCasos); 
        const res = await request(app).delete('/agentes/1');
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toHaveProperty('delecao');
        expect(res.body.errors.delecao).toContain('Não é possível excluir o agente');
    });

    test('Deve retornar 400 para parâmetros de query não permitidos', async () => {
        const res = await request(app).get('/agentes?cidade=gotham');
        expect(res.statusCode).toEqual(400);
        expect(res.body.errors.query).toContain('Parâmetros de consulta inválidos: cidade');
    });
});
