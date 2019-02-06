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
```bash
docker build -t mabruras/dock-watch-api
docker build -t mabruras/dock-watch-web
```

## Deploy
```bash
docker run -d \
  -p 5000:5000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  mabruras/dock-watch-api

docker run -d \
  -p 3000:3000 \
  mabruras/dock-watch-web
```

## Example setup

### Prerequisites
* SCM (eg. Git w/`Github`)
* CI-tool (eg. `Concourse`)
* CD-tool (eg. `Rundeck`)
* Proxy (eg. `Traefik`)
* DockWatch

### Flow
#### SCM
(_Source Control Management_)

Make commits to the SCM, independent of branch,
trigger the CI-tool through use of git-hooks.

#### CI
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

#### CD
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

#### Proxy
With `TræfIk`/traefik, you'll be able to auto detect
your Docker containers, and create routes to each container.

So optimal, the earlier example will result in the following accessible URL:
`https://awesome-app-feature-aa-123-implement-stuff.dev.example.com`

#### DockWatch
DockWatch API will be running on each of the nodes,
with a DockWatch Web container at it's side.

The DockWatch Web is exposed through Traefik 
(`--label "traefik.frontend.rule='Host: dw.dev.example.com'"`)
to easily access the DockWatch panel.
