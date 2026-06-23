FROM node:alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
EXPOSE 8080
CMD ["node", "dev-server.js"]
