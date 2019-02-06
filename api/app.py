#! /usr/bin/env python3
import json

import docker
from flask import Flask, Response
from flask_cors import CORS, cross_origin

app = Flask(__name__)


@app.route('/images', methods=['GET'])
@cross_origin()
def get_applications():
    client = docker.from_env()

    images = dict()

    for con in client.containers.list():
        img_name = get_image_name(con.image)
        if img_name not in images:
            images.update({
                img_name: {
                    'image': img_name,
                    'containers': list()
                }
            })

        images[img_name]['containers'].append(get_container_version(con))

    result = [images[v] for v in images]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


@app.route('/images/<img_name>/containers', methods=['GET'])
@cross_origin()
def get_app_versions(img_name):
    client = docker.from_env()

    print(f'getting versions for {img_name}')

    result = [
        extract_container_info(container) for container in client.containers.list()
        if img_name in get_image_name(container.image)
    ]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


@app.route('/containers/<con_id>/restart', methods=['POST'])
@cross_origin()
def restart_container(con_id):
    client = docker.from_env()

    try:
        print(f'Restarting container with ID {con_id}')
        client.containers.get(con_id).restart()
    except docker.errors.APIError as e:
        print(f'Failed restarting container with ID {con_id}: \n{e}')
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


@app.route('/containers/<con_id>/delete', methods=['DELETE'])
@cross_origin()
def remove_container(con_id):
    client = docker.from_env()

    try:
        print(f'Removing container with ID {con_id}')
        client.containers.get(con_id).remove(force=True)
    except docker.errors.APIError as e:
        print(f'Failed removing container with ID {con_id}: \n{e}')
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


def get_container_version(con):
    return {
        'id': con.id,
        'name': con.name,
        'image': {
            'id': con.image.id.split(':')[-1],
            'version': get_image_version(con.image),
        }
    }


def get_image_name(img):
    return img.tags[0].split(':')[0].replace('/', '-')


def get_image_version(img):
    return img.tags[0].split(':')[-1]


def extract_container_info(container):
    return {
        'id': container.id,
        'name': container.name,
        'image': {
            'id': container.image.id.split(':')[-1],
            'name': get_image_name(container.image)
        },
        'created': container.attrs.get('Created', None),
        'status': container.status,
        'labels': container.labels,
        'restarted': container.attrs.get('RestartCount', 0),
        'state': container.attrs.get('State', dict()),
    }


if __name__ == '__main__':
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin'

    app.run(host='0.0.0.0', port=8000)
