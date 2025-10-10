# Etapa 1: Build con Node
FROM node:18 AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx ng build --configuration production

# Renombrar index.csr.html a index.html para que nginx lo sirva por defecto
RUN mv dist/fronted-topicos/browser/index.csr.html dist/fronted-topicos/browser/index.html

# Etapa 2: Servidor nginx para producción
FROM nginx:alpine

# Limpia contenido default
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos estáticos build del frontend
COPY --from=build-stage /app/dist/fronted-topicos/browser /usr/share/nginx/html

# Copia la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
