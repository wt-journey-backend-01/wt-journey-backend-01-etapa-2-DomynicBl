<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para DomynicBl:

Nota final: **79.6/100**

# Feedback para DomynicBl 🚓✨

Olá, Domynic! Que legal ver seu projeto da API para o Departamento de Polícia tomando forma! 🚀 Você fez um trabalho muito sólido, e eu quero começar destacando os pontos que você mandou muito bem, para já energizar nossa conversa:

---

## 🎉 Seus pontos fortes (parabéns!):

- **Organização do projeto**: Sua estrutura de pastas está muito bem montada, seguindo direitinho o padrão esperado com `routes/`, `controllers/`, `repositories/` e `utils/`. Isso é fundamental para manter o código escalável e fácil de entender. 👏

- **Implementação dos métodos HTTP para `/agentes` e `/casos`**: Você implementou todos os métodos (GET, POST, PUT, PATCH, DELETE) para ambos os recursos, com rotas e controladores separados. Isso mostra domínio da arquitetura modular e do Express.js.

- **Validações básicas e tratamento de erros**: Seu código já faz validações importantes nos payloads e retorna os códigos HTTP corretos (400, 404, 201, 204, etc). O uso do `errorHandler` para padronizar as respostas é uma ótima prática.

- **Filtros simples funcionando**: A filtragem por status e agente nos casos está bem implementada, assim como a filtragem por cargo e ordenação em agentes (embora com pontos a melhorar, que já vou falar).

- **Bônus conquistados**: Você já implementou o endpoint para buscar o agente responsável por um caso, e os filtros básicos por status e agente também estão ok. Isso é um diferencial bacana! 🎯

---

## 🕵️ Análise detalhada dos pontos que precisam de atenção

### 1. Penalidade: **Permitir data de incorporação no futuro para agentes**

No seu repositório de agentes, percebi que você tem um agente com `dataDeIncorporacao: "2025-07-30"` — uma data no futuro! Isso indica que sua validação no controlador não está bloqueando datas maiores que a data atual.

No `controllers/agentesController.js`, na função `createAgente` e `updateAgente`, você valida apenas o formato da data, mas não se ela é anterior ou igual à data atual:

```js
const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

if (!dataDeIncorporacao) {
    errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório.";
} else if (!dateFormat.test(dataDeIncorporacao)) {
    errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
}
// Aqui falta validar se dataDeIncorporacao não é futura!
```

**Como melhorar?**  
Você pode adicionar uma validação para comparar a data recebida com a data atual, assim:

```js
const dataIncorp = new Date(dataDeIncorporacao);
const hoje = new Date();

if (dataIncorp > hoje) {
    errors.dataDeIncorporacao = "Data de incorporação não pode ser no futuro.";
}
```

Isso evita que agentes sejam criados ou atualizados com datas irreais.  
Recomendo este vídeo para aprofundar validação de dados em APIs Node.js/Express:  
👉 https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

---

### 2. Penalidade: **Permitir alteração do campo `id` no PUT e PATCH**

No seu controlador, nas funções `updateAgente` e `patchAgente` (idem para casos), não há nenhuma proteção para impedir que o campo `id` seja alterado via payload. Isso pode causar inconsistências no seu banco em memória, pois o `id` é a referência única.

Por exemplo, em `updateAgente`:

```js
const { nome, dataDeIncorporacao, cargo } = req.body;
// Se o payload vier com id, ele será ignorado? Não há tratamento para isso!
const agenteAtualizado = agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });
```

Mas se o cliente enviar um JSON com `"id": "outro-id"`, esse campo pode substituir o original no objeto atualizado, dependendo da forma como o repository está implementado.

No seu `repositories/agentesRepository.js`, o método `update` faz:

```js
agentes[index] = { id, ...agenteAtualizado };
```

Aqui, você força o `id` correto, o que é ótimo, mas no PATCH:

```js
agentes[index] = { ...agentes[index], ...dadosParciais };
```

Se `dadosParciais` tiver `id`, ele vai sobrescrever o original! Isso é um problema.

**Como corrigir?**  
No controlador, antes de passar os dados para o repository, remova o campo `id` se ele existir:

```js
delete dadosParciais.id;
```

Ou faça uma validação que se `id` estiver presente no body, retorne erro 400 informando que não pode alterar o id.

Isso garante a integridade dos dados.  
Para entender melhor manipulação de dados e validação em APIs, veja:  
👉 https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400

---

### 3. Falha no teste: **Criar caso com id de agente inválido retorna 404**

Em `createCaso` no `casosController.js`, você faz a validação do `agente_id`:

```js
if (!agente_id) {
    errors.agente_id = "O campo 'agente_id' é obrigatório.";
} else if (!agentesRepository.findById(agente_id)) {
    errors.agente_id = `Agente com id '${agente_id}' não encontrado.`;
}
```

Aqui você retorna um erro 400 (Bad Request) para `agente_id` inválido, mas o teste espera erro 404 (Not Found) para `agente_id` inexistente.

**Por quê?**  
O código 400 indica erro no formato ou dados inválidos, mas 404 faz mais sentido quando o recurso referenciado não existe — como um agente que não foi encontrado.

**Como ajustar?**  
Você pode modificar o retorno para:

- Se `agente_id` estiver ausente ou mal formatado → 400  
- Se `agente_id` não existir no repositório → 404  

Exemplo:

