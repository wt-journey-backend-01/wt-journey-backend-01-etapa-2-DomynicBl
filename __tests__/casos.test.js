const request = require('supertest');
const express = require('express');

const casosRouter = require('../routes/casosRoutes');
const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');

const app = express();
app.use(express.json());
app.use(casosRouter);

jest.mock('../repositories/casosRepository');
jest.mock('../repositories/agentesRepository');

describe('Endpoints de /casos', () => {
    
    let mockAgentes;
    let mockCasos;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAgentes = [
            { id: 'agente-1', nome: 'Agente Mock 1', dataDeIncorporacao: '2020-01-01', cargo: 'inspetor' },
            { id: 'agente-2', nome: 'Agente Mock 2', dataDeIncorporacao: '2021-01-01', cargo: 'delegado' }
        ];

        mockCasos = [
            { id: 'caso-1', titulo: 'Assalto na avenida principal', descricao: 'Investigação sobre o assalto ocorrido.', status: 'aberto', agente_id: 'agente-1' },
            { id: 'caso-2', titulo: 'Homicídio culposo', descricao: 'Vítima encontrada sem vida.', status: 'solucionado', agente_id: 'agente-1' },
            { id: 'caso-3', titulo: 'Fraude bancária', descricao: 'Análise de uma grande fraude financeira.', status: 'aberto', agente_id: 'agente-2' }
        ];

        agentesRepository.findById.mockImplementation(id => mockAgentes.find(a => a.id === id) || null);
        casosRepository.findAll.mockReturnValue(mockCasos);
        casosRepository.findById.mockImplementation(id => mockCasos.find(c => c.id === id) || null);
        casosRepository.create.mockImplementation(caso => ({ id: 'caso-4', ...caso }));
        casosRepository.update.mockImplementation((id, data) => ({ id, ...data }));
        casosRepository.patch.mockImplementation((id, data) => ({ ...mockCasos.find(c => c.id === id), ...data }));
        casosRepository.remove.mockReturnValue(true);
    });

    describe('GET /casos', () => {
        test('Deve listar todos os casos', async () => {
            const res = await request(app).get('/casos');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(3);
        });

        test('Deve filtrar casos por status', async () => {
            const res = await request(app).get('/casos?status=aberto');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
            expect(res.body.every(c => c.status === 'aberto')).toBe(true);
        });

        test('Deve filtrar casos por agente_id', async () => {
            const res = await request(app).get('/casos?agente_id=agente-1');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
        });
        
        test('Deve buscar casos por palavra-chave no título', async () => {
            const res = await request(app).get('/casos?q=Assalto');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].id).toBe('caso-1');
        });

        test('Deve buscar casos por palavra-chave na descrição', async () => {
            const res = await request(app).get('/casos?q=financeira');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].id).toBe('caso-3');
        });

        test('Deve retornar 400 para status de filtro inválido', async () => {
            const res = await request(app).get('/casos?status=pendente');
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('status');
        });
    });

    describe('GET /casos/:id', () => {
        test('Deve retornar um caso específico pelo ID', async () => {
            const res = await request(app).get('/casos/caso-1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'caso-1');
        });

        test('Deve retornar 404 para um caso com ID inexistente', async () => {
            const res = await request(app).get('/casos/id-inexistente');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /casos', () => {
        test('Deve criar um novo caso com sucesso', async () => {
            const novoCaso = { titulo: 'Novo Caso de Teste', descricao: 'Descrição', status: 'aberto', agente_id: 'agente-1' };
            const res = await request(app).post('/casos').send(novoCaso);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
        });

        test('Deve retornar 404 ao criar um caso com agente_id inexistente', async () => {
            const novoCaso = { titulo: 'Caso com Agente Fantasma', descricao: '...', status: 'aberto', agente_id: 'agente-fantasma' };
            const res = await request(app).post('/casos').send(novoCaso);
            expect(res.statusCode).toEqual(404);
        });
        
        test('Deve retornar 400 ao criar um caso com status inválido', async () => {
            const novoCaso = { titulo: 'Caso com Status Ruim', descricao: '...', status: 'pendente', agente_id: 'agente-1' };
            const res = await request(app).post('/casos').send(novoCaso);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toHaveProperty('status');
        });
    });

    describe('PUT /casos/:id', () => {
        test('Deve atualizar um caso por completo com sucesso', async () => {
            const dadosAtualizados = { titulo: 'Título Atualizado', descricao: 'Descrição Atualizada', status: 'solucionado', agente_id: 'agente-2' };
            const res = await request(app).put('/casos/caso-1').send(dadosAtualizados);
            expect(res.statusCode).toEqual(200);
            expect(res.body.titulo).toBe('Título Atualizado');
            expect(res.body.agente_id).toBe('agente-2');
        });
        
        test('Deve retornar 400 ao tentar atualizar (PUT) um caso sem um campo obrigatório', async () => {
            const dadosIncompletos = { descricao: 'Descrição Atualizada', status: 'solucionado', agente_id: 'agente-1' };
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
            expect(res.body.titulo).toBe('Assalto na avenida principal'); // Garante que outros campos não mudaram
        });

        test('Deve retornar 404 ao tentar atualizar (PATCH) com um agente_id inexistente', async () => {
            const dadosParciais = { agente_id: 'agente-inexistente' };
            const res = await request(app).patch('/casos/caso-1').send(dadosParciais);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /casos/:id', () => {
        test('Deve deletar um caso com sucesso', async () => {
            const res = await request(app).delete('/casos/caso-1');
            expect(res.statusCode).toEqual(204);
        });

        test('Deve retornar 404 ao tentar deletar um caso com ID inexistente', async () => {
            const res = await request(app).delete('/casos/id-inexistente');
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('GET /casos/:caso_id/agente', () => {
        test('Deve retornar os dados do agente responsável pelo caso', async () => {
            const res = await request(app).get('/casos/caso-1/agente');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'agente-1');
        });

        test('Deve retornar 404 se o caso não for encontrado', async () => {
            const res = await request(app).get('/casos/id-inexistente/agente');
            expect(res.statusCode).toEqual(404);
        });

        test('Deve retornar 404 se o agente associado ao caso não for encontrado', async () => {
            // Cenário de inconsistência de dados: o caso existe, mas o agente não.
            casosRepository.findById.mockReturnValue({ id: 'caso-5', agente_id: 'agente-fantasma' });
            agentesRepository.findById.mockReturnValue(null); // Simula que o agente não foi encontrado
            
            const res = await request(app).get('/casos/caso-5/agente');
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toContain('Agente associado ao caso não foi encontrado.');
        });
    });
});