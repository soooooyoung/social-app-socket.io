FROM node:16

RUN apt-get update && apt-get install -yq libgconf-2-4 locales
RUN localedef -f UTF-8 -i ko_KR ko_KR.UTF-8

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

# Create App directory
RUN mkdir -p /app
WORKDIR /app

# Create Log directory
RUN mkdir -p app/logs/

RUN mkdir -p app/tmp/



COPY . /app

# Install app dependencies

COPY package.json /app

COPY yarn.lock /app

RUN yarn install

# Bundle app source

RUN yarn build

EXPOSE 8080
CMD [ "yarn", "prod" ]
