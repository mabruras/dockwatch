#! /usr/bin/env python3
import json
import os

from flask import Flask, Response
from flask_cors import CORS, cross_origin

from endpoints import docker_api as api
from endpoints import static_web as web

from tools import dw_connect as con

DW_PORT = os.environ.get('DW_PORT', 1609)

DW_MODE_MULTI = 'multi'
DW_MODE_SINGLE = 'single'
DW_MODE = os.environ.get('DW_MODE', DW_MODE_SINGLE)

app = Flask(__name__, static_folder='../web/static')
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
    return web.get_static_files(path)


@app.route('/api/images', methods=['GET'])
@cross_origin()
def get_applications():
    result = api.get_images()
    return response(result)


@app.route('/api/images/<app_name>/containers', methods=['GET'])
@cross_origin()
def get_app_versions(app_name):
    result = api.get_containers(app_name)
    return response(result)


@app.route('/api/containers/<con_id>', methods=['GET'])
@cross_origin()
def get_container_info(con_id):
    result = api.get_container_info(con_id)
    return response(result)


@app.route('/api/containers/<con_id>/restart', methods=['POST'])
@cross_origin()
def restart_container(con_id):
    result = api.restart_container(con_id)
    return response(result)


@app.route('/api/containers/<con_id>/delete', methods=['DELETE'])
@cross_origin()
def remove_container(con_id):
    result = api.remove_container(con_id)
    return response(result)


@app.route('/api/containers/<con_id>/logs', methods=['GET'])
def get_container_logs(con_id):
    generator = api.get_container_logs(con_id)
    return Response(generator(), mimetype='event/stream-text')


def response(result):
    val, code = result
    if 200 <= code < 300:
        return ok_response(val)
    else:
        return err_response(val, code)


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


def configure():
    if DW_MODE == DW_MODE_MULTI:
        print('Initializing broadcast listener')
        con.start_broadcast_listener()
        print('Initializing first broadcast')
        con.broadcast_ip()


if __name__ == '__main__':
    configure()
    app.run(host='0.0.0.0', port=DW_PORT)
