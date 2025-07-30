// controllers/agentesController.js

const agentesRepository = require('../repositories/agentesRepository');
const casosRepository = require('../repositories/casosRepository'); // Importando o repositório de casos
const errorHandler = require('../utils/errorHandler');

// Funções do controlador para gerenciar agentes
function getAllAgentes(req, res) {
    try {
        const allowedParams = ['cargo', 'sort'];
        const receivedParams = Object.keys(req.query);
        const invalidParams = receivedParams.filter(param => !allowedParams.includes(param));

        if (invalidParams.length > 0) {
            return errorHandler.sendInvalidParameterError(res, { query: `Parâmetros de consulta inválidos: ${invalidParams.join(', ')}.` });
        }

        let agentes = agentesRepository.findAll();
        const { cargo, sort } = req.query;

        if (cargo) {
            agentes = agentes.filter(agente => agente.cargo.toLowerCase() === cargo.toLowerCase());
        }

        if (sort) {
            const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
            if (sortField !== 'dataDeIncorporacao') {
                return errorHandler.sendInvalidParameterError(res, { sort: "Valor inválido. Aceito apenas 'dataDeIncorporacao' ou '-dataDeIncorporacao'." });
            }
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            agentes.sort((a, b) => (new Date(a.dataDeIncorporacao) - new Date(b.dataDeIncorporacao)) * sortOrder);
        }

        res.status(200).json(agentes);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// Funções CRUD para agentes
function getAgenteById(req, res) {
    try {
        const { id } = req.params;
        const agente = agentesRepository.findById(id);
        if (!agente) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        res.status(200).json(agente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO CRIAR =====
function createAgente(req, res) {
    try {
        const { nome, dataDeIncorporacao, cargo } = req.body;
        const errors = {};
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        if (!nome) errors.nome = "O campo 'nome' é obrigatório.";
        if (!dataDeIncorporacao) {
            errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório.";
        } else if (!dateFormat.test(dataDeIncorporacao)) {
            errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
        }
        if (!cargo) errors.cargo = "O campo 'cargo' é obrigatório.";

        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const novoAgente = agentesRepository.create({ nome, dataDeIncorporacao, cargo });
        res.status(201).json(novoAgente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO ATUALIZAR =====
function updateAgente(req, res) {
    try {
        const { id } = req.params;
        if (!agentesRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }

        const { nome, dataDeIncorporacao, cargo } = req.body;
        const errors = {};
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        if (!nome) errors.nome = "O campo 'nome' é obrigatório.";
        if (!dataDeIncorporacao) {
            errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório.";
        } else if (!dateFormat.test(dataDeIncorporacao)) {
            errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
        }
        if (!cargo) errors.cargo = "O campo 'cargo' é obrigatório.";

        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const agenteAtualizado = agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO PATCH =====
function patchAgente(req, res) {
    try {
        const { id } = req.params;
        if (!agentesRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }

        const dadosParciais = req.body;
        const errors = {};
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        if (dadosParciais.dataDeIncorporacao && !dateFormat.test(dadosParciais.dataDeIncorporacao)) {
            errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
        }

        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const agenteAtualizado = agentesRepository.patch(id, dadosParciais);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO DELETAR =====
function deleteAgente(req, res) {
    try {
        const { id } = req.params;
        // 1. Verifica se o agente existe
        if (!agentesRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }

        // 2. Verifica se o agente tem casos associados
        const todosOsCasos = casosRepository.findAll();
        const casosDoAgente = todosOsCasos.some(caso => caso.agente_id === id);

        if (casosDoAgente) {
            return errorHandler.sendInvalidParameterError(res, {
                delecao: 'Não é possível excluir o agente pois ele está associado a casos existentes.'
            });
        }

        // 3. Se não houver casos, remove o agente
        agentesRepository.remove(id);
        res.status(204).send();
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    patchAgente,
    deleteAgente
};
