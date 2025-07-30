// routes/casosRoutes.js

const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');

/**
 * @swagger
 * tags:
 * name: Casos
 * description: API para gerenciamento de casos policiais
 */

/**
 * @swagger
 * /casos:
 * get:
 * summary: Lista todos os casos
 * tags: [Casos]
 * parameters:
 * - in: query
 * name: status
 * schema:
 * type: string
 * enum: [aberto, solucionado]
 * description: Filtra casos pelo status
 * - in: query
 * name: agente_id
 * schema:
 * type: string
 * format: uuid
 * description: Filtra casos por agente responsável
 * - in: query
 * name: q
 * schema:
 * type: string
 * description: Busca por texto no título ou descrição
 * responses:
 * 200:
 * description: A lista de casos
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Caso'
 */
router.get('/casos', casosController.getAllCasos);

/**
 * @swagger
 * /casos/{id}:
 * get:
 * summary: Retorna um caso específico pelo ID
 * tags: [Casos]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do caso
 * responses:
 * 200:
 * description: Detalhes do caso
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Caso'
 * 404:
 * description: Caso não encontrado
 */
router.get('/casos/:id', casosController.getCasoById);

/**
 * @swagger
 * /casos:
 * post:
 * summary: Cria um novo caso
 * tags: [Casos]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoCaso'
 * responses:
 * 201:
 * description: Caso criado com sucesso
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Caso'
 * 400:
 * description: Dados inválidos
 */
router.post('/casos', casosController.createCaso);

/**
 * @swagger
 * /casos/{id}:
 * put:
 * summary: Atualiza um caso por completo (todos os campos)
 * tags: [Casos]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do caso a ser atualizado
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/NovoCaso'
 * responses:
 * 200:
 * description: Caso atualizado com sucesso
 * 400:
 * description: Dados inválidos
 * 404:
 * description: Caso não encontrado
 */
router.put('/casos/:id', casosController.updateCaso);

/**
 * @swagger
 * /casos/{id}:
 * patch:
 * summary: Atualiza um caso parcialmente
 * tags: [Casos]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do caso a ser atualizado
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CasoParcial'
 * responses:
 * 200:
 * description: Caso atualizado com sucesso
 * 400:
 * description: Dados inválidos
 * 404:
 * description: Caso não encontrado
 */
router.patch('/casos/:id', casosController.patchCaso);

/**
 * @swagger
 * /casos/{id}:
 * delete:
 * summary: Remove um caso
 * tags: [Casos]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do caso a ser removido
 * responses:
 * 204:
 * description: Caso removido com sucesso
 * 404:
 * description: Caso não encontrado
 */
router.delete('/casos/:id', casosController.deleteCaso);

/**
 * @swagger
 * /casos/{caso_id}/agente:
 * get:
 * summary: Retorna o agente responsável por um caso específico
 * tags: [Casos]
 * parameters:
 * - in: path
 * name: caso_id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID do caso
 * responses:
 * 200:
 * description: Dados do agente responsável
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Agente'
 * 404:
 * description: Caso ou agente não encontrado
 */
router.get('/casos/:caso_id/agente', casosController.getAgenteByCasoId);

module.exports = router;
