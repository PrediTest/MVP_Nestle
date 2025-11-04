# Guia de Treinamento para Testadores - UAT

## 📚 Índice

1. [Visão Geral da Aplicação](#visão-geral-da-aplicação)
2. [Funcionalidades Principais](#funcionalidades-principais)
3. [Navegação e Interface](#navegação-e-interface)
4. [Procedimentos de Teste](#procedimentos-de-teste)
5. [Ferramentas de Teste](#ferramentas-de-teste)
6. [Boas Práticas](#boas-práticas)
7. [Troubleshooting](#troubleshooting)
8. [Perguntas Frequentes](#perguntas-frequentes)

---

## 🎯 Visão Geral da Aplicação

### O que é PrediTest AI?

PrediTest AI (Aegis) é uma plataforma de análise preditiva para testes industriais eficientes. A aplicação ajuda a Nestlé Brasil a:

- **Reduzir falhas críticas** em 75%
- **Diminuir reclamações** de consumidores em 50%
- **Minimizar downtime** em 40%
- **Economizar** R$ 3 milhões anuais

### Público-Alvo

- Gestores de Qualidade
- Analistas de Dados
- Operadores de Manufatura
- Gerentes de Projetos

### Benefícios Principais

✅ Análise preditiva em tempo real
✅ Alertas automáticos de risco
✅ Relatórios detalhados
✅ Interface intuitiva
✅ Integração com sistemas existentes

---

## 🎨 Funcionalidades Principais

### 1. Dashboard

**O que é?** Visão geral da plataforma com métricas e alertas.

**Como acessar?**
1. Fazer login
2. Clicar em "Dashboard" no menu lateral

**O que você vê?**
- Projetos ativos (card com número)
- Alertas ativos (card com número)
- Taxa de sucesso média (percentual)
- Economia estimada (valor em R$)
- Lista de projetos recentes
- Alertas ativos com cores (amarelo/laranja/vermelho)

**Como testar?**
- [ ] Verificar se todos os cards carregam
- [ ] Verificar se números estão corretos
- [ ] Verificar se gráficos renderizam
- [ ] Verificar se alertas são exibidos

### 2. Projetos

**O que é?** Gerenciamento de projetos de teste.

**Como acessar?**
1. Clicar em "Projetos" no menu lateral

**Operações Disponíveis:**

#### Criar Projeto
```
1. Clicar em "Novo Projeto"
2. Preencher formulário:
   - Nome: Nome do projeto
   - Descrição: Descrição breve
   - Fábrica: Selecionar localização
   - Tipo: Selecionar tipo (Lançamento/Reformulação/Manutenção)
   - Risco Inicial: Inserir percentual (0-100)
3. Clicar em "Salvar"
```

**Como testar?**
- [ ] Criar projeto com dados válidos
- [ ] Verificar se projeto aparece na lista
- [ ] Tentar criar com dados inválidos (validação)
- [ ] Verificar mensagens de sucesso/erro

#### Editar Projeto
```
1. Clicar em projeto na lista
2. Clicar em "Editar"
3. Alterar dados necessários
4. Clicar em "Salvar"
```

**Como testar?**
- [ ] Editar projeto existente
- [ ] Verificar se alterações são salvas
- [ ] Verificar se dados são atualizados na lista

#### Deletar Projeto
```
1. Clicar em projeto na lista
2. Clicar em "Deletar"
3. Confirmar exclusão
```

**Como testar?**
- [ ] Deletar projeto
- [ ] Verificar se projeto é removido da lista
- [ ] Verificar mensagem de confirmação

### 3. Dados de Manufatura

**O que é?** Registro de dados de produção.

**Como acessar?**
1. Clicar em projeto
2. Seção "Dados de Manufatura"

**Como registrar dados?**
```
1. Clicar em "Adicionar Dados"
2. Preencher formulário:
   - Data: Data do registro
   - Linha: Linha de produção
   - Taxa de Defeitos: Percentual de defeitos
   - Conformidade FDA: Percentual de conformidade
   - Conformidade ISO: Percentual de conformidade
3. Clicar em "Salvar"
```

**Como testar?**
- [ ] Registrar dados com valores válidos
- [ ] Verificar se dados aparecem em gráficos
- [ ] Registrar dados que geram alertas
- [ ] Testar validação de campos

### 4. Alertas

**O que é?** Notificações automáticas de risco.

**Como acessar?**
1. Clicar em "Alertas" no menu lateral
2. Ou visualizar no dashboard

**Tipos de Alertas:**
- 🟡 **Warning** (Amarelo): Atenção recomendada
- 🟠 **Error** (Laranja): Ação necessária
- 🔴 **Critical** (Vermelho): Ação imediata

**Como testar?**
- [ ] Visualizar alertas na lista
- [ ] Clicar em alerta para ver detalhes
- [ ] Marcar alerta como resolvido
- [ ] Verificar se alertas são gerados automaticamente

### 5. Relatórios

**O que é?** Documentos com análise de dados.

**Como acessar?**
1. Clicar em "Relatórios" no menu lateral

**Como gerar relatório?**
```
1. Clicar em "Novo Relatório"
2. Selecionar projeto
3. Selecionar período (últimos 7/30/90 dias)
4. Clicar em "Gerar"
5. Aguardar processamento
6. Download automático do PDF
```

**Como testar?**
- [ ] Gerar relatório com diferentes períodos
- [ ] Verificar se PDF contém dados corretos
- [ ] Verificar se gráficos estão presentes
- [ ] Testar performance com grande volume de dados

---

## 🧭 Navegação e Interface

### Menu Principal

```
┌─────────────────────────┐
│  PrediTest AI (Aegis)   │
├─────────────────────────┤
│ 📊 Dashboard            │
│ 📁 Projetos             │
│ ⚠️  Alertas              │
│ 📋 Relatórios           │
│ ⚙️  Configurações        │
│ 👤 Perfil               │
│ 🚪 Sair                 │
└─────────────────────────┘
```

### Componentes Comuns

#### Botões
- **Primário** (Azul): Ações principais (Salvar, Criar)
- **Secundário** (Cinza): Ações secundárias (Cancelar)
- **Perigo** (Vermelho): Ações destrutivas (Deletar)

#### Cards
- Mostram informações resumidas
- Clicáveis para mais detalhes
- Cores indicam status

#### Tabelas
- Dados organizados em linhas
- Paginação para muitos dados
- Ordenação por coluna

#### Formulários
- Campos obrigatórios marcados com *
- Validação em tempo real
- Mensagens de erro claras

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+S` | Salvar |
| `Esc` | Fechar modal/Cancelar |
| `Enter` | Confirmar |
| `Tab` | Próximo campo |

---

## 🧪 Procedimentos de Teste

### Procedimento Padrão

```
1. PREPARAÇÃO
   ├─ Ler caso de teste
   ├─ Preparar dados
   ├─ Abrir navegador
   └─ Fazer login

2. EXECUÇÃO
   ├─ Executar passos
   ├─ Observar resultado
   ├─ Tirar screenshot se necessário
   └─ Registrar tempo

3. VALIDAÇÃO
   ├─ Comparar com esperado
   ├─ Verificar critérios
   ├─ Documentar desvios
   └─ Classificar (PASS/FAIL)

4. DOCUMENTAÇÃO
   ├─ Registrar resultado
   ├─ Adicionar observações
   ├─ Anexar evidências
   └─ Atualizar dashboard
```

### Como Registrar um Defeito

**Passo 1: Reproduzir o Problema**
```
- Executar passos que causam o problema
- Confirmar que é reproduzível
- Tentar em diferentes navegadores/dispositivos
```

**Passo 2: Documentar o Defeito**
```
ID: [AUTO-GERADO]
Título: Descrição breve e clara
Severidade: Crítica/Alta/Média/Baixa
Descrição: Detalhada do problema
Passos para Reproduzir: 1. 2. 3.
Resultado Esperado: O que deveria acontecer
Resultado Observado: O que realmente aconteceu
Evidências: Screenshots/Logs
```

**Passo 3: Submeter o Defeito**
```
- Clicar em "Novo Defeito"
- Preencher formulário
- Clicar em "Submeter"
- Compartilhar ID com equipe
```

### Como Testar Performance

**Medir Tempo de Carregamento:**
```
1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. Recarregar página
4. Observar tempo total (último item)
5. Registrar valor
```

**Verificar Uso de Recursos:**
```
1. Abrir DevTools (F12)
2. Ir para aba "Performance"
3. Clicar em "Record"
4. Executar ação
5. Clicar em "Stop"
6. Analisar gráfico
```

---

## 🛠️ Ferramentas de Teste

### Navegadores Suportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Ferramentas Recomendadas

| Ferramenta | Uso | Como Usar |
|-----------|-----|----------|
| **DevTools** | Inspecionar elementos | F12 |
| **Postman** | Testar API | [Importar collection] |
| **JMeter** | Teste de carga | [Executar script] |
| **Lighthouse** | Performance | DevTools → Lighthouse |

### Extensões Úteis

- **JSON Formatter**: Visualizar JSON
- **CSS Peeper**: Inspecionar estilos
- **Wappalyzer**: Identificar tecnologias

---

## 💡 Boas Práticas

### Antes de Testar

✅ Ler completamente o caso de teste
✅ Preparar dados de teste
✅ Verificar ambiente
✅ Limpar cache do navegador
✅ Usar dados de teste, não dados reais

### Durante o Teste

✅ Seguir passos exatamente como documentado
✅ Observar cuidadosamente o resultado
✅ Tirar screenshots de problemas
✅ Registrar tempo de execução
✅ Testar casos positivos E negativos

### Após o Teste

✅ Documentar resultado imediatamente
✅ Descrever defeitos com clareza
✅ Anexar evidências
✅ Notificar responsáveis
✅ Atualizar dashboard

### Comunicação

✅ Ser claro e conciso
✅ Usar termos técnicos apropriados
✅ Fornecer contexto suficiente
✅ Ser profissional e respeitoso
✅ Escalar problemas apropriadamente

---

## 🔧 Troubleshooting

### Problema: Página não carrega

**Solução:**
1. Limpar cache (Ctrl+Shift+Delete)
2. Recarregar página (Ctrl+R)
3. Tentar em navegador diferente
4. Verificar conexão de internet
5. Contatar suporte se persistir

### Problema: Login não funciona

**Solução:**
1. Verificar email/senha
2. Limpar cookies
3. Tentar navegador privado
4. Resetar senha se necessário
5. Contatar suporte

### Problema: Dados não salvam

**Solução:**
1. Verificar validação de formulário
2. Verificar conexão de internet
3. Tentar novamente
4. Limpar cache
5. Contatar suporte se persistir

### Problema: Performance lenta

**Solução:**
1. Fechar abas desnecessárias
2. Limpar cache
3. Desabilitar extensões
4. Testar em navegador diferente
5. Verificar conexão de internet

---

## ❓ Perguntas Frequentes

### P: Posso usar dados reais?
**R:** Não, sempre use dados de teste fornecidos. Dados reais podem comprometer a segurança.

### P: Quanto tempo leva cada teste?
**R:** Varia de 5 a 30 minutos dependendo da complexidade. Registre o tempo real.

### P: O que fazer se encontrar um bug?
**R:** Documente imediatamente com screenshots e passos para reproduzir. Submeta ticket de defeito.

### P: Preciso testar em todos os navegadores?
**R:** Sim, para testes críticos. Navegadores suportados: Chrome, Firefox, Safari, Edge.

### P: Posso modificar os dados de teste?
**R:** Sim, você pode criar novos dados de teste, mas não modifique dados de referência.

### P: Como reportar um problema com o ambiente?
**R:** Contate o líder de testes ou suporte TI imediatamente. Forneça detalhes do problema.

### P: Qual é o horário de suporte?
**R:** Suporte disponível de segunda a sexta, 8h-18h. Emergências: [Telefone].

### P: Posso compartilhar credenciais?
**R:** Não, cada testador tem suas credenciais. Nunca compartilhe senhas.

---

## 📞 Contatos Importantes

| Função | Nome | Email | Telefone |
|--------|------|-------|----------|
| Líder de Testes | [Nome] | [Email] | [Tel] |
| Suporte Técnico | [Nome] | [Email] | [Tel] |
| Gerente de Projeto | [Nome] | [Email] | [Tel] |
| Suporte de Aplicação | [Nome] | [Email] | [Tel] |

---

## 📚 Recursos Adicionais

- [Plano de UAT Completo](./UAT_PLAN.md)
- [Template de Execução](./UAT_TEST_EXECUTION_TEMPLATE.md)
- [Documentação da API](./docs/API.md)
- [README da Aplicação](./README.md)

---

## ✅ Checklist de Treinamento

- [ ] Assistiu apresentação da aplicação
- [ ] Fez login com sucesso
- [ ] Explorou todas as funcionalidades
- [ ] Criou um projeto de teste
- [ ] Registrou dados de teste
- [ ] Gerou um alerta
- [ ] Gerou um relatório
- [ ] Entendeu como reportar defeitos
- [ ] Conhece contatos de suporte
- [ ] Pronto para começar testes

---

**Versão**: 1.0.0 | **Data**: Outubro 2025 | **Status**: Pronto para Uso

Desenvolvido com ❤️ para a Nestlé Brasil

