#! /usr/bin/python3
import os

from flask import send_from_directory


def get_static_files(path):
    print('Path: {}'.format(path))
    if path != "" and os.path.exists("react_app/{}".format(path)):
        print('Accessing path: {}'.format(path))
        return send_from_directory('../web', path)
    else:
        print('Accessing default: {}/../web/index.html'.format(os.path.curdir))
        return send_from_directory('../web', 'index.html')
