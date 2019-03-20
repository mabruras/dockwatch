#! /usr/bin/env python3
import os
import threading

from tools import cipher

from connectors import network as net, udp_connector as udp, tcp_connector as tcp, http_connector as http

PROJECT_DIR = os.environ.get('WRK_DIR', '.')
CONFIG_DIR = f'{PROJECT_DIR}{os.sep}conf'

SECRET = os.environ.get('DW_SECRET', '')


def broadcast_ip():
    out = cipher.encrypt_message('MySecretMessage', SECRET)
    udp.broadcast_message(out, net.get_broadcast_addr())


def start_broadcast_listener():
    broadcast_addr = net.get_broadcast_addr()

    # Start a listener for broadcasts, in a background thread.
    threading.Thread(target=udp.broadcast_listener, args=[broadcast_addr, update_known_ips]).start()


def update_known_ips(data):
    msg, sender = data
    ip_list = cipher.decrypt_message(msg, SECRET)

    result = {x for x in get_known_ips()}
    result.union({x for x in ip_list.split(',')})

    write_ips_to_file(result)


def get_known_ips():
    file_path = f'{CONFIG_DIR}{os.sep}ip.json'
    mode = 'r' if os.path.exists(file_path) else 'w'

    with open(file_path, mode) as f:
        output = f.readlines()

    return [o.strip() for o in output]


def write_ips_to_file(ip_list):
    file_path = f'{CONFIG_DIR}{os.sep}ip.json'
    with open(file_path, 'w+') as f:
        f.writelines(ip_list)
