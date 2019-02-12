FROM            python:3.7

MAINTAINER      Brurås, Magnus <mabruraas@gmail.com>

ENV             WRK_DIR /opt/dockwatch-api

RUN             pip3 install \
                  flask-cors \
                  docker \
                  Flask

COPY            ./* ${WRK_DIR}/

WORKDIR         ${WRK_DIR}
EXPOSE          1609

CMD             [ "python", "app.py" ]
