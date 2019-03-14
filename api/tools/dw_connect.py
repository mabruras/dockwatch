#! /usr/bin/env python3
import os
import socket
import time
from socket import SOL_SOCKET, SO_REUSEADDR, SO_BROADCAST, AF_INET, SOCK_DGRAM

PROJECT_DIR = os.environ.get('WRK_DIR', '.')
CONFIG_DIR = f'{PROJECT_DIR}{os.sep}conf'

SECRET = os.environ.get('DW_SECRET', '')

BROADCAST_PORT = os.environ.get('DW_BROADCAST_PORT', '')
BROADCAST_DELAY = os.environ.get('DW_BROADCAST_DELAY_MINUTES', 30)


def encrypt_message(key, ip):
    # TODO
    # Hash the key
    # Encrypt IP with hashed key
    # Return as bytes (encode('utf-8'))
    return bytes()


def decrypt_message(key, msg):
    # TODO
    # Hash the key
    # Decrypt IP with hashed key
    # Return as string (decode('utf-8'))
    return str()


def send_instance_ip():
    out = encrypt_message(SECRET, get_ip_addr())

    cs = socket.socket(AF_INET, SOCK_DGRAM)
    cs.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    cs.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

    try:
        cs.sendto(out, (get_broadcast_addr(), 4499))
    except Exception as e:
        print('Could not send instance IP')
        print(e)
    finally:
        cs.close()

    time.sleep(BROADCAST_DELAY)


def listen_for_instances():
    cs = socket.socket(AF_INET, SOCK_DGRAM)

    try:
        cs.bind((get_broadcast_addr(), BROADCAST_PORT))
    except:
        cs.close()
        raise

    data = cs.recvfrom(1024)
    ip = decrypt_message(SECRET, data)

    update_known_ips(ip)
    cs.close()
    listen_for_instances()


def get_broadcast_addr():
    # TODO
    # Calculate the broadcast address
    pass


def get_ip_addr():
    # https://stackoverflow.com/a/28950776/6138870
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip


def update_known_ips(ip_list):
    result = {x for x in get_known_ips()}
    result.union({x for x in ip_list})

    write_ips_to_file(result)


def get_known_ips():
    with open(f'{CONFIG_DIR}{os.sep}ip.json', 'r') as f:
        output = f.readlines()

    return [o.strip() for o in output]


def write_ips_to_file(ip_list):
    with open(f'{CONFIG_DIR}{os.sep}ip.json', 'w+') as f:
        f.writelines(ip_list)
