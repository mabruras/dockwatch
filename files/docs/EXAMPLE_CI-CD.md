# CI / CD Example
This file is just an example of how a Continuous Integration/-Deployment
solution could be setup and used with DockWatch.

## Disclaimer
_Usage depends on the setup of you development flow.
DockWatch is not recommended to be used in a production environment,
since it lets users with access to the Web and API interact directly
with the Docker containers for each node._

**As of now, there is no access control for either the components!**

## Setup
The following steps are based upon a personal setup I've used earlier
to create a pipeline all the way from committing my code,
to the deployment of each branch on my personal server.

### Prerequisites
* SCM (eg. Git w/`Github`)
* CI-tool (eg. `Concourse`)
* CD-tool (eg. `Rundeck`)
* Registry (eg. `Docker Registry`)
* Proxy (eg. `Traefik`)
* DockWatch

### Flow
#### SCM
(_Source Control Management_)

Make commits to the SCM, independent of branch, and
let it trigger the CI-tool through use of git-hooks.

#### CI
(_Continuous Integration_)

Let the CI-tool Build/compile, or what ever the application/system requires,
before it wraps the application up in a Docker image and pushed to Docker Registry.

A good practice could be to use the following syntax for the docker image tags:
`${DCKR_REG}/${APP_NAME}:${BRANCH_NAME}`

Based on the following details (personal preference):
* Application name: `Awesome App`
* Registry url: `registry.example.com`
* Issue tracker reference: `AA-123`
* Branch name: `feature/AA-123`

It's possible to create a setup like this:
```bash
DCKR_REG="registry.example.com"                     # Could be stored in the CI-tool
APP_NAME="awesome-app"                              # Defined by the current pipeline
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

_**TIP:** There could be a parameterized hook to auto trigger deployment to development environments_

#### CD
(_Continuous Deployment_)

After building the Docker image, push it to the registry, and the CI-tool should take over.

`Rundeck` makes it possible to access one or more nodes, where it can be executed commands.
Parameters should be:
* `Application`
* `Version`
* `Environment` # Used to decide what nodes to access
* `Registry` # If you have multiple Docker Registries

Example:
```bash
IMG_REF="${REGISTRY}/${APPLICATION}:${VERSION}"

docker run -d \
  --label "container.url=${APPLICATION}-${VERSION}.dev.example.com" \
  --name "${APPLICATION}-${VERSION}" \
  ${IMG_REF}
``` 

In this case, the `"${APPLICATION}-${VERSION}"` is representing the sub-domain,
dependent on the Traefik configuration.
So make sure `"${APPLICATION}-${VERSION}"` is "URL-friendly".

When deploying, remember to include all necessary environment labels.
Each label you add, will be available through DockWatch,
and will let you modify the frontend based upon the labels.

Example labels:
* `environment=dev` # _Should be changed to actual environment_
* `container.url=app1.dev.example.com` # _Dependent on Traefik setup,
container name (`app1` in this case) could represent the sub domain_

Because of the Traefik configuration will use `Host`-header for routing,
we'll use the Traefik host prefixed with the container name as a `container.url`-label.
This will make DockWatch create an URL on the specific container,
and easily let users access the running application through the UI.

To avoid DockWatch to expose details about specific containers,
it's possible to add `dockwatch.hidden=True` as a label.
DockWatch will not expose containers marked with this `hidden`-label.

#### Proxy
With `TræfIk`/traefik, you'll be able to auto detect
your Docker containers, and create routes to each container.

The earlier example will result in the following accessible URL:
`https://awesome-app-feature-aa-123-implement-stuff.dev.example.com`

#### DockWatch
DockWatch will be running on each of the nodes, with a UI to interact with containers.

This way you can watch every container on the node,
shut down old ones and restart them if needed.
