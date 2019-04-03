#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import socket
import time

from socket import SOL_SOCKET, SO_REUSEADDR, SO_BROADCAST, AF_INET, SOCK_DGRAM

BROADCAST_PORT = os.environ.get('DW_BROADCAST_PORT', 11609)
BROADCAST_DELAY = os.environ.get('DW_BROADCAST_DELAY_MINUTES', 30)


def broadcast_message(msg, broadcast_addr, infinite=False):
    while True:
        cs = socket.socket(AF_INET, SOCK_DGRAM)
        print(f'Broadcasting message to {broadcast_addr}:{BROADCAST_PORT}')

        cs.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        cs.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

        try:
            print(f'Transmitting {len(msg)} bytes')
            cs.sendto(msg, (broadcast_addr, BROADCAST_PORT))
        except Exception as e:
            print('Could not send broadcast')
            raise e
        finally:
            cs.close()

        if not infinite:
            break

        for i in range(int(BROADCAST_DELAY) * 60):
            time.sleep(1)


def broadcast_listener(broadcast_addr, callback):
    while True:
        cs = socket.socket(AF_INET, SOCK_DGRAM)
        print(f'Starting broadcast listener: {broadcast_addr}:{BROADCAST_PORT}')

        try:
            cs.bind((broadcast_addr, BROADCAST_PORT))
        except Exception as e:
            print('Failed binding broadcast listener')
            cs.close()
            raise e

        data = cs.recvfrom(1024)
        print(f'Received broadcast of {len(data[0])} bytes from {data[1]}')
        cs.close()

        callback(data)
