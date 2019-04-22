#! /usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import request

from connectors import network as net
from tools import data_formatter as formatter
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

        for node in node_responses:
            ip = node.get('ip')

            if node.get('error'):
                node['ip'] = ip
                failed_nodes.append(node)
                continue

            complete.append(node)

        merged_data = formatter.merge_node_responses(complete)

        return {
            'data': merged_data,
            'errors': failed_nodes
        }

    return inner


def streamable(func):
    def inner(*args, **kwargs):
        req_is_forwarded = request.headers.get('X-Forwarded-For', None)
        req_host = request.args.get('ip', None)

        if not req_host and not req_is_forwarded:
            err = f'No host was requested, please include "ip" as query param'
            print(err)
            return err, 400

        if req_is_forwarded or net.get_ip_addr() == req_host:
            print(f'Fetching logs from {net.get_ip_addr()}')
            print(f'X-Forwarded-For: {req_is_forwarded}')
            res, code = func(*args, **kwargs)

            return res, code
        else:
            # redirect to correct node
            print(f'Forwarding logs request to {req_host}')
            result = con.remote_logs(req_host)

            return result, 301

    return inner
