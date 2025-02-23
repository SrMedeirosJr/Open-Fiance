# 📌 Changelog

Todas as mudanças importantes deste projeto serão documentadas aqui.

## [1.0.0] - 2025-02-23
### 🚀 Features
- Implementação da API REST para encurtamento de URLs
- Autenticação de usuários com JWT
- Criação de URLs encurtadas para usuários autenticados e não autenticados
- Listagem de URLs associadas ao usuário autenticado
- Atualização e exclusão de URLs (somente para o proprietário da URL)
- Adicionado Swagger para documentação da API

### 🔧 Melhorias
- Mensagens de erro e sucesso centralizadas em helpers
- Validação de entrada para e-mails e URLs

### 🐞 Correções
- Ajuste no serviço de encurtamento para vincular corretamente usuários autenticados
- Corrigido erro no teste E2E para autenticação
- Removidas mensagens hardcoded no código

### 🧪 Testes
- Implementação de testes unitários e E2E
- Cobertura de testes para criação, edição, listagem e exclusão de URLs
- Configuração do GitHub Actions para testes automatizados

---

## Como utilizar
Este changelog segue o formato **Keep a Changelog** e a versão segue **Semantic Versioning** (MAJOR.MINOR.PATCH).

