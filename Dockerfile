FROM            node:lts-alpine

ENV             DW_HOME /opt/dockwatch


#               Python
WORKDIR         ${DW_HOME}/api
COPY            ./api .

RUN             apk update \
                  && apk add \
                    --no-cache \
                    python3 \
                  && python3 -m ensurepip \
                  && rm -r /usr/lib/python*/ensurepip

RUN             pip3 install \
                  flask-cors \
                  docker \
                  Flask \
                && rm -r /root/.cache


#               Yarn/NPM
WORKDIR         ${DW_HOME}/web
COPY            ./web .
RUN             yarn install \
                  && yarn --prod build \
                  && npm install -g react-scripts \
                  && react-scripts build


EXPOSE          1609
WORKDIR         ${DW_HOME}
CMD             [ "python3", "api/app.py" ]
