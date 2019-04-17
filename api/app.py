#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

from flask import Flask, Response, stream_with_context
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


@app.route('/api/ips', methods=['GET'])
def get_known_ips():
    ip_list = {
        'ips': list(con.get_known_ips())
    }

    return response((ip_list, 200))


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


@app.route('/api/images/<app_name>/containers/<con_name>', methods=['GET'])
@cross_origin()
def get_container_info(app_name, con_name):
    result = api.get_container_info(app_name, con_name)
    return response(result)


@app.route('/api/images/<app_name>/containers/<con_name>/restart', methods=['POST'])
@cross_origin()
def restart_container(app_name, con_name):
    result = api.restart_container(app_name, con_name)
    return response(result)


@app.route('/api/images/<app_name>/containers/<con_name>/delete', methods=['DELETE'])
@cross_origin()
def remove_container(app_name, con_name):
    result = api.remove_container(app_name, con_name)
    return response(result)


@app.route('/api/images/<app_name>/containers/<con_name>/logs', methods=['GET'])
def get_container_logs(app_name, con_name):
    result, code = api.get_container_logs(app_name, con_name)

    if code == 200:
        return Response(result(), mimetype='event/stream-text')
    if code == 301:
        return Response(stream_with_context(result()), mimetype='event/stream-text')

    return response((result, code))


def response(result):
    val, code = result
    if 200 <= code < 300:
        return ok_response(val)
    else:
        return err_response(val, code)


def err_response(err, code):
    return Response(
        response=json.dumps(err),
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
        con.init_multi_mode()


if __name__ == '__main__':
    configure()
    app.run(host='0.0.0.0', port=DW_PORT)
