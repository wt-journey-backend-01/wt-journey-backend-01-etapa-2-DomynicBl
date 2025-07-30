const { v4: uuidv4 } = require('uuid');

// Simulação de um banco de dados em memória
let casos = [
    {
        id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
        titulo: "Homicídio no Bairro União",
        descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
        status: "aberto",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
    },
    {
        id: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
        titulo: "Furto de Veículo",
        descricao: "Um carro modelo sedan foi furtado na madrugada de hoje no centro da cidade.",
        status: "solucionado",
        agente_id: "a2b3c4d5-6789-01ef-ghij-2345678901bc"
    },
    {
        id: "b2c3d4e5-9012-3456-7890-abcdef123456",
        titulo: "Roubo ao Banco Central",
        descricao: "Um grupo armado invadiu o cofre principal durante a madrugada.",
        status: "aberto",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
    },
    {
        id: "c1e3d5a7-8b9a-4f2c-9d6e-1a2b3c4d5e6f",
        titulo: "Desaparecimento Misterioso",
        descricao: "Cientista renomado desaparece de seu laboratório sem deixar rastros.",
        status: "solucionado",
        agente_id: "a2a7c438-e7b3-4a6a-8b82-9a3b5b4c6d7e"
    },
    {
        id: "d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6",
        titulo: "Fraude em Licitação",
        descricao: "Suspeita de manipulação em processo licitatório para construção de escola.",
        status: "aberto",
        agente_id: "b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6"
    },
    {
        id: "e1f2g3h4-i5j6-k7l8-m9n0-o1p2q3r4s5t6",
        titulo: "Assalto a Mão Armada",
        descricao: "Bandidos armados invadem loja de eletrônicos e levam mercadorias.",
        status: "aberto",
        agente_id: "c1e3d5a7-8b9a-4f2c-9d6e-1a2b3c4d5e6f"
    },
    {
        id: "f1g2h3i4-j5k6-l7m8-n9o0-p1q2r3s4t5u6",
        titulo: "Vazamento de Dados",
        descricao: "Informações confidenciais de clientes foram expostas na internet.",
        status: "aberto",
        agente_id: "d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6"
    }
];

function findAll() {
    return casos;
}

function findById(id) {
    return casos.find(caso => caso.id === id);
}

function create(caso) {
    const novoCaso = { id: uuidv4(), ...caso };
    casos.push(novoCaso);
    return novoCaso;
}

function update(id, casoAtualizado) {
    const index = casos.findIndex(caso => caso.id === id);
    if (index !== -1) {
        casos[index] = { id, ...casoAtualizado };
        return casos[index];
    }
    return null;
}

function patch(id, dadosParciais) {
    const index = casos.findIndex(caso => caso.id === id);
    if (index !== -1) {
        casos[index] = { ...casos[index], ...dadosParciais };
        return casos[index];
    }
    return null;
}

function remove(id) {
    const index = casos.findIndex(caso => caso.id === id);
    if (index !== -1) {
        casos.splice(index, 1);
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