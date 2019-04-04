#! /usr/bin/env python3
# -*- coding: utf-8 -*-

UNIQUE_KEY_IMAGES = 'containers'
UNIQUE_KEY_CONTAINERS = 'state'


def merge_node_responses(nodes):
    result = {}

    for n in nodes:
        ip = n.get('ip')
        data = n.get('data')

        if not data:
            print(f'No data from {ip} to format')
            continue

        if isinstance(data, dict):
            verify_and_process_dict(n, result)
        elif isinstance(data, list):
            verify_and_process_list(n, result)

    return [result[v] for v in result]


def verify_and_process_dict(node, result):
    ip = node.get('ip')
    data = node.get('data')

    print('Detected instance as a dictionary')
    if data.get(UNIQUE_KEY_CONTAINERS, None):
        print(f'Detected key [{UNIQUE_KEY_CONTAINERS}] in data set')
        extract_container_data(data, ip, result)

    print(f'Could not detect key [{UNIQUE_KEY_CONTAINERS}] in data set')


def verify_and_process_list(node, result):
    ip = node.get('ip')
    data = node.get('data')

    print('Detected instance as a dictionary')
    if data[0].get(UNIQUE_KEY_IMAGES, None):
        print(f'Detected key [{UNIQUE_KEY_IMAGES}] in data set')
        for i in data:
            extract_image_data(i, ip, result)

    elif data[0].get(UNIQUE_KEY_CONTAINERS, None):
        print(f'Detected key [{UNIQUE_KEY_CONTAINERS}] in data set')
        for c in data:
            extract_container_data(c, ip, result)

    print(f'Could not detect key [{UNIQUE_KEY_IMAGES}] in data set')


def extract_image_data(image, ip, result):
    img = register_image(image, result)

    update_image_status(image, img)
    update_image_containers(image, img, ip)
    update_image_extras(image, img)


def register_image(image, result):
    img_name = image.get('name')

    if img_name not in result:
        result.update({img_name: {
            'name': img_name,
            'extra': list(),
            'status': dict(),
            'containers': list(),
        }})

    return result[img_name]


def update_image_status(image, img):
    es = img['status']  # Existing Statuses = es
    cs = image.get('status')  # Current Statuses = cs
    status_set = set(es)
    status_set.update(cs)
    for key in status_set:
        es[key] = es.get(key, 0) + cs.get(key, 0)


def update_image_containers(image, img, ip):
    ec = img['containers']  # Existing Containers = ec
    cc = image.get('containers')  # Current Containers = cc
    for c in cc:
        c['ip'] = ip
        ec.append(c)


def update_image_extras(image, img):
    img['extra'].extend(image.get('extra'))


def extract_container_data(container, ip, result):
    con = register_container(container, result)

    update_container_status(con, container)
    update_container_instances(con, ip, container)


def register_container(container, result):
    con_name = container.get('name')

    if con_name not in result:
        result.update({con_name: {
            'name': con_name,
            'image': container.get('image'),
            'status': dict(),
            'instances': list(),
        }})

    return result[con_name]


def update_container_status(con, container):
    es = con['status']  # Existing Statuses = es
    cs = container.get('status')  # Current Statuses = cs
    es[cs] = es.get(cs, 0) + 1


def update_container_instances(con, ip, container):
    container['ip'] = ip
    con['instances'].append(container)
