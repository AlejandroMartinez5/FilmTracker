FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 50051
EXPOSE 3010

CMD ["npm", "start"]
