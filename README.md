# URL Shortener API

## Sobre o Projeto
Este é um sistema de encurtamento de URLs desenvolvido com **Node.js** e **NestJS**, que permite:
- Criar URLs encurtadas com e sem autenticação
- Listar URLs associadas ao usuário autenticado
- Atualizar e excluir URLs (somente para o proprietário)
- Documentação automática via **Swagger**

## Tecnologias Utilizadas
- **Node.js**
- **NestJS**
- **TypeORM** (MySQL)
- **JWT para autenticação**
- **Docker e Docker Compose**
- **Jest para testes automatizados**

## Estrutura do Projeto
```
Open-Finance-main/
│-- src/
│   │-- auth/               # Módulo de autenticação
│   │-- urls/               # Módulo de encurtamento de URLs
│   │-- main.ts             # Arquivo principal de inicialização
│-- test/                   # Testes unitários e e2e
│-- docker-compose.yml      # Configuração do MySQL com Docker
│-- ormconfig.ts            # Configuração do banco de dados
│-- package.json            # Dependências e scripts
│-- README.md               # Documentação
```

## Requisitos
- Node.js 18+
- Docker e Docker Compose
- MySQL (caso não utilize o Docker)

## Instalação
```bash
git clone https://github.com/SrMedeirosJr/Open-Finance
cd Open-Finance
npm install
```

## Configuração
Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=url_shortener
JWT_SECRET=seu-segredo-aqui
```
Caso use Docker, os valores já estão configurados no `docker-compose.yml`.

### Configuração do `.env`
Copie o arquivo `.env.example` e renomeie para `.env` antes de rodar o projeto:
```bash
cp .env.example .env
```

## Rodando com Docker (Recomendado)
```bash
docker-compose up -d
```

Acesse a API em:
```
http://localhost:3000
```

Para gerenciar o banco de dados via interface, acesse:
```
http://localhost:8080
```
**Host:** `mysql` | **User:** `user` | **Senha:** `password`

## Executando as Migrations
Antes de rodar o projeto, é necessário aplicar as migrations no banco de dados:
```bash
npm run typeorm -- migration:run -d ./src/data-source.ts
```
Se estiver utilizando JavaScript após compilar:
```bash
npx typeorm migration:run -d ./dist/data-source.js
```

## Rodando o Projeto
```bash
npm run start:dev
```

## Endpoints Principais
Acesse a documentação completa via Swagger em:
```
http://localhost:3000/api
```

### Autenticação
- **POST /auth/register** → Criar novo usuário
- **POST /auth/login** → Autenticação com JWT

### 🔗 URLs Encurtadas
- **POST /urls** → Criar uma URL encurtada
- **GET /urls** → Listar URLs do usuário autenticado
- **GET /:shortUrl** → Redirecionamento para a URL original
- **PUT /:shortUrl** → Atualizar a URL original de um código encurtado
- **DELETE /urls/:id** → Remover uma URL (somente o dono pode excluir)

## Parando e reiniciando o Docker
Se precisar parar os containers:
```bash
docker-compose down
```

Se quiser resetar completamente os volumes do banco (Isso apagará os dados!):
```bash
docker-compose down -v
```
Depois, basta iniciar novamente:
```bash
docker-compose up -d
```

## Testes
```bash
npm run test
npm run test:e2e
```

## Licença
Este projeto está sob a licença MIT.

