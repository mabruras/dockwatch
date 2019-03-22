#! /usr/bin/env python3
import os
import time

import docker

# Added a default threshold to close Docker client, until
# a more permanent solution is found (not prioritized atm)
LOG_READ_THRESHOLD = os.environ.get('LOG_READ_THRESHOLD', 300)


def closeable_client(func):
    def inner(*args):
        client = docker.from_env()
        result = func(client, *args)
        client.close()

        return result

    return inner


@closeable_client
def get_images(client):
    images = dict()

    for con in get_valid_containers(client):
        try:
            img_name = get_image_name(con.image, only_app=True)
            if img_name not in images:
                images.update(append_image_info(img_name))

            images[img_name]['containers'].append(get_container_version(con))

            # Updates total status counter with each containers status
            statuses = images[img_name]['status']
            statuses.update({con.status: statuses.get(con.status, 0) + 1})
        except Exception as e:
            print(f'Could not include container: {con}, when fetching image: {img_name}')
            print(e)

    # Removes the image name as key in the dict,
    # that was used to gather images with similar names,
    # and creates a list of all the images.
    result = [images[v] for v in images]

    return result, 200


@closeable_client
def get_containers(client, image):
    try:
        result = [
            extract_container_info(container) for container in get_valid_containers(client)
            if image == get_image_name(container.image, only_app=True)
        ]
        return result, 200

    except Exception as e:
        err = f'Could not fetch containers for image {image}'
        print(err)
        print(e)
        return err, 500


@closeable_client
def get_container_info(client, con_id):
    container = next((extract_container_info(c) for c in get_valid_containers(client) if c.id == con_id), None)
    if not container:
        err = f'No container with id {con_id} available'
        print(err)
        return err, 400

    return container, 200


@closeable_client
def restart_container(client, con_id):
    try:
        con = client.containers.get(con_id)
        if restartable_container(con):
            print(f'Restarting container with ID {con_id}')
            con.restart()

            print('Restart complete')
            return dict(), 200
        else:
            err = f'Container ({con_id}) not restartable'
            print(err)

            return err, 400

    except docker.errors.APIError as e:
        print(f'Failed restarting container with ID {con_id}: \n{e}')
        return e, 500


@closeable_client
def remove_container(client, con_id):
    try:
        con = client.containers.get(con_id)
        if removable_container(con):
            print(f'Removing container with ID {con_id}')
            client.containers.get(con_id).remove(force=True)

            print('Removal complete')
            return dict(), 200
        else:
            err = f'Container ({con_id}) not restartable'
            print(err)

            return err, 400
    except docker.errors.APIError as e:
        print(f'Failed removing container with ID {con_id}: \n{e}')
        return e, 500


def get_container_logs(con_id):
    @closeable_client
    def generate(client):
        started = time_now()
        print(f'Opening log stream for container {con_id}')

        for row in client.containers.get(con_id).logs(stream=True):
            if (time_now() - started) > LOG_READ_THRESHOLD:
                print('Log reading threshold reached')
                break
            yield row.decode("utf-8")
        print(f'Closing stream of container logs (id: {con_id})')

    return generate


def time_now():
    return int(round(time.time() * 1000)) / 1000


####################
# Helper functions #
####################
def get_valid_containers(client):
    return [
        con for con in client.containers.list(all=True)
        if not hidden_container(con) and not untagged_image(con.image)
    ]


def hidden_container(con):
    return con.labels.get('dockwatch.hidden', 'false').lower() != 'false'


def restartable_container(con):
    return con.labels.get('dockwatch.restartable', 'false').lower() == 'true'


def removable_container(con):
    return con.labels.get('dockwatch.removable', 'false').lower() == 'true'


def untagged_image(image):
    return not image.tags


def get_image_name(img, only_app=False):
    name = img.tags[0].split(':')[0]

    return name.split('/')[-1] if only_app else name


def get_image_version(img):
    return img.tags[0].split(':')[-1]


def get_container_version(con):
    return {
        'id': con.id,
        'name': con.name,
        'image': {
            'id': con.image.id.split(':')[-1],
            'version': get_image_version(con.image),
        }
    }


def append_image_info(img_name):
    return {
        img_name: {
            'image': {
                'name': img_name.split('/')[-1],
                'extra': img_name.split('/')[0:-1]
            },
            'status': dict(),
            'containers': list(),
        }
    }


def extract_container_info(container):
    return {
        'id': container.id,
        'name': container.name,
        'image': {
            'id': container.image.id.split(':')[-1],
            'name': get_image_name(container.image),
            'version': get_image_version(container.image),
        },
        'created': container.attrs.get('Created', None),
        'status': container.status,
        'labels': container.labels,
        'restarted': container.attrs.get('RestartCount', 0),
        'state': container.attrs.get('State', dict()),
    }
