#! /usr/bin/python3
import os

from flask import send_from_directory


def get_static_files(path):
    print(f'Path: {path}')
    if path != "" and os.path.exists(f'react_app/{path}'):
        print(f'Accessing path: {path}')
        return send_from_directory('../web', path)
    else:
        print(f'Accessing default: {os.path.curdir}/../web/index.html')
        return send_from_directory('../web', 'index.html')
