#!/usr/bin/env python
'''
ooiui.core.routes.science

Defines the application routes
'''
from ooiui.core.app.science import app
from flask import request, render_template, Response
from ooiui.config import TABLEDAP, SERVICES_URL, DEBUG, ERDDAP_URL

from ooiui.core.interface import tabledap as tabled
from ooiui.core.interface.toc import get_toc as get_toc_interface, flush_cache
from ooiui.core.interface.timecoverage import get_times_for_stream

import requests
import os
import json
from datetime import datetime,timedelta
import time
import numpy as np
import math

@app.route('/signup')
def user_signup():   
    return render_template('common/userSignupForm.html')

@app.route('/login')
def user_login():    
    return render_template('common/login.html')

@app.route('/landing/pioneer')
def landing_pioneer():
    return render_template('landing/pioneer.html')

@app.route('/getdata/')
def getData():
    instr = request.args['dataset_id']    
    std = request.args['startdate']
    edd = request.args['enddate']
    param = request.args['variables']
    tav = request.args['timeaverage']
    tp = request.args['timeperiod']

    print tav
    
    if (tav=="true"):
        r = tabled.getFormattedJsonData(instr,std,edd,param)
    else:
        r = tabled.getTimeSeriesJsonData(instr,std,edd,param);

    import re
    r = re.sub(r'NaN', '"NaN"', r)
    
    resp = Response(response=r, status=200, mimetype="application/json")
    return resp

@app.route('/files')
def files():
    return render_template('filebrowser.html')

@app.route('/get_time_coverage/<ref>/<stream>')
def get_time_coverage(ref, stream):
    data = get_times_for_stream(ref, stream)
    resp = Response(response=json.dumps(data), status=200, mimetype="application/json")
    return resp
        
@app.route('/gettoc/')
def get_toc():
    return get_toc_interface()

@app.route('/flush')
def flush():
    flush_cache()
    response = Response(response='{"status":"ok"}', status=200, mimetype="application/json")
    return response


@app.route('/')
def root():
    return render_template('index.html', erddap_url=ERDDAP_URL)

