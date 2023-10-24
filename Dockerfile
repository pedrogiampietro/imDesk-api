# Estágio de construção
FROM node:latest AS build

WORKDIR /usr/app

COPY package.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

ENV DATABASE_URL="postgresql://postgres:eGf-24E2bgEbFA45BgDB3-fb-C2-3E6e@viaduct.proxy.rlwy.net:55081/railway?schema=sample"

RUN npx prisma migrate deploy
RUN npm run create:seeds

COPY . .

RUN npm run build

# Estágio de produção
FROM node:latest

WORKDIR /usr/app

COPY --from=build /usr/app/build ./build
COPY --from=build /usr/app/node_modules ./node_modules
COPY --from=build /usr/app/package.json ./
COPY --from=build /usr/app/prisma ./prisma/

EXPOSE 3333

CMD ["npm", "run", "start"]
