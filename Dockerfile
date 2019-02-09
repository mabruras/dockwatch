FROM            node:lts

ENV             DW_HOME /opt/dockwatch


#               Python
WORKDIR         ${DW_HOME}/api
COPY            ./api .

RUN             apt-get update \
                  && apt-get install -y \
                    build-essential \
                    python3-pip \
                    python3-dev \
                  && rm -rf /var/lib/apt/lists/*
RUN             pip3 install \
                  flask-cors \
                  docker \
                  Flask


#               Node/React
WORKDIR         ${DW_HOME}/web
COPY            ./web .
RUN             yarn install \
                && yarn build \
                && npm install -g react-scripts \
                && react-scripts build


WORKDIR         ${DW_HOME}
CMD             [ "python3", "api/app.py" ]
