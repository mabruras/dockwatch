FROM            node:lts

ENV             WRK_DIR /opt/dock-watch-web
WORKDIR         ${WRK_DIR}

COPY            ./ ${WRK_DIR}/
RUN             npm install

EXPOSE          5000

CMD             [ "npm", "start" ]
