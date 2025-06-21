# Dockerfile
FROM node:20-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache curl

WORKDIR /app

# Copiar package files
COPY package*.json ./

FROM base AS dependencies

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

FROM base AS development

# Instalar todas as dependências (dev + prod)
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de desenvolvimento
CMD ["npm", "run", "start:dev"]

FROM base AS production

# Copiar dependências de produção
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Usuário não root
USER node

# Comando de produção
CMD ["node", "dist/main"]