#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#   Copyright 2017 Daniel Jeong (@taekb)
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
import os
from collections import namedtuple
from contextlib import closing

import scipy as scipy
from flask import Flask, render_template, request, Response, stream_with_context
import subprocess

from stt_streaming_by_file import transcribe_streaming

app = Flask(__name__)

app.secret_key = os.urandom(24)


@app.route('/')
def init_recorder():
    return render_template('index.html')


@app.route('/uploads', methods=['POST'])
def save_audio():
    file = request.files['file']
    file_name = file.filename
    file.save(f"audio/{file_name}.wav")
    os.chmod(f"audio/{file_name}.wav", 0o777)
    return speech_to_text(f"audio/{file_name}.wav")


@app.route('/fileupload', methods=['POST'])
def upload():
    file = request.files['file']
    file_name = file.filename
    file.save(f"audio/{file_name}")
    os.chmod(f"audio/{file_name}", 0o777)
    # audioFile.close()
    return speech_to_text(file_name)


def speech_to_text(file_name):
    result = transcribe_streaming(file_name)

    # subprocess.run('python3 speechtotext.py', shell=True)
    # inFile = open('result/result.txt', 'r')
    # transcript = ''
    # for line in inFile:
    #     transcript += line
    # print(transcript)
    # return transcript

    return Response(stream_with_context(result))


if __name__ == '__main__':
    app.run(debug=True, port=8100)
    # add host='0.0.0.0' if running on docker container
