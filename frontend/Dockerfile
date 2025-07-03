FROM node:20-slim AS build

WORKDIR /frontend

COPY package.json .

RUN npm i @rollup/rollup-linux-x64-gnu

RUN npm i

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
