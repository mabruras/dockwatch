#! /usr/bin/env python3
# -*- coding: utf-8 -*-
import ast
import os
import threading

import requests
from flask import request

from connectors import network as net, udp_connector as udp
from tools import cipher

TIMEOUT_SECONDS = 0.5

PROJECT_DIR = os.environ.get('WRK_DIR', '.')
CONFIG_DIR = f'{PROJECT_DIR}{os.sep}conf'
IP_LIST_FILE = f'{CONFIG_DIR}{os.sep}ip.list'

SECRET = os.environ.get('DW_SECRET', '')
DW_GROUP = os.environ.get('DW_GROUP', 'dw_default')


def init_multi_mode():
    print('Initializing broadcast listener')
    threading.Thread(
        name='Broadcast Listener',
        target=start_broadcast_listener
    ).start()

    print('Initializing broadcaster')
    threading.Thread(
        name='Message Broadcaster',
        target=broadcast_known_ips
    ).start()


def broadcast_known_ips():
    # Start broadcasting known IPs to other instances
    while True:
        ip_list = {'ip_list': get_known_ips()}
        encrypted = cipher.encrypt_message(f'{ip_list}', SECRET)
        out = bytes(str({DW_GROUP: encrypted}), 'utf-8')

        broadcast_addr = net.get_broadcast_addr()
        udp.broadcast_message(out, broadcast_addr)


def start_broadcast_listener():
    # Start a listener for broadcasts, in a background thread.
    while True:
        broadcast_addr = net.get_broadcast_addr()

        udp.broadcast_listener(broadcast_addr, update_known_ips)


def update_known_ips(data):
    msg, sender = data
    msg = str(msg, 'utf-8')
    msg = ast.literal_eval(msg)

    received = msg.get(DW_GROUP, None)
    if not received:
        print(f'Received broadcast was not intended for this DockWatch. Sender: {sender}')
        return
    print(f'RECEIVED : {received}')

    ip_list = cipher.decrypt_message(received, SECRET)
    print(f'IP LIST : {ip_list}')
    print(f'IP LIST (type) : {type(ip_list)}')

    decrypted = ast.literal_eval(ip_list).get('ip_list', None)
    print(f'DECRYPTED : {decrypted}')
    if not decrypted:
        print(f'Could not decrypt broadcast. Sender: {sender}')
        return

    # Merge senders IP list with current instance IP list
    total = {ip for ip in list(decrypted) + list(get_known_ips())}
    write_ips_to_file(total)


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
        get_ips_from_remote(ip) for ip in [
            i for i in get_known_ips() if i != net.get_ip_addr()
        ]
    ] for item in sublist
    }


def get_ips_from_remote(host):
    try:
        # TODO: Remove hardcoded port - maybe include in ip.list file?
        return requests.get(f'http://{host}:1609/api/ips', timeout=TIMEOUT_SECONDS).json().get('ips')
    except Exception as e:
        print(f'Fetching IP list from host {host} failed!')
        print(e)
        return []


def forward_request(forward_ips, result):
    print(f'Forwarding requests to all known external instances')
    thread_pool = [
        threading.Thread(target=forward, args=[
            f'{ip}', f'{request.path}', request.method, request.remote_addr, result
        ]) for ip in forward_ips if ip != net.get_ip_addr()
    ]

    [t.start() for t in thread_pool]
    [t.join() for t in thread_pool]
    print(f'Result from external instances: {result}')


def forward(host, path, method, req_ip, result_list):
    # TODO: Remove hardcoded port - maybe include in ip.list file?
    url = f'http://{host}:1609{path}'
    headers = {'X-Forwarded-For': req_ip}
    print(f'Forwarding request on behalf of {req_ip}, to {url}')

    try:
        res = requests.request(method, url, headers=headers, timeout=TIMEOUT_SECONDS)
        print(f'Forwarding completed with data response: {res.json()}')

        status = res.status_code
        res_data = res.json()
    except Exception as e:
        err = f'Forwarding to host {host} failed!'
        print(err)
        print(e)

        status = 500
        res_data = err

    extract_result(host, status, res_data, result_list)


def remote_logs(host):
    url = f'http://{host}:1609{request.path}'
    headers = {'X-Forwarded-For': request.remote_addr}
    resp = requests.get(url, headers=headers, stream=True)

    return resp.iter_content


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
