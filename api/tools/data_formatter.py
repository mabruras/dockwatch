#! /usr/bin/env python3
# -*- coding: utf-8 -*-

from itertools import chain

UNIQUE_KEY_IMAGES = 'containers'
UNIQUE_KEY_CONTAINERS = 'state'


def merge_node_responses(nodes):
    result = {}

    for n in nodes:
        ip = n.get('ip')
        data = n.get('data')

        if not data:
            print(f'Not data from {ip} to format')
            continue

        if isinstance(data, dict):
            print('Detected instance as a dictionary')

            if data.get(UNIQUE_KEY_CONTAINERS, None):
                # for r in result:
                #    if r.get()
                # return merge_con_details(data)
                pass

            print(f'Could not detect key [{UNIQUE_KEY_CONTAINERS}] in data set')

        elif isinstance(data, list):
            print('Detected instance as a dictionary')

            if data[0].get(UNIQUE_KEY_IMAGES, None):
                print(f'Detected key [{UNIQUE_KEY_IMAGES}] in data set')
                # TODO:

                for i in data:
                    img_name = i.get('name')
                    if img_name not in result:
                        result.update({img_name: {
                            'name': img_name,
                            'extra': list(),
                            'status': dict(),
                            'containers': list(),
                        }})

                    img = result[img_name]

                    # Update status
                    es = img['status']  # Existing Statuses = es
                    cs = i.get('status')  # Current Statuses = cs
                    for k, v in cs.items():
                        es[k] = es.get(k, 0) + v

                    # Update containers
                    ec = img['containers']  # Existing Containers = ec
                    cc = i.get('containers')  # Current Containers = cc
                    for c in cc:
                        c['ip'] = ip
                        ec.append(c)

                    # Update extra
                    img['extra'].extend(i.get('extra'))

                result = [result[v] for v in result]

            elif data[0].get(UNIQUE_KEY_CONTAINERS, None):
                print(f'Detected key [{UNIQUE_KEY_CONTAINERS}] in data set')


            print(f'Could not detect key [{UNIQUE_KEY_IMAGES}] in data set')

    return result
