# URL Shortener

Um sistema completo de encurtamento de URLs com autenticação JWT, construído com NestJS, PostgreSQL e Docker.

## Funcionalidades

- Encurtamento de URLs público e autenticado
- Autenticação JWT com registro e login de usuários
- Estatísticas de cliques e métricas
- CRUD completo para gerenciamento de URLs por usuário
- Soft delete para preservação de dados
- Aliases personalizados para URLs
- Documentação completa com Swagger
- Testes unitários e E2E
- Ambiente Docker containerizado
- Pipeline CI/CD automatizado

## Tecnologias

- **Backend:** NestJS, TypeScript
- **Banco:** PostgreSQL, TypeORM
- **Cache:** Redis
- **Auth:** JWT, bcryptjs
- **Docs:** Swagger/OpenAPI
- **Testes:** Jest, Supertest
- **Container:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoramento:** Prometheus, Grafana

## Como Executar

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- Git

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/rafaelalmeidav/url-shortenerr.git
cd url-shortenerr

# 2. Subir ambiente com Docker
docker-compose up --build -d

# 3. Verificar se subiu corretamente
docker-compose logs -f app
```

### Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Subir apenas o banco
docker-compose up postgres redis -d

# 4. Executar aplicação
npm run start:dev
```

## Configuração

### Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=url_user
DB_PASSWORD=url_password_123
DB_DATABASE=url_shortener

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_123

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro

# App
NODE_ENV=development
PORT=3000

# Observability
ENABLE_LOGGING=true
ENABLE_METRICS=true
LOG_LEVEL=debug
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
| GET | `/my-urls` | Listar URLs do usuário | Sim |
| PUT | `/urls/:shortCode` | Atualizar URL | Sim |
| DELETE | `/urls/:shortCode` | Excluir URL | Sim |
| GET | `/stats/:shortCode` | Estatísticas da URL | Não |
| GET | `/:shortCode` | Redirecionar para URL original | Não |

## Documentação

Acesse a documentação interativa do Swagger:

```
http://localhost:3000/api/docs
```

## Testes

```bash
# Todos os testes
npm test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e

# Testes em modo watch
npm run test:watch
```

## Scripts Docker

```bash
# Subir ambiente completo
docker-compose up --build -d

# Ver logs
docker-compose logs -f app

# Parar ambiente
docker-compose down

# Limpar volumes (cuidado - apaga dados!)
docker-compose down -v

# Rebuild apenas da app
docker-compose up --build app

# Entrar no container
docker-compose exec app sh

# Conectar no PostgreSQL
docker-compose exec postgres psql -U url_user -d url_shortener
```

## Serviços Disponíveis

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| Swagger | http://localhost:3000/api/docs | - |
| PgAdmin | http://localhost:5050 | admin@urlshortener.com / admin123 |
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9090 | - |

## Exemplos de Uso

### Registrar usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "name": "João Silva",
    "password": "123456"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "123456"
  }'
```

### Encurtar URL (anônimo)

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.google.com"
  }'
```

### Encurtar URL (autenticado)

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "originalUrl": "https://www.github.com",
    "customAlias": "github"
  }'
```

### Listar URLs do usuário

```bash
curl -X GET http://localhost:3000/my-urls \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## Desenvolvimento

### Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── dto/             # Data Transfer Objects
│   ├── entities/        # Entidades do banco
│   ├── guards/          # Guards JWT
│   ├── strategies/      # Strategies Passport
│   └── *.service.ts     # Lógica de negócio
├── url/                 # Módulo de URLs
│   ├── dto/
│   ├── entities/
│   └── *.service.ts
├── database/            # Configuração do banco
└── main.ts             # Ponto de entrada
```

### Comandos Úteis

```bash
# Lint
npm run lint
npm run lint:fix

# Formatação
npm run format
npm run format:check

# Build
npm run build

# Produção
npm run start:prod
```

## CI/CD

O projeto possui pipeline automatizado com GitHub Actions:

- **Lint** - ESLint e Prettier
- **Testes** - Unitários e E2E com PostgreSQL
- **Build** - Aplicação e Docker
- **Deploy** - Automático em produção

## Arquitetura

### Fluxo de Dados

1. **Request** chega no Controller
2. **Guard** valida autenticação (se necessário)
3. **DTO** valida dados de entrada
4. **Service** processa lógica de negócio
5. **Repository** persiste no banco
6. **Response** retorna dados formatados

### Banco de Dados

```sql
-- Usuários
users (id, email, name, password, created_at, updated_at, deleted_at)

-- URLs
urls (id, original_url, short_code, clicks, user_id, created_at, updated_at, deleted_at)
```

## Pontos de Melhoria para Escala

### Horizontal Scaling

- **Load Balancer** - Nginx/HAProxy para distribuir requests
- **Redis Cluster** - Cache distribuído
- **Database Sharding** - Particionamento por região/usuário
- **CDN** - CloudFlare para redirecionamentos
- **Microserviços** - Separar auth e URL shortening

### Performance

- **Caching** - Redis para URLs frequentes
- **Database Indexing** - Índices em short_code e user_id
- **Connection Pooling** - Pool de conexões otimizado
- **Rate Limiting** - Proteção contra abuse
- **Async Processing** - Queue para analytics

### Observability

- **Logs** - Estruturados com correlation IDs
- **Metrics** - Prometheus/Grafana
- **Tracing** - Jaeger/OpenTelemetry
- **Alerting** - Alertmanager
- **Health Checks** - Kubernetes probes

### Desafios de Escala

1. **Collision Detection** - Short codes únicos em escala
2. **Hot Partitioning** - URLs virais sobrecarregando shards
3. **Analytics** - Processamento de bilhões de cliques
4. **Global Distribution** - Latência em diferentes regiões
5. **URL Expiration** - Limpeza de URLs antigas
6. **Security** - Rate limiting e proteção DDoS

## Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## Autor

Rafael Almeida - [GitHub](https://github.com/rafaelalmeidav)