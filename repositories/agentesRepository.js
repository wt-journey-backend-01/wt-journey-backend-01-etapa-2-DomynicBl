// repositories/agentesRepository.js

const { v4: uuidv4 } = require('uuid');

// Simulação de um banco de dados em memória
let agentes = [
    {
        id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
        nome: "Rommel Carneiro",
        dataDeIncorporacao: "1992-10-04",
        cargo: "delegado"
    },
    {
        id: "a2b3c4d5-6789-01ef-ghij-2345678901bc",
        nome: "Ana Oliveira",
        dataDeIncorporacao: "2015-03-12",
        cargo: "inspetor"
    }, 
    {
        id: "a2a7c438-e7b3-4a6a-8b82-9a3b5b4c6d7e",
        nome: "Carlos Silva",
        dataDeIncorporacao: "2010-07-19",
        cargo: "agente"
    },
    {
        id: "b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6",
        nome: "Fernanda Souza",
        dataDeIncorporacao: "2018-11-25",
        cargo: "perito"
    },
    {
        id: "c1e3d5a7-8b9a-4f2c-9d6e-1a2b3c4d5e6f",
        nome: "Roberto Lima",
        dataDeIncorporacao: "2020-05-30",
        cargo: "agente"
    }, 
    {
        id: "d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6",
        nome: "Domynic Barros Lima",
        dataDeIncorporacao: "2025-07-30",
        cargo: "delegado"
    }
];

// Função para encontrar todos os agentes
function findAll() {
    return agentes;
}

// Função para encontrar um agente por ID
function findById(id) {
    return agentes.find(agente => agente.id === id);
}

// Função para criar um novo agente
function create(agente) {
    const novoAgente = { id: uuidv4(), ...agente };
    agentes.push(novoAgente);
    return novoAgente;
}

// Função para atualizar um agente por completo (PUT)
function update(id, agenteAtualizado) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index !== -1) {
        agentes[index] = { id, ...agenteAtualizado };
        return agentes[index];
    }
    return null;
}

// Função para atualizar um agente parcialmente (PATCH)
function patch(id, dadosParciais) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index !== -1) {
        agentes[index] = { ...agentes[index], ...dadosParciais };
        return agentes[index];
    }
    return null;
}

// Função para deletar um agente por ID
function remove(id) {
    const index = agentes.findIndex(agente => agente.id === id);
    if (index !== -1) {
        agentes.splice(index, 1);
        return true;
    }
    return false;
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    patch,
    remove
};
