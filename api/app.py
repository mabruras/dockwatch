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

    print()
    result = [
        {
            'id': container.image.id.split(':')[-1],
            'image': get_image_name(container.image),
            'versions': get_image_versions(container.image)
        } for container in client.containers.list()
    ]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


@app.route('/images/<img_id>', methods=['GET'])
@cross_origin()
def get_app_versions(img_id):
    client = docker.from_env()

    result = [
        {
            'id': container.id,
            'name': container.name,
            'status': container.status,
            'labels': container.labels,
            'restarted': container.attrs.get('RestartCount', 0),
            'state': container.attrs.get('State', dict()),
            'created': container.attrs.get('Created', None),
        } for container in client.containers.list()
        if img_id in container.image.id
    ]

    client.close()
    return Response(
        response=json.dumps(result),
        mimetype='application/json',
        status=200,
    )


def get_image_name(img):
    return img.tags[0].split(':')[0]


def get_image_versions(img):
    return [t.split(':')[-1] for t in img.tags]


if __name__ == '__main__':
    cors = CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin'

    app.run(host='0.0.0.0')
