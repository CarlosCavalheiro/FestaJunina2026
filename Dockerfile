FROM node:20-alpine AS build
WORKDIR /dist
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /dist /usr/share/nginx/html
# Se estiver usando React Router, adicione a configuração do nginx para SPA:
COPY --from=build /dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]