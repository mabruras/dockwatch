# DockWatch
Application for listing deployed containers in a single- or multi node environment.

## What is DockWatch
**DockWatch** is a system for accessing an overview of
all deployed Docker containers in an environment.

By restricting which containers being visible and possible to interact with,
it's easy to let the developers manage the environments on their own.

As a contribution to a feature-branch deployment system, **DockWatch** will let
the developers see what versions of each application, is currently deployed.
It is possible to remove, restart and watch the logs of the containers.

DockWatch wants to highlight the importance of developer contribution towards the
application environments, by letting them take part in the deployment processes.

## Overview
When deploying multiple branches of each applications,
it's useful to get them grouped by the application name.
![Overview of deployments in DockWatch](files/images/overview.png)


# Usage

## Getting started
To just run the system, use the following command. Note that the `/var/run/docker.sock`
always should be mounted, to actually access the local docker engine.
```bash
docker run -v /var/run/docker.sock:/var/run/docker.sock mabruras/dockwatch
```

It's recommended to run DockWatch with the `hidden`-label, to avoid it discovering itself,
and denying users interacting with it's running state through the UI.
Make also sure to export the `1609`-port where the application is running.
```bash
docker run -d \
  -p 1609:1609 \
  -l "dockwatch.hidden=True" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  mabruras/dockwatch
```

## Environment Variables
Currently there isn't implemented use of a configuration file,
but options are available through environment variables.
Make sure that your deployment includes the necessary values by modifying these.

| VARIABLE | EXAMPLE | DESCRIPTION |
| :------: | :-----: | :---------: |
| DW_PORT | 8080 | What port DownWatch is running on (_default: 1609_) |
| REACT_APP_URL_LBL | app.url | What label referring to the applications URL (_default: container.url_) |
| LOG_READ_THRESHOLD | 120 | **Seconds** to hold each log stream open (_default: 300_) |

**[!]** Be careful with `LOG_READ_THRESHOLD`.
This value tells when to close a log stream, after accessing
a detailed page for a container, where the log is streamed.
Since closing the page will not close the open log stream server side,
there is implemented a timeout for the stream.
Hopefully this will be changed with a better solution down the road.

## Internal Labels
Internal labels are those who DockWatch uses for execute extra,
custom or special logic, when detecting on a container.

| LABEL | DESCRIPTION | VALUE |
| :---: | :---------: | :---: |
| dockwatch.hidden | Marks the container as hidden, and unavailable through DockWatch Web | `true` or `false` |
| dockwatch.restartable | Enable or disable the posibility to **restart** the container | `true` or `false` |
| dockwatch.removable | Enable or disable the possibility to **remove/delete** the container | `true` or `false` |

### Hidden
It's not everything that should be exposed to the users, that's why a container could be hidden from DockWatch.
It's recommended that services like DockWatch should be hidden by default.

### Restartable
Users are able to restart containers with this flag.
Do not use this label on containers that should not be restarted by the users.

### Removable
Users are able to remove containers with this flag.
The action of removing a container is not revertible - don't let users remove your critical containers.


# Technology
DockWatch mainly consist of two components; **API** and **Web**.

Both systems are bundled, where a Python Flask backend serves a React
frontend, as well as an API for interaction with the Docker engine.

## API
The API is a Python Flask service for querying the Docker engine,
on the node where it's deployed, as well as other nodes - if available.
It will return information about all running containers,
which image they are created of (including version tags),
and labels for both image and container, for each node available.

## Web
The Web component is created on the React JS framework, served as static files,
from the Flask server. It's responsible for presenting the API data from each node.


# Multiple nodes
By running DockWatch with `--net=host`, DockWatch is able to
autosync between instances within the same subnet.

They will share their own IP address, along with all other known IP addresses
from earlier broadcasts. Each broadcast will reach out to the other instances
to increase the possibility of each node knowing about each other.

When a user interacts with a container, the instance contacted will reach
out to all known DockWatch instances to perform the same action on each node.

It could be hard to read logs on multiple instances, so DockWatch
solves this by letting the user either select each node separately,
or in a multi windowed view - where it prefixes each line with the instance name.

DockWatch connects to other instances by broadcasting it's own position,
triggering all listening instances to do the same.
Each broadcast received is used to update its own configuration to keep
track of where each instance is running.

By regularly broadcasting the positions, it increases the chance of detecting
each other and keep up to date each API reference.

When interacting with a instance, it will start a sequence of similar API
calls to the rest of the instances. This lets the user known the status of
each instance.
