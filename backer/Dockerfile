FROM xiewulong/node:latest

RUN /usr/local/node/bin/npm i -g --registry=https://registry.npm.taobao.org cnpm npm@latest \
    && ln -sf /usr/local/node/bin/cnpm /usr/local/bin/cnpm \
    && ln -sf /usr/local/node/bin/npx /usr/local/bin/npx

VOLUME ["/app/logs"]

ENTRYPOINT []

ENV MUSIC_PORT 80
EXPOSE 80
CMD ["/usr/local/node/bin/npm", "run", "app"]

WORKDIR /app
ADD . .
RUN /usr/local/node/bin/cnpm i
