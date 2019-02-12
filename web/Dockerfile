FROM            node:lts

ENV             WRK_DIR /opt/dockwatch-web
WORKDIR         ${WRK_DIR}

COPY            ./ ${WRK_DIR}/
RUN             yarn install

EXPOSE          3000

CMD             [ "yarn", "start" ]
