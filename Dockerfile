FROM node:20-alpine AS build
WORKDIR /app

# 1. Copia o package.json principal
COPY package*.json ./

# 2. Copia os arquivos de configuração das subpastas primeiro (para aproveitar o cache do Docker)
COPY site/package*.json ./site/
COPY admin/package*.json ./admin/
COPY portaria/package*.json ./portaria/
COPY pesquisa/package*.json ./pesquisa/

# 3. Instala as dependências da raiz e de cada subprojeto
RUN npm install
RUN npm install --prefix site
RUN npm install --prefix admin
RUN npm install --prefix portaria
RUN npm install --prefix pesquisa

# 4. Copia o restante de todo o código fonte
COPY . .

# 5. Roda o build unificado (que agora vai encontrar o Vite em cada pasta!)
RUN npm run build

FROM nginx:alpine
# Copia os arquivos finais gerados para o servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]