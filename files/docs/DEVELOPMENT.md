# Contribution
DockWatch is in need of help - if you have any feature requests or found any bugs,
please report them through the issues tracker, or create your own fix :)


# Development
When developing features it might be useful to avoid
re-building the Docker images for each little change.

There is a [`Docker Compose Dev`](../docker-compose.dev.yml) file for this purpose.

### First run
Before starting Web and API, you must install some dependencies.
The following command will execute `npm install` to download and
install all necessary dependencies into the `node_modules` directory.
```bash
docker-compose -f files/docker-compose.dev.yml run web-install
```

### Startup DockWatch
The following command depends on the `web-install` service to have been executed,
to make sure the `node_modules` dir is updated and available for the web application.
```bash
docker-compose -f files/docker-compose.dev.yml up web api redis
```

Unlike the Web component, you need to restart the docker-compose command
to see changes done in the API-part of DockWatch.
As of now, there isn't implemented any live-reload for the Flask application.

The Web component will live reload when changes are done in the React part of DockWatch.
