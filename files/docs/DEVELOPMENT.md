# Development
When developing features it might be useful to avoid
building the Docker image for each little change.

There is a [`Docker Compose Dev`](../docker-compose.dev.yml)
for this purpose.

### First run
Before starting the Web and API, you must install some components.
The following command will execute `npm install` to download and
install all necessary dependencies into a `node_modules` directory.
```bash
docker-compose -f docker-compose.dev.yml run web-install
```

### Startup DockWatch
The following command depends on the `web-install` service to have been
executed, so the `node_modules` dir is available for the web application.
```bash
docker-compose -f docker-compose.dev.yml up web api
```

Unlike the Web component, you need to rebuild the API if it has any changes.
As of now, there isn't implemented any live-reload for the Flask application.
