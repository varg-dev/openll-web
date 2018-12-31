FROM debian:stretch as builder

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    jekyll
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

WORKDIR /opt/website
COPY ./package.json /opt/website/package.json
RUN npm install
COPY . .
RUN npm run build

FROM nginx
RUN rm -rf /usr/share/nginx/html/*
COPY --from=0 /opt/website/_site /usr/share/nginx/html
