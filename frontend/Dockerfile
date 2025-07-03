FROM node:20-slim AS build

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm i @rollup/rollup-linux-x64-gnu

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
