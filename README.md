# DockWatch
A system for listing out your deployed containers on a specific node.
Should be running on the specific node.

## Why DockWatch
We do all have a full CI/CD setup, so what more do we need?

Since we've might have enabled the possibility
(_we do this in the **Example Setup** below_) to deploy from every
branch of each repository - it's necessary to keep track of
what is running on the nodes in each environment.

With the DockWatch API running on each of the nodes,
the DockWatch Web can list out each version of each application deployed.

Through the Web component it will be possible to delete specific containers,
when you feel to clean up earlier mess.

### DockWatch pair
The API does not necessarily need to be exposed outside the node,
if you deploy the API and the Web containers side-by-side on each node.
This will let you access a specific node and watch and/or clean up old deployments.

### Central DockWatch Web
Instead of having multiple access points for watching your deployments,
it's possible to deploy one single instance of DockWatch Web and
applying DockWatch API references in the Web UI.


## Internal Labels
Internal labels are those who DockWatch uses for execute extra,
custom or special logic, when detecting on a container.

### Hidden containers
It's not everything that should be exposed to the users,
that's why a container can be hidden from DockWatch.
By default services like DockWatch should be hidden,
and should be labeled with `dockwatch.hidden=true`.


# Components
System consist of two components, API and Web.

### API
Python Flask service for querying the docker engine.
The API will return information about which images has deployed
containers, what versions of each image that has containers,
and the state of the containers.

The API should always be running on the respective node.

### Web
DockWatch Web is a frontend for presenting the deployed containers
on one or multiple nodes.

The Web component should either be a central service,
connected towards each API, or a single instance for each API deployed.


# Usage

## Build
Build both components with Docker Compose.
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
  mabruras/dock-watch-api
```

If you want to deploy a DockWatch Web instance at the side of
the API, you can do so afterwards with the following,
or use Docker Compose.
```bash
docker run -d \
  -p 3000:3000 \
  -e "REACT_APP_API_URL=http://localhost:5000" \
  mabruras/dock-watch-web
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
| REACT_APP_URL_LBL | traefik.frontend.rule | What label referring to the applications URL |

### Docker Compose
It's important to notice that the docker-compose file contains a
default to what API the Web instance is connecting towards; localhost.
To override the APIs default URL, you can set the `DOCK_WATCH_API`
environment variable being the address to the node running the API.
```bash
export DOCK_WATCH_API="http://api.example.com"
docker-compose up -d
```


## Development
When developing features it might be useful to avoid
building the Docker image for each little change.

There is a [`Docker Compose Dev`](./docker-compose.dev.yml)
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


## Setup
Usage depends on the setup of you development flow.
DockWatch is not recommended to be used in a production environment,
since it lets users with access to the Web and API interact directly
with the Docker containers for each node.

**As of now, there is no access control for either the components!**

### Example setup
The following steps are personal tips/preferences for
creating a pipeline from committing code, to the deploy. 

#### Prerequisites
* SCM (eg. Git w/`Github`)
* CI-tool (eg. `Concourse`)
* CD-tool (eg. `Rundeck`)
* Proxy (eg. `Traefik`)
* DockWatch

#### Flow
##### SCM
(_Source Control Management_)

Make commits to the SCM, independent of branch,
trigger the CI-tool through use of git-hooks.

##### CI
(_Continuous Integration_)

Let the CI-tool Build/compile,
or what ever the application/system requires,
before it wraps the application up in a Docker image.

For best result, let the docker image tags be on the following syntax:
`${DCKR_REG}/${APP_NAME}:${BRANCH_NAME}`.

Based on the following details (personal preference): 
* Application name: `Awesome App`
* Registry url: `registry.example.com`
* Issue tracker reference: `AA-123`
* Branch name: `feature/AA-123`

It's possible to create a setup like this:
```bash
DCKR_REG="registry.example.com"                     # Could be stored in the CI-tool
APP_NAME="awesome-app"                              # Defined by the pipeline
GIT_BRANCH="feature/aa-123_implement-stuff"         # Should be fetched from either SCM or CI-tool
VERSION=$(echo ${GIT_BRANCH##origin/} | tr "/_" -)  # Replace / and _ with -, also remove "origin/"
                                                    # from the branch name (optional)
docker build -t ${DCKR_REG}/${APP_NAME}:${VERSION} ${PWD}

# Resulting in:
# registry.example.com/awesome-app:feature-aa-123-implement-stuff
```

Add desired labels when building the Docker image.
(All labels will be available through the API)

Example labels:
* `branch=${GIT_BRANCH}`
* `app_name=${APP_NAME}`
* `version=${VERSION}`

_**TIP:** There could be a parameterized hook to
auto trigger deployment to development environments_

##### CD
(_Continuous Deployment_)

After building the Docker image, push it to the registry,
and the CI-tool should take over.

`Rundeck` makes it possible to access one or more nodes,
where it can be executed commands.
Parameters should be:
* `Application`
* `Version`
* `Environment` # Used to decide what nodes to access
* `Registry` # If you have multiple Docker Registries

Example:
```bash
IMG_REF="${REGISTRY}/${APPLICATION}:${VERSION}"

docker run -d \
  --name "${APPLICATION}-${VERSION}" \
  ${IMG_REF}
``` 

In this case, the `"${APPLICATION}-${VERSION}"` is representing the sub-domain,
dependent on the Traefik configuration.
So make sure `"${APPLICATION}-${VERSION}"` is "URL-friendly".

When deploying, remember to include all necessary environment labels.
Each label you add, will be available through the DockWatch API,
and will let you modify the frontend based upon the labels.

Example labels:
* `environment=dev` # _Should be changed to actual environment_
* `url=app1.dev.example.com` # _Dependent on Traefik setup,
container name (`app1` in this case) could represent the sub domain_

##### Proxy
With `TræfIk`/traefik, you'll be able to auto detect
your Docker containers, and create routes to each container.

So optimal, the earlier example will result in the following accessible URL:
`https://awesome-app-feature-aa-123-implement-stuff.dev.example.com`

##### DockWatch
DockWatch API will be running on each of the nodes,
with a DockWatch Web container at it's side.

The DockWatch Web is exposed through Traefik 
(`--label "traefik.frontend.rule='Host: dw.dev.example.com'"`)
to easily access the DockWatch panel.
