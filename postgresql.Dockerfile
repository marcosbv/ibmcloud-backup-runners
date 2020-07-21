FROM node:alpine

RUN apk add postgresql

COPY package.json .

RUN npm install

COPY index.js .
COPY ./postgresql ./postgresql

CMD ["node", "index.js"]
