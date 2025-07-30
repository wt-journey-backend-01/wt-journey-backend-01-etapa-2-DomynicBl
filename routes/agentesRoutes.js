// routes/agentesRoutes.js

const express = require('express');
const router = express.Router();
const agentesController = require('../controllers/agentesController');

/**
 * @swagger
 * tags:
 * name: Agentes
 * description: API para gerenciamento de agentes
 */

/**
 * @swagger
 * /agentes:
 * get:
 * summary: Lista todos os agentes
 * tags: [Agentes]
 * parameters:
 * - in: query
 * name: cargo
 * schema:
 * type: string
 * description: Filtra agentes pelo cargo
 * - in: query
 * name: sort
 * schema:
 * type: string
 * enum: [dataDeIncorporacao, -dataDeIncorporacao]
 * description: Ordena os agentes pela data de incorporação
 * responses:
 * 200:
 * description: A lista de agentes
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Agente'
 */
router.get('/agentes', agentesController.getAllAgentes);

/**
 * @swagger
 * /agentes/{id}:
 * get:
 * summary: Retorna um agente específico pelo ID
 * tags: [Agentes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do agente
 * responses:
 * 200:
 * description: Detalhes do agente
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Agente'
 * 404:
 * description: Agente não encontrado
 */
router.get('/agentes/:id', agentesController.getAgenteById);

/**
 * @swagger
 * /agentes:
 * post:
 * summary: Cria um novo agente
 * tags: [Agentes]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoAgente'
 * responses:
 * 201:
 * description: Agente criado com sucesso
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Agente'
 * 400:
 * description: Dados inválidos
 */
router.post('/agentes', agentesController.createAgente);

/**
 * @swagger
 * /agentes/{id}:
 * put:
 * summary: Atualiza um agente por completo
 * tags: [Agentes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do agente
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoAgente'
 * responses:
 * 200:
 * description: Agente atualizado
 * 400:
 * description: Dados inválidos
 * 404:
 * description: Agente não encontrado
 */
router.put('/agentes/:id', agentesController.updateAgente);

/**
 * @swagger
 * /agentes/{id}:
 * patch:
 * summary: Atualiza um agente parcialmente
 * tags: [Agentes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do agente
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AgenteParcial'
 * responses:
 * 200:
 * description: Agente atualizado
 * 400:
 * description: Dados inválidos
 * 404:
 * description: Agente não encontrado
 */
router.patch('/agentes/:id', agentesController.patchAgente);

/**
 * @swagger
 * /agentes/{id}:
 * delete:
 * summary: Remove um agente
 * tags: [Agentes]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do agente
 * responses:
 * 204:
 * description: Agente removido
 * 404:
 * description: Agente não encontrado
 */
router.delete('/agentes/:id', agentesController.deleteAgente);

module.exports = router;
