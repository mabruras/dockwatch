#! /usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import request

from connectors import network as net
from tools import dw_connect as con


def forward(func):
    def inner(*args, **kwargs):
        req_is_forwarded = request.headers.get('X-Forwarded-For', None)
        if req_is_forwarded:
            # Only run function on current instance
            res, code = func(*args, **kwargs)
            print(f'Instance received a forwarded request, and resulted in ({code}): {res}')

            return res, code

        # Forward if request is not already forwarded
        print('Instance was entry point of request, forwarding request')
        forward_ips = con.get_ips_from_external_instances()
        print(f'Found total of {len(forward_ips)} ips externally: {forward_ips}')

        node_responses = []  # List to store each node response
        con.forward_request(forward_ips, node_responses)
        exec_on_current(args, kwargs, node_responses)

        return normalize_responses(node_responses), 200

    def exec_on_current(args, kwargs, node_responses):
        print(f'Executing request on current instance')
        res, code = func(*args, **kwargs)
        print(f'Result from current instance ({code}): {res}')

        current_ip = net.get_ip_addr()
        con.extract_result(current_ip, code, res, node_responses)
        print(f'Result after current instance: {node_responses}')

    def normalize_responses(node_responses):
        complete = []
        failed_nodes = []

        for n in node_responses:
            ip = n.get('ip')

            if n.get('error'):
                failed_nodes.append(n)
                continue

            for d in n.get('data'):
                d['ip'] = ip
                complete.append(d)

        return {
            'data': complete,
            'errors': failed_nodes
        }

    return inner
