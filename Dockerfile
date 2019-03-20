FROM            node:lts-alpine as node-build

WORKDIR         /usr/src/app
COPY            ./web /usr/src/app
RUN             yarn install \
                  && yarn --prod build \
                  && npm install -g react-scripts \
                  && react-scripts build

FROM            python:3.7
ENV             DW_HOME /opt/dockwatch

WORKDIR         ${DW_HOME}/api
COPY            ./api .
COPY            --from=node-build /usr/src/app/build ${DW_HOME}/web

RUN             pip3 install \
                  flask-cors \
                  pycrypto \
                  docker \
                  Flask \
                && rm -r /root/.cache

EXPOSE          1609
WORKDIR         ${DW_HOME}
CMD             [ "python3", "api/app.py" ]

