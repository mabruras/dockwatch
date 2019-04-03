#! /usr/bin/env python3
# -*- coding: utf-8 -*-

import base64
import hashlib

from Crypto import Random
from Crypto.Cipher import AES

BS = 16
pad = lambda s: s + (BS - len(s) % BS) * chr(BS - len(s) % BS)
unpad = lambda s: s[:-ord(s[len(s) - 1:])]


def encrypt_message(msg, key):
    msg = pad(msg)

    iv = Random.new().read(AES.block_size)
    hashed_key = hashlib.md5(key.encode('utf-8')).hexdigest()
    cipher = AES.new(hashed_key, AES.MODE_CBC, iv)

    return base64.b64encode(iv + cipher.encrypt(msg))


def decrypt_message(msg, key):
    hashed_key = hashlib.md5(key.encode('utf-8')).hexdigest()
    msg = base64.b64decode(msg)
    iv = msg[:16]
    cipher = AES.new(hashed_key, AES.MODE_CBC, iv)

    decrypted = cipher.decrypt(msg[16:])
    result = unpad(decrypted)

    return result.decode('utf-8')


if __name__ == '__main__':
    key = 'abc123'
    original = 'SomeSecretMessage'
    enc = encrypt_message(original, key)
    dec = decrypt_message(enc, key)

    print(original)
    print(enc)
    print(dec)

    assert original == dec
