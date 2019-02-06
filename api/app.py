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
        img_id = con.image.id.split(':')[-1]
        if img_id not in images:
            images.update({
                img_id: {
                    'id': img_id,
                    'image': get_image_name(con.image),
                    'versions': list()
                }
            })

        images[img_id]['versions'].append(get_container_version(con))

    result = [images[v] for v in images]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


@app.route('/images/<img_id>/containers', methods=['GET'])
@cross_origin()
def get_app_versions(img_id):
    client = docker.from_env()

    result = [
        extract_container_info(container) for container in client.containers.list()
        if img_id in container.image.id
    ]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


def get_container_version(con):
    return {
        'versions': {
            'name': con.name,
            'version': get_image_version(con.image),
        }
    }


def get_image_name(img):
    return img.tags[0].split(':')[0]


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
