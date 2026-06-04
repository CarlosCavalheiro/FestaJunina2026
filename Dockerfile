FROM node:20-alpine AS build
# Alterado para /app para não conflitar com a pasta gerada pelo build do React
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
# Copia os arquivos gerados no build para a pasta pública do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Se o seu projeto utiliza React Router (SPA), remova o '#' da linha abaixo para copiar as regras de roteamento:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]