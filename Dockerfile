FROM NODE::12-alpine

WORKDIR /app

COPY package.json ./

RUN YARN 

COPY . . 

EXPOSE 3333

CMD ['yarn', 'start']