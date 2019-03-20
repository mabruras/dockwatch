#! /usr/bin/env python3
import os
import socket
import time

from socket import SOL_SOCKET, SO_REUSEADDR, SO_BROADCAST, AF_INET, SOCK_DGRAM

BROADCAST_PORT = os.environ.get('DW_BROADCAST_PORT', 11609)
BROADCAST_DELAY = os.environ.get('DW_BROADCAST_DELAY_MINUTES', 30)


def broadcast_message(msg, broadcast_addr):
    cs = socket.socket(AF_INET, SOCK_DGRAM)
    print('Broadcasting message to {}:{}'.format(broadcast_addr, BROADCAST_PORT))

    cs.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
    cs.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

    try:
        print('Transmitting {} bytes'.format(len(msg)))
        cs.sendto(msg, (broadcast_addr, BROADCAST_PORT))
    except Exception as e:
        print('Could not send broadcast')
        print(e)
    finally:
        cs.close()

    time.sleep(BROADCAST_DELAY)


def broadcast_listener(broadcast_addr, callback):
    cs = socket.socket(AF_INET, SOCK_DGRAM)
    print('Starting broadcast listener: {}:{}'.format(broadcast_addr, BROADCAST_PORT))

    try:
        cs.bind((broadcast_addr, BROADCAST_PORT))
    except:
        print('Failed binding ')
        cs.close()
        raise

    data = cs.recvfrom(1024)
    print('Received broadcast of {} bytes'.format(len(data)))
    cs.close()

    callback(data)
    broadcast_listener(broadcast_addr, callback)