```js
if (!agente_id) {
    errors.agente_id = "O campo 'agente_id' é obrigatório.";
    return errorHandler.sendInvalidParameterError(res, errors);
}

const agenteExiste = agentesRepository.findById(agente_id);
if (!agenteExiste) {
    return errorHandler.sendNotFoundError(res, `Agente com id '${agente_id}' não encontrado.`);
}
```

Assim você respeita o significado correto dos códigos HTTP e melhora a semântica da sua API.  
Para entender melhor o uso dos status codes 400 e 404, recomendo:  
👉 https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
👉 https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404

---

### 4. Falha em filtros e mensagens de erro customizadas

Vi que os filtros básicos estão funcionando, mas os testes indicam que faltam:

- Filtragem de agentes por data de incorporação com ordenação crescente e decrescente funcionando corretamente.  
- Filtragem de casos por keywords no título e descrição.  
- Mensagens de erro customizadas para parâmetros inválidos (query params e payloads).

No seu código, por exemplo, no `getAllAgentes`:

```js
if (sort) {
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    if (sortField !== 'dataDeIncorporacao') {
        return errorHandler.sendInvalidParameterError(res, { sort: "Valor inválido. Aceito apenas 'dataDeIncorporacao' ou '-dataDeIncorporacao'." });
    }
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    agentes.sort((a, b) => (new Date(a.dataDeIncorporacao) - new Date(b.dataDeIncorporacao)) * sortOrder);
}
```

Aqui a lógica parece correta, mas o teste pode estar esperando que você trate também o caso de filtro por data (ex: `?dataDeIncorporacao=YYYY-MM-DD`) antes da ordenação, e que as mensagens de erro retornem um JSON consistente e detalhado.

Também no `getAllCasos`, a busca por `q` está implementada, mas o teste pode estar esperando que você normalize o texto para evitar problemas com acentuação ou espaços extras.

**Como melhorar?**

- Garanta que as mensagens de erro sejam sempre objetos JSON com chaves claras e mensagens amigáveis, por exemplo:

```js
return errorHandler.sendInvalidParameterError(res, {
    query: `Parâmetros de consulta inválidos: ${invalidParams.join(', ')}.`
});
```

- Para a busca por texto, normalize strings e trate possíveis erros de entrada.

- Para o filtro por data, implemente o filtro antes da ordenação:

```js
if (req.query.dataDeIncorporacao) {
    const filtroData = new Date(req.query.dataDeIncorporacao);
    agentes = agentes.filter(agente => new Date(agente.dataDeIncorporacao).getTime() === filtroData.getTime());
}
```

- Use bibliotecas como `moment` ou `date-fns` para manipulações mais robustas, se quiser.

Para entender mais sobre filtros complexos e mensagens de erro personalizadas, recomendo:  
👉 https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH  
👉 https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400

---

## ✍️ Código de exemplo para proteger alteração de `id` no PATCH (repositório de agentes):

```js
function patch(id, dadosParciais) {
    if ('id' in dadosParciais) {
        delete dadosParciais.id; // Remove id para não alterar
    }
    const index = agentes.findIndex(agente => agente.id === id);
    if (index !== -1) {
        agentes[index] = { ...agentes[index], ...dadosParciais };
        return agentes[index];
    }
    return null;
}
```

Ou no controlador:

```js
function patchAgente(req, res) {
    const { id } = req.params;
    if (!agentesRepository.findById(id)) {
        return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
    }
    if ('id' in req.body) {
        return errorHandler.sendInvalidParameterError(res, { id: "Não é permitido alterar o campo 'id'." });
    }
    // resto do código...
}
```

---

## Resumo rápido para você focar:

- [ ] Bloquear datas de incorporação no futuro para agentes (validação de data)  
- [ ] Impedir alteração do campo `id` em PUT e PATCH, tanto para agentes quanto para casos  
- [ ] Ajustar o retorno de erro para criar caso com `agente_id` inexistente: usar 404 em vez de 400  
- [ ] Completar filtros avançados (ex: filtro por dataDeIncorporacao, busca por keywords em casos)  
- [ ] Melhorar mensagens de erro para serem sempre JSON claros e personalizados  
- [ ] Garantir que o filtro e ordenação funcionem corretamente e na ordem esperada  

---

## Para finalizar...

Domynic, seu projeto está muito bem encaminhado! Você já domina os conceitos principais e a arquitetura está muito bem feita. Com esses ajustes, sua API vai ficar ainda mais robusta, confiável e profissional. 💪

Continue assim, revisando seu código com atenção e testando cada cenário. Lembre-se que validar os dados com cuidado e usar os códigos HTTP corretos faz toda a diferença para quem vai consumir sua API.

Se quiser, dê uma olhada nos vídeos recomendados para fortalecer esses pontos, especialmente sobre validação e tratamento de erros — eles vão te ajudar a dar aquele upgrade! 🚀

Qualquer dúvida, estou aqui para ajudar! Vamos juntos nessa jornada de aprendizado. 👊

Um abraço e bons códigos! 💙

---

# Recursos recomendados para você:

- [Validação de dados em APIs Node.js/Express](https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_)  
- [Status HTTP 400 - Bad Request](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400)  
- [Status HTTP 404 - Not Found](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404)  
- [Arquitetura MVC para Node.js/Express](https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH)  
- [Express.js Routing (documentação oficial)](https://expressjs.com/pt-br/guide/routing.html)

---

Fique à vontade para compartilhar seu progresso depois das correções! Estou torcendo pelo seu sucesso! 🚓✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>