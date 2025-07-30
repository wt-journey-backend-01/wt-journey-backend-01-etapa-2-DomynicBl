const agentesRepository = require('../repositories/agentesRepository');
const casosRepository = require('../repositories/casosRepository');
const errorHandler = require('../utils/errorHandler');

// Função auxiliar para validar os dados de um agente
function validarDadosAgente(dados) {
    const errors = {};
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dados.nome) errors.nome = "O campo 'nome' é obrigatório.";
    if (!dados.dataDeIncorporacao) {
        errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório.";
    } else if (!dateFormat.test(dados.dataDeIncorporacao)) {
        errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
    } else {
        const dataIncorp = new Date(dados.dataDeIncorporacao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataIncorp > hoje) {
            errors.dataDeIncorporacao = "Data de incorporação não pode ser no futuro.";
        }
    }
    if (!dados.cargo) errors.cargo = "O campo 'cargo' é obrigatório.";

    return errors;
}

function getAllAgentes(req, res) {
    try {
        const allowedParams = ['cargo', 'sort', 'dataDeIncorporacao'];
        const receivedParams = Object.keys(req.query);
        const invalidParams = receivedParams.filter(param => !allowedParams.includes(param));

        if (invalidParams.length > 0) {
            return errorHandler.sendInvalidParameterError(res, { query: `Parâmetros de consulta inválidos: ${invalidParams.join(', ')}.` });
        }

        let agentes = agentesRepository.findAll();
        const { cargo, sort, dataDeIncorporacao } = req.query;
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        if (cargo) {
            agentes = agentes.filter(agente => agente.cargo.toLowerCase() === cargo.toLowerCase());
        }
        
        if (dataDeIncorporacao) {
            if (!dateFormat.test(dataDeIncorporacao)) {
                return errorHandler.sendInvalidParameterError(res, {
                    dataDeIncorporacao: "O parâmetro 'dataDeIncorporacao' deve seguir o formato 'YYYY-MM-DD'."
                });
            }
            agentes = agentes.filter(agente => agente.dataDeIncorporacao === dataDeIncorporacao);
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

function createAgente(req, res) {
    try {
        const errors = validarDadosAgente(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const novoAgente = agentesRepository.create(req.body);
        res.status(201).json(novoAgente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

function updateAgente(req, res) {
    try {
        const { id } = req.params;
        if (!agentesRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }

        if ('id' in req.body) {
            return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
        }

        const errors = validarDadosAgente(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const agenteAtualizado = agentesRepository.update(id, req.body);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

function patchAgente(req, res) {
    try {
        const { id } = req.params;
        const agente = agentesRepository.findById(id);
        if (!agente) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        
        const dadosParciais = req.body;
        
        if (!dadosParciais || typeof dadosParciais !== 'object' || Array.isArray(dadosParciais) || Object.keys(dadosParciais).length === 0) {
            return errorHandler.sendInvalidParameterError(res, { body: "Corpo da requisição para atualização parcial (PATCH) está vazio ou em formato inválido." });
        }

        if ('id' in dadosParciais) {
            return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
        }

        const errors = {};
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        if (dadosParciais.dataDeIncorporacao) {
            if (!dateFormat.test(dadosParciais.dataDeIncorporacao)) {
                errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
            } else {
                const dataIncorp = new Date(dadosParciais.dataDeIncorporacao);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                if (dataIncorp > hoje) {
                    errors.dataDeIncorporacao = "Data de incorporação não pode ser no futuro.";
                }
            }
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

function deleteAgente(req, res) {
    try {
        const { id } = req.params;
        if (!agentesRepository.findById(id)) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }

        const todosOsCasos = casosRepository.findAll();
        const casosDoAgente = todosOsCasos.some(caso => caso.agente_id === id);

        if (casosDoAgente) {
            return errorHandler.sendInvalidParameterError(res, {
                delecao: 'Não é possível excluir o agente pois ele está associado a casos existentes.'
            });
        }

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