#! /usr/bin/env python3
import os
import threading

import requests
from flask import request

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
    threading.Thread(
        name='Message Broadcaster',
        target=udp.broadcast_message,
        args=[out, broadcast_addr, True]
    ).start()


def start_broadcast_listener():
    broadcast_addr = net.get_broadcast_addr()

    # Start a listener for broadcasts, in a background thread.
    threading.Thread(
        name='Broadcast Listener',
        target=udp.broadcast_listener,
        args=[broadcast_addr, update_known_ips]
    ).start()


def update_known_ips(data):
    msg, sender = data
    ip_list = cipher.decrypt_message(msg, SECRET)

    # Merge senders IP list with current instance IP list
    ip_list = {ip for ip in ip_list.split(',') + list(get_known_ips())}

    write_ips_to_file(ip_list)


def get_known_ips():
    verify_ip_list_file()
    with open(IP_LIST_FILE, 'r') as f:
        output = f.read().splitlines()

    return {net.get_ip_addr()}.union({o for o in output})


def write_ips_to_file(ip_list):
    verify_ip_list_file()

    with open(IP_LIST_FILE, 'w') as f:
        f.write('\n'.join(ip_list))


def verify_ip_list_file():
    if not os.path.isfile(IP_LIST_FILE):
        if not os.path.exists(CONFIG_DIR):
            os.makedirs(CONFIG_DIR)
        open(IP_LIST_FILE, 'a').close()


def get_ips_from_external_instances():
    return {
        item for sublist in [
            # TODO: Remove hardcoded port - maybe include in ip.list file?
            requests.get(f'http://{ip}:1609/api/ips').json().get('ips') for ip in [
                i for i in get_known_ips() if i != net.get_ip_addr()
            ]
        ] for item in sublist
    }


def forward_request(forward_ips, result):
    thread_pool = [
        threading.Thread(target=forward, args=[
            f'{ip}', f'{request.path}', request.method, request.remote_addr, result
        ]) for ip in forward_ips if ip != net.get_ip_addr()
    ]

    [t.start() for t in thread_pool]
    [t.join() for t in thread_pool]


def forward(host, path, method, req_ip, result_list):
    # TODO: Remove hardcoded port - maybe include in ip.list file?
    url = f'http://{host}:1609{path}'
    headers = {'X-Forwarded-For': req_ip}
    print(f'Forwarding request on behalf of {req_ip}, to {url}')

    res = requests.request(method, url, headers=headers)
    print(f'Forwarding completed with data response: {res.json()}')

    extract_result(host, res.status_code, res.json(), result_list)


def extract_result(host, code, data, result_list):
    if 200 <= code < 300:
        result_list.append({
            'ip': host,
            'data': data
        })
    else:
        result_list.append({
            'ip': host,
            'error': data
        })
