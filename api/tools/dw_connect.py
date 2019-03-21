#! /usr/bin/env python3
import os
import threading

from connectors import network as net, udp_connector as udp
from tools import cipher

PROJECT_DIR = os.environ.get('WRK_DIR', '.')
CONFIG_DIR = f'{PROJECT_DIR}{os.sep}conf'
IP_LIST_FILE = f'{CONFIG_DIR}{os.sep}ip_list.csv'

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
    verify_ip_list_file()
    with open(IP_LIST_FILE, 'r') as f:
        output = f.readlines()

    return [o.split(';') for o in output]


def verify_ip_list_file():
    if not os.path.isfile(IP_LIST_FILE):
        if not os.path.exists(CONFIG_DIR):
            os.makedirs(CONFIG_DIR)
        open(IP_LIST_FILE, 'a').close()


def write_ips_to_file(ip_list):
    verify_ip_list_file()
    with open(IP_LIST_FILE, 'w+') as f:
        f.writelines(ip_list)
