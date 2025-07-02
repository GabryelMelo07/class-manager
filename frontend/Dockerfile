FROM node:20-alpine AS build

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
