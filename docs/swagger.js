// docs/swagger.js

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API do Departamento de Polícia',
    version: '1.0.0',
    description: 'API RESTful para gerenciamento de casos e agentes da polícia.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento',
    },
  ],
  components: {
    schemas: {
      // Schemas para Agentes
      Agente: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'O ID gerado para o agente.' },
          nome: { type: 'string', description: 'O nome completo do agente.' },
          dataDeIncorporacao: { type: 'string', format: 'date', description: 'A data em que o agente entrou na corporação (YYYY-MM-DD).' },
          cargo: { type: 'string', description: 'O cargo do agente (ex: inspetor, delegado).' }
        },
        example: {
          id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
          nome: "Rommel Carneiro",
          dataDeIncorporacao: "1992-10-04",
          cargo: "delegado"
        }
      },
      NovoAgente: {
        type: 'object',
        required: ['nome', 'dataDeIncorporacao', 'cargo'],
        properties: {
          nome: { type: 'string' },
          dataDeIncorporacao: { type: 'string', format: 'date' },
          cargo: { type: 'string' }
        },
        example: {
          nome: "Clarice Starling",
          dataDeIncorporacao: "2020-01-15",
          cargo: "inspetor"
        }
      },
      AgenteParcial: {
        type: 'object',
        properties: {
          nome: { type: 'string' },
          dataDeIncorporacao: { type: 'string', format: 'date' },
          cargo: { type: 'string' }
        }
      },
      // Schemas para Casos
      Caso: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'O ID gerado para o caso.' },
          titulo: { type: 'string', description: 'O título do caso.' },
          descricao: { type: 'string', description: 'A descrição detalhada do caso.' },
          status: { type: 'string', enum: ['aberto', 'solucionado'], description: 'O status atual do caso.' },
          agente_id: { type: 'string', format: 'uuid', description: 'O ID do agente responsável pelo caso.' }
        },
        example: {
          id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
          titulo: "Homicídio no Bairro União",
          descricao: "Disparos foram reportados às 22:33...",
          status: "aberto",
          agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
        }
      },
      NovoCaso: {
        type: 'object',
        required: ['titulo', 'descricao', 'status', 'agente_id'],
        properties: {
          titulo: { type: 'string' },
          descricao: { type: 'string' },
          status: { type: 'string', enum: ['aberto', 'solucionado'] },
          agente_id: { type: 'string', format: 'uuid' }
        },
        example: {
          titulo: "Assalto a banco",
          descricao: "Assalto a mão armada na agência central.",
          status: "aberto",
          agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
        }
      },
      CasoParcial: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          descricao: { type: 'string' },
          status: { type: 'string', enum: ['aberto', 'solucionado'] },
          agente_id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  // O caminho para os arquivos da API continua o mesmo
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
