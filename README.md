# URL Shortener

Sistema de encurtamento de URLs com autenticação JWT, construído com NestJS e PostgreSQL.

## Funcionalidades

- Encurtamento de URLs público e autenticado
- Autenticação JWT com registro e login
- CRUD de URLs por usuário autenticado
- Contagem de cliques
- Soft delete de URLs
- Aliases personalizados
- Documentação Swagger
- Testes unitários
- Docker containerizado
- CI/CD com GitHub Actions

## Tecnologias

- **Backend:** NestJS, TypeScript
- **Banco:** PostgreSQL, TypeORM
- **Auth:** JWT, bcryptjs
- **Docs:** Swagger
- **Testes:** Jest
- **Container:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## Como Executar

### Com Docker (Recomendado)

```bash
# 1. Clonar repositório
git clone https://github.com/rafaelalmeidav/url-shortenerr.git
cd url-shortenerr

# 2. Subir ambiente
docker-compose up --build -d

# 3. Verificar logs
docker-compose logs -f app
```

### Local

```bash
# 1. Instalar dependências
npm install

# 2. Subir PostgreSQL
docker-compose up postgres -d

# 3. Configurar .env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=url_user
DB_PASSWORD=url_password_123
DB_DATABASE=url_shortener
JWT_SECRET=seu-jwt-secret
NODE_ENV=development

# 4. Executar
npm run start:dev
```

## Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar usuário | Não |
| POST | `/auth/login` | Login | Não |

### URLs

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/shorten` | Encurtar URL | Opcional |
| GET | `/my-urls` | Listar minhas URLs | Sim |
| PUT | `/urls/:shortCode` | Atualizar URL | Sim |
| DELETE | `/urls/:shortCode` | Excluir URL | Sim |
| GET | `/stats/:shortCode` | Ver estatísticas | Não |
| GET | `/:shortCode` | Redirecionar | Não |

## Acessos

- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/api/docs

## Exemplos

### Registrar usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "User",
    "password": "123456"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456"
  }'
```

### Encurtar URL

```bash
# Sem autenticação
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.google.com"}'

# Com autenticação
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "originalUrl": "https://www.github.com",
    "customAlias": "github"
  }'
```

### Listar minhas URLs

```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Comandos Docker

```bash
# Subir
docker-compose up --build -d

# Logs
docker-compose logs -f app

# Parar
docker-compose down

# Entrar no container
docker-compose exec app sh

# PostgreSQL
docker-compose exec postgres psql -U url_user -d url_shortener
```

## Testes

```bash
# Todos os testes
npm test

# Com coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Estrutura

```
src/
├── auth/                # Autenticação
│   ├── dto/
│   ├── entities/
│   ├── guards/
│   └── strategies/
├── url/                 # URLs
│   ├── dto/
│   ├── entities/
│   └── *.service.ts
└── database/           # Config banco
```

## Banco de Dados

```sql
-- Usuários
users (id, email, name, password, created_at, updated_at, deleted_at)

-- URLs  
urls (id, original_url, short_code, clicks, user_id, created_at, updated_at, deleted_at)
```

## Scripts

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Lint
npm run lint

# Testes
npm test
```