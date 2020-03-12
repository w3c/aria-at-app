FROM node:lts
RUN apt-get update && apt-get install -y yarn

# Create app directory
WORKDIR /usr/src

COPY ./ ./
RUN yarn install
RUN yarn workspace client build

CMD [ "node", "index.js" ]