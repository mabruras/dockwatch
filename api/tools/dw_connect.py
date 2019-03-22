#! /usr/bin/env python3
import os
import threading

from connectors import network as net, udp_connector as udp
from tools import cipher

PROJECT_DIR = os.environ.get('WRK_DIR', '.')
CONFIG_DIR = f'{PROJECT_DIR}{os.sep}conf'
IP_LIST_FILE = f'{CONFIG_DIR}{os.sep}ip.list'

SECRET = os.environ.get('DW_SECRET', '')


def broadcast_ip():
    ip_list = ','.join(get_known_ips())
    out = cipher.encrypt_message(f'{ip_list}', SECRET)
    broadcast_addr = net.get_broadcast_addr()

    # Start broadcasting known IPs to other instances
    threading.Thread(target=udp.broadcast_message, args=[out, broadcast_addr, True]).start()


def start_broadcast_listener():
    broadcast_addr = net.get_broadcast_addr()

    # Start a listener for broadcasts, in a background thread.
    threading.Thread(target=udp.broadcast_listener, args=[broadcast_addr, update_known_ips]).start()


def update_known_ips(data):
    msg, sender = data
    ip_list = cipher.decrypt_message(msg, SECRET)

    # Merge senders IP list with current instance IP list
    ip_list = {ip_list}.union(get_known_ips())

    write_ips_to_file(ip_list)


def get_known_ips():
    verify_ip_list_file()
    with open(IP_LIST_FILE, 'r') as f:
        output = f.read().splitlines()

    return {net.get_ip_addr()}.union({o for o in output})


def write_ips_to_file(ip_list):
    print(ip_list)
    verify_ip_list_file()

    with open(IP_LIST_FILE, 'w') as f:
        f.write('\n'.join(ip_list))


def verify_ip_list_file():
    if not os.path.isfile(IP_LIST_FILE):
        if not os.path.exists(CONFIG_DIR):
            os.makedirs(CONFIG_DIR)
        open(IP_LIST_FILE, 'a').close()
