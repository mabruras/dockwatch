#! /usr/bin/env python3
import ipaddress
import os
import socket

NET_MASK = os.environ.get('DW_NET_MASK', '255.255.255.0')


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


def get_broadcast_addr():
    masked_ip = '{}/{}'.format(get_ip_addr(), NET_MASK)

    return str(ipaddress.IPv4Network(masked_ip, False).broadcast_address)
