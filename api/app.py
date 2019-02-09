#! /usr/bin/env python3
import json
import os

import docker
from flask import Flask, Response, send_from_directory
from flask_cors import CORS, cross_origin

app = Flask(__name__, static_folder='../web/build/static')
CORS(app, origins="*", allow_headers=[
    'Content-Type', 'Authorization', 'X-Requested-With',
    'Content-Length', 'Accept', 'Origin'
])


@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Headers'] = 'Content-Type'

    return response


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react(path):
    print('Path: {}'.format(path))
    if path != "" and os.path.exists("react_app/build/{}".format(path)):
        print('Accessing path: {}'.format(path))
        return send_from_directory('../web/build', path)
    else:
        print('Accessing default: {}../web/build/index.html'.format(os.path.curdir))
        return send_from_directory('../web/build', 'index.html')


@app.route('/api/images', methods=['GET'])
@cross_origin()
def get_applications():
    client = docker.from_env()

    images = dict()

    for con in get_valid_containers(client):
        try:
            img_name = get_image_name(con.image, only_app=True)
            if img_name not in images:
                images.update({
                    img_name: {
                        'image': {
                            'name': img_name.split('/')[-1],
                            'extra': img_name.split('/')[0:-1]
                        },
                        'status': dict(),
                        'containers': list(),
                    }
                })

            images[img_name]['containers'].append(get_container_version(con))

            # Updates total status counter
            # with each containers status
            statuses = images[img_name]['status']
            statuses.update({con.status: statuses.get(con.status, 0) + 1})
        except Exception as e:
            print('Could not include container: {}, when fetching image: {}'.format(con, img_name))
            print(e)

    result = [images[v] for v in images]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


@app.route('/api/images/<img_name>/containers', methods=['GET'])
@cross_origin()
def get_app_versions(img_name):
    client = docker.from_env()

    try:
        result = [
            extract_container_info(container) for container in get_valid_containers(client)
            if img_name in get_image_name(container.image)
        ]
    except Exception as e:
        print('Could not fetch containers for image {}'.format(img_name))
        print(e)

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


@app.route('/api/containers/<con_id>/restart', methods=['POST'])
@cross_origin()
def restart_container(con_id):
    client = docker.from_env()

    try:
        print('Restarting container with ID {}'.format(con_id))
        client.containers.get(con_id).restart()
    except docker.errors.APIError as e:
        print('Failed restarting container with ID {}: \n{}'.format(con_id, e))
        client.close()
        return Response(
            response=e,
            mimetype='text/plain',
            status=500,
        )

    print('Restart complete')
    client.close()
    return Response(
        response=json.dumps(dict()),
        mimetype='application/json',
        status=200,
    )


@app.route('/api/containers/<con_id>/delete', methods=['DELETE'])
@cross_origin()
def remove_container(con_id):
    client = docker.from_env()

    try:
        print('Removing container with ID {}'.format(con_id))
        client.containers.get(con_id).remove(force=True)
    except docker.errors.APIError as e:
        print('Failed removing container with ID {}: \n{}'.format(con_id, e))
        client.close()
        return Response(
            response=e,
            mimetype='text/plain',
            status=500,
        )

    print('Removal complete')
    client.close()
    return Response(
        response=json.dumps(dict()),
        mimetype='application/json',
        status=200,
    )


def get_valid_containers(client):
    return [
        con for con in client.containers.list(all=True)
        if not hidden_container(con) and not untagged_image(con.image)
    ]


def hidden_container(con):
    return con.labels.get('dockwatch.hidden', 'false').lower() != 'false'


def untagged_image(image):
    return not image.tags


def get_container_version(con):
    return {
        'id': con.id,
        'name': con.name,
        'image': {
            'id': con.image.id.split(':')[-1],
            'version': get_image_version(con.image),
        }
    }


def get_image_name(img, only_app=False):
    name = img.tags[0].split(':')[0]

    return name.split('/')[-1] if only_app else name


def get_image_version(img):
    return img.tags[0].split(':')[-1]


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


if __name__ == '__main__':
    app.run(host='0.0.0.0')
