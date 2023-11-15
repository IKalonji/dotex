FROM node:16-alpine as node

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build --prod

FROM nginx:alpine

COPY --from=node /app/dist/cred-e /usr/share/nginx/html