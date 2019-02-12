# DockWatch
An application for listing out your deployed containers on a specific node.

## Why DockWatch
We do all have a full CI/CD setup, so what more do we need?

Since we've might have enabled the possibility to deploy code from
every branch in each of the repositories - it's necessary to keep
track of what is running on all the nodes in each environment.

With the DockWatch running on each of the nodes in an environment, it's
possible to get an overview of all running containers on each node.

Through the UI it will be possible to interact with specific containers,
like delete, restart or access logs. Main focus should be to clean
up earlier deployments, of feature branches that is not relevant anymore.

~~It is possible to configure each DockWatch to access
the other APIs of the other DockWatch instances.
This is done runtime, by adding a new Node with name,
API URL and other grouping tags~~
_Currently not implemented, WIP_


# Technology
DockWatch mainly consist of two components; **API** and **Web**.

Both systems are bundled, where a Python Flask instance serves a React
frontend, as well as an API for interaction with the Docker engine.

~~̃It's not necessary to take use of the Web component for each node.
Because of the possibility to add other API URLs runtime~~

## API
The API is a Python Flask service for querying the docker engine,
on the node where it's deployed. It will return information about
all running containers, which image they are created of,
including version tags, and labels for both image and container.

### Web
The Web component is a React JS system, served as static files,
from the Flask server. It's responsible for presenting the API data
from one ~~or multiple~~ node~~s~~.


# Usage

## Getting started
To just run the system, use the following command. Note that the `/var/run/docker.sock`
always should be mounted, to actually access the local docker engine.
```bash
docker run -v /var/run/docker.sock:/var/run/docker.sock mabruras/dockwatch
```

It's recommended to run DockWatch with the `hidden`-label,
to avoid it discovering itself, and not being able shut it down through itself.
Make also sure to export the `1609`-port where the application is running.
```bash
docker run -d \
  -p 1609:1609 \
  -l "dockwatch.hidden=True" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  mabruras/dockwatch
```


## Standalone Applications
It is possible to deploy either of the components (API and Web) standalone,
even though it's recommended to always be deployed as a complete system.


### Deploy
You can deploy a single instance of the API, which is
useful when planning to use a centralized DockWatch Web instance.
```bash
docker build -t mabruras/dockwatch-api api

docker run -d \
  -p 1609:1609 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  mabruras/dockwatch-api
```

If there is deployed multiple singular APIs in the environment,
it might be useful to only deploy a singular Web instance, without any connected API.
When deploying a singular Web component,
make note of the `REACT_APP_API_URL` to override the default API URL.
~~There is also possible to manually add multiple other API references through the UI.~~
```bash
docker build -t mabruras/dockwatch-web web

docker run -d \
  -p 3000:3000 \
  -e "REACT_APP_API_URL=http://localhost:1609/api" \
  mabruras/dockwatch-web
```

### Environment Variables
Currently there isn't implemented use of a configuration file,
but options are available through environment variables.
Make sure that your deployment includes the necessary values by modifying these.

| VARIABLE | EXAMPLE | DESCRIPTION |
| :------: | :-----: | :---------: |
| DW_PORT | 8080 | What port DownWatch is running on (_default: 1609_) |
| REACT_APP_API_URL | http://localhost:1609/api | URL for where to access the DockWatch API |
| REACT_APP_URL_LBL | app.url | What label referring to the applications URL (_default: container.url_) |


### Internal Labels
Internal labels are those who DockWatch uses for execute extra,
custom or special logic, when detecting on a container.

#### Hidden containers
It's not everything that should be exposed to the users,
that's why a container can be hidden from DockWatch.
Services like DockWatch should by default be hidden,
and could be labeled with `dockwatch.hidden=true` to achieve this.


### Docker Compose
Instead of running each and every one of the components manually,
there is created Docker Compose files for handling this.
These files already are preconfigured with the recommended
labels and environment variables.

```bash
docker-compose -f files/docker-compose.yml build
docker-compose -f files/docker-compose.yml up -d
```

##### Override default environment variable
It's important to notice that the docker-compose file contains a
default to what API the Web instance is connecting towards; localhost.
To override the APIs default URL, you can set the `DOCK_WATCH_API`
environment variable being the address to the node running the API.

```bash
export DOCKWATCH_API="http://api.example.com"
docker-compose -f files/docker-compose.yml up -d
```
