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
    return ok_response(result)


@app.route('/api/images/<img_name>/containers', methods=['GET'])
@cross_origin()
def get_app_versions(img_name):
    client = docker.from_env()

    try:
        result = [
            extract_container_info(container) for container in get_valid_containers(client)
            if img_name == get_image_name(container.image, only_app=True)
        ]
    except Exception as e:
        print('Could not fetch containers for image {}'.format(img_name))
        print(e)

    client.close()
    return ok_response(result)


@app.route('/api/containers/<con_id>', methods=['GET'])
@cross_origin()
def get_container_info(con_id):
    client = docker.from_env()

    container = next((extract_container_info(c) for c in get_valid_containers(client) if c.id == con_id), None)
    if not container:
        err = 'No container with id {} available'.format(con_id)
        print(err)
        return err_response(err, 400)

    client.close()
    return ok_response(container)


@app.route('/api/containers/<con_id>/restart', methods=['POST'])
@cross_origin()
def restart_container(con_id):
    client = docker.from_env()

    try:
        con = client.containers.get(con_id)
        if restartable_container(con):
            print('Restarting container with ID {}'.format(con_id))
            con.restart()
        else:
            err = 'Container ({}) not restartable'.format(con_id)
            print(err)

            client.close()
            return err_response(err, 400)
    except docker.errors.APIError as e:
        print('Failed restarting container with ID {}: \n{}'.format(con_id, e))
        client.close()
        return err_response(e, 500)

    print('Restart complete')
    client.close()
    return ok_response(dict())


@app.route('/api/containers/<con_id>/delete', methods=['DELETE'])
@cross_origin()
def remove_container(con_id):
    client = docker.from_env()

    try:
        con = client.containers.get(con_id)
        if removable_container(con):
            print('Removing container with ID {}'.format(con_id))
            client.containers.get(con_id).remove(force=True)
        else:
            err = 'Container ({}) not restartable'.format(con_id)
            print(err)

            client.close()
            return err_response(err, 400)
    except docker.errors.APIError as e:
        print('Failed removing container with ID {}: \n{}'.format(con_id, e))
        client.close()
        return err_response(e, 500)

    print('Removal complete')
    client.close()
    return ok_response(dict())


@app.route('/api/containers/<con_id>/logs', methods=['GET'])
def get_container_logs(con_id):
    def generate():
        client = docker.from_env()

        for row in client.containers.get(con_id).logs(stream=True, follow=True):
            yield row.decode("utf-8")
        client.close()

    return Response(generate(), mimetype='text/plain')


def err_response(err, code):
    return Response(
        response=json.dumps({'error': err}),
        mimetype='application/json',
        status=code,
    )


def ok_response(result):
    return Response(
        response=json.dumps(result),
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


def restartable_container(con):
    return con.labels.get('dockwatch.restartable', 'false').lower() == 'true'


def removable_container(con):
    return con.labels.get('dockwatch.removable', 'false').lower() == 'true'


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
    app.run(host='0.0.0.0', port=os.environ.get('DW_PORT', 1609))
