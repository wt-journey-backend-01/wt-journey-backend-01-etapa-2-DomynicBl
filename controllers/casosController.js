const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const errorHandler = require('../utils/errorHandler');

// Função auxiliar para validar os dados de um caso (para POST e PUT)
function validarDadosCaso(dados) {
    const errors = {};

    if (!dados.titulo) errors.titulo = "O campo 'titulo' é obrigatório.";
    if (!dados.descricao) errors.descricao = "O campo 'descricao' é obrigatória.";
    if (!dados.status) {
        errors.status = "O campo 'status' é obrigatório.";
    } else if (dados.status !== 'aberto' && dados.status !== 'solucionado') {
        errors.status = "O campo 'status' pode ser somente 'aberto' ou 'solucionado'.";
    }
    if (!dados.agente_id) {
        errors.agente_id = "O campo 'agente_id' é obrigatório.";
    }
    
    return errors;
}

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

function createCaso(req, res) {
    try {
        const errors = validarDadosCaso(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }
        
        if (!agentesRepository.findById(req.body.agente_id)) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${req.body.agente_id}' não encontrado.`);
        }

        const novoCaso = casosRepository.create(req.body);
        res.status(201).json(novoCaso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

function updateCaso(req, res) {
    try {
        const { id } = req.params;
        if (!casosRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        if ('id' in req.body) {
            return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
        }
        
        const errors = validarDadosCaso(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        if (!agentesRepository.findById(req.body.agente_id)) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${req.body.agente_id}' não encontrado.`);
        }
        
        const casoAtualizado = casosRepository.update(id, req.body);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

function patchCaso(req, res) {
    try {
        const { id } = req.params;
        if (!casosRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        const dadosParciais = req.body;
        
        if (!dadosParciais || typeof dadosParciais !== 'object' || Array.isArray(dadosParciais) || Object.keys(dadosParciais).length === 0) {
            return errorHandler.sendInvalidParameterError(res, { body: "Corpo da requisição para atualização parcial (PATCH) está vazio ou em formato inválido." });
        }

        if ('id' in dadosParciais) {
            return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
        }

        if (dadosParciais.agente_id && !agentesRepository.findById(dadosParciais.agente_id)) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${dadosParciais.agente_id}' não encontrado.`);
        }
        
        if (dadosParciais.status && (dadosParciais.status !== 'aberto' && dadosParciais.status !== 'solucionado')) {
            return errorHandler.sendInvalidParameterError(res, { status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
        }

        const casoAtualizado = casosRepository.patch(id, dadosParciais);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

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

function getAgenteByCasoId(req, res) {
    try {
        const { caso_id } = req.params;
        const caso = casosRepository.findById(caso_id);

        if (!caso) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        const agente = agentesRepository.findById(caso.agente_id);
        if (!agente) {
            // Este cenário seria um erro de integridade de dados, mas é bom tratar.
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