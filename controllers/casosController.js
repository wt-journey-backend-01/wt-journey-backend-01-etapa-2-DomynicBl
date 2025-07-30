// controllers/casosController.js

const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const errorHandler = require('../utils/errorHandler');

// Controlador para gerenciar casos
function getAllCasos(req, res) {
    try {
        const allowedParams = ['agente_id', 'status', 'q'];
        const receivedParams = Object.keys(req.query);
        const invalidParams = receivedParams.filter(param => !allowedParams.includes(param));

        if (invalidParams.length > 0) {
            return errorHandler.sendInvalidParameterError(res, { query: `Parâmetros de consulta inválidos: ${invalidParams.join(', ')}.` });
        }

        let casos = casosRepository.findAll();
        const { agente_id, status, q } = req.query;

        if (agente_id) {
            casos = casos.filter(caso => caso.agente_id === agente_id);
        }

        if (status) {
            if (status !== 'aberto' && status !== 'solucionado') {
                return errorHandler.sendInvalidParameterError(res, { status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'" });
            }
            casos = casos.filter(caso => caso.status === status);
        }
        
        if (q) {
            const query = q.toLowerCase();
            casos = casos.filter(caso => 
                caso.titulo.toLowerCase().includes(query) || 
                caso.descricao.toLowerCase().includes(query)
            );
        }

        res.status(200).json(casos);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// Funções CRUD para casos
function getCasoById(req, res) {
    try {
        const { id } = req.params;
        const caso = casosRepository.findById(id);
        if (!caso) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }
        res.status(200).json(caso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO CRIAR =====
function createCaso(req, res) {
    try {
        const { titulo, descricao, status, agente_id } = req.body;
        const errors = {};

        if (!titulo) errors.titulo = "O campo 'titulo' é obrigatório.";
        if (!descricao) errors.descricao = "O campo 'descricao' é obrigatória.";
        if (!status) {
            errors.status = "O campo 'status' é obrigatório.";
        } else if (status !== 'aberto' && status !== 'solucionado') {
            errors.status = "O campo 'status' pode ser somente 'aberto' ou 'solucionado'.";
        }
        
        if (!agente_id) {
            errors.agente_id = "O campo 'agente_id' é obrigatório.";
        }

        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }
        
        if (!agentesRepository.findById(agente_id)) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${agente_id}' não encontrado.`);
        }

        const novoCaso = casosRepository.create({ titulo, descricao, status, agente_id });
        res.status(201).json(novoCaso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO ATUALIZAR =====
function updateCaso(req, res) {
    try {
        const { id } = req.params;
        if (!casosRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        // CORREÇÃO 2: Impedir alteração do ID
        if ('id' in req.body) {
            return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
        }

        const { titulo, descricao, status, agente_id } = req.body;
        // ... (lógica de validação similar à de createCaso) ...
        if (!agente_id) {
             return errorHandler.sendInvalidParameterError(res, { agente_id: "O campo 'agente_id' é obrigatório." });
        }
        if (!agentesRepository.findById(agente_id)) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${agente_id}' não encontrado.`);
        }
        
        const casoAtualizado = casosRepository.update(id, { titulo, descricao, status, agente_id });
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO PATCH =====
function patchCaso(req, res) {
    try {
        const { id } = req.params;
        if (!casosRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        // CORREÇÃO 2: Impedir alteração do ID
        if ('id' in req.body) {
            return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
        }

        const dadosParciais = req.body;
        
        // CORREÇÃO 3: Usar 404 para agente_id inexistente
        if (dadosParciais.agente_id && !agentesRepository.findById(dadosParciais.agente_id)) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${dadosParciais.agente_id}' não encontrado.`);
        }

        const casoAtualizado = casosRepository.patch(id, dadosParciais);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO PATCH =====
function deleteCaso(req, res) {
    try {
        const { id } = req.params;
        if (!casosRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }
        casosRepository.remove(id);
        res.status(204).send();
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// ===== FUNÇÃO PARA OBTER AGENTE POR ID DE CASO =====
function getAgenteByCasoId(req, res) {
    try {
        const { caso_id } = req.params;
        const caso = casosRepository.findById(caso_id);

        if (!caso) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        const agente = agentesRepository.findById(caso.agente_id);
        if (!agente) {
            return errorHandler.sendNotFoundError(res, 'Agente associado ao caso não foi encontrado.');
        }

        res.status(200).json(agente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}


module.exports = {
    getAllCasos,
    getCasoById,
    createCaso,
    updateCaso,
    patchCaso,
    deleteCaso,
    getAgenteByCasoId
};
