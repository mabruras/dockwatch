# Contribution
DockWatch is in need of help - if you have any feature requests or found any bugs,
please report them through the issues tracker, or create your own fix through a pull request :)


## Development
When developing features it might be useful to avoid re-building
both of the Docker images for each little change implemented.

Feel free to build the API and Web separately, but make sure to build
and test the full system before creating a pull request.

### Standalone Applications
It is possible to deploy either of the components (API and Web) standalone,
even though it's recommended to always be deployed as a complete system.

#### Build & Deploy
You can deploy a single instance of the API, which is
useful when planning to use a centralized DockWatch Web instance.
```bash
docker build -t mabruras/dockwatch-api api

docker run -d \
  -p 1609:1609 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  mabruras/dockwatch-api
```

```bash
docker build -t mabruras/dockwatch-web web

docker run -d \
  -p 3000:3000 \
  mabruras/dockwatch-web
```

#### Docker Compose
There is a [`Docker Compose`](../docker-compose.yml) file for this purpose.

##### First run
Before starting Web and API, you must install some dependencies.
The following command will execute `npm install` to download and
install all necessary dependencies into the `node_modules` directory.
```bash
docker-compose -f files/docker-compose.yml run web-install
```

##### Startup DockWatch
The following command depends on the `web-install` service to have been executed,
to make sure the `node_modules` dir is updated and available for the web application.
```bash
docker-compose -f files/docker-compose.yml up web api
```

Unlike the Web component, you need to restart the docker-compose command
to see changes done in the API-part of DockWatch.
As of now, there isn't implemented any live-reload for the Flask application.

The Web component will live reload when changes are done in the React part of DockWatch.
