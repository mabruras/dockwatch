# DockWatch
A system for listing out your deployed containers on a specific node.
Should be running on the specific node.

## Why DockWatch
We do all have a full CI/CD setup, so what more do we need?

Since we've might have enabled the possibility
(_we do this in the **Example Setup** below_) to deploy from every
branch of each repository - it's necessary to keep track of
what is running on the nodes in each environment.

With the DockWatch running on each of the nodes in an environment, it's
possible to get an overview of all running containers on each node.

Through the UI it will be possible to interact with specific containers,
like delete, restart or access logs. Main focus should be to
clean up earlier deployments of feature branches etc.
that is not relevant anymore.

~~It is possible to configure each DockWatch to access
the other APIs of the other DockWatch instances.
This is done runtime, by adding a new Node with name,
API URL and other grouping tags~~
_Currently not implemented, WIP_


# Technology
DockWatch mainly consist of two components; **API** and **Web**.

Both systems are bundled, where Flask serves a React frontend,
as well as an API for interaction with the Docker engine.

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

## Build
It is possible to deploy either each of the components (API and Web)
standalone, even it should always be deployed as a single system. 
```bash
docker-compose build
```

## Deploy
You can either deploy a single instance of the API, which is
useful when planning to use a centralized DockWatch Web instance.
```bash
docker run -d \
  -p 5000:5000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  mabruras/dockwatch
```

If you want to deploy a DockWatch Web instance at the side of
the API, you can do so afterwards with the following,
or use Docker Compose.
```bash
docker run -d \
  -p 3000:3000 \
  -e "REACT_APP_API_URL=http://localhost:5000" \
  mabruras/dockwatch
```

### Environment Variables
#### API
| VARIABLE | EXAMPLE | DESCRIPTION |
| :------: | :-----: | :---------: |
| - | - | - |

#### Web
| VARIABLE | EXAMPLE | DESCRIPTION |
| -------- | ------- | ----------- |
| REACT_APP_API_URL | http://localhost:5000 | URL for where to access the DockWatch API |
| REACT_APP_URL_LBL | container.url | What label referring to the applications URL |

### Docker Compose
It's important to notice that the docker-compose file contains a
default to what API the Web instance is connecting towards; localhost.
To override the APIs default URL, you can set the `DOCK_WATCH_API`
environment variable being the address to the node running the API.
```bash
export DOCK_WATCH_API="http://api.example.com"
docker-compose up -d
```


### Internal Labels
Internal labels are those who DockWatch uses for execute extra,
custom or special logic, when detecting on a container.

#### Hidden containers
It's not everything that should be exposed to the users,
that's why a container can be hidden from DockWatch.
By default services like DockWatch should be hidden,
and should be labeled with `dockwatch.hidden=true`.


