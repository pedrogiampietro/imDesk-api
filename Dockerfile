# Estágio de construção
FROM node:latest AS build

WORKDIR /usr/app

COPY package.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:latest

WORKDIR /usr/app

COPY --from=build /usr/app/build ./build
COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/package.json ./

EXPOSE 3333

CMD ["npm", "run", "start"]