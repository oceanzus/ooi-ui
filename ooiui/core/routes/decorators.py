from ooiui.core.app import app
from functools import wraps
from flask import request, render_template, make_response
import requests


def scope_required(scope):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not get_scope(scope):
                return render_template('common/help_access.html', tracking=app.config['GOOGLE_ANALYTICS'])
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def login_required():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if get_login() is None:
                return render_template('common/help_login.html', tracking=app.config['GOOGLE_ANALYTICS'])
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def get_login():
    token = request.cookies.get('ooiusertoken')
    if not token:
        return None
    return token


def get_scope(scope):
    token = get_login()

    # this will contain a list of all user granted scopes as a list of objects
    response = requests.get(app.config['SERVICES_URL'] +
                            '/current_user', auth=(token, ''))

    json_res = response.json()

    if 'error' not in json_res:
        # create list to hold a flat list of scopes
        scope_list = json_res['scopes']

        # lastly, check that the scope being passed in
        # is in the list of granted scopes.
        if scope in scope_list:
            return True
        else:
            return False


def add_response_headers(headers={}):
    """This decorator adds the headers passed in to the response"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            resp = make_response(f(*args, **kwargs))
            h = resp.headers
            for header, value in headers.items():
                h[header] = value
            return resp
        return decorated_function
    return decorator


def noindex(f):
    """This decorator passes X-Robots-Tag: noindex"""
    @wraps(f)
    @add_response_headers({'Cache-Control': 'no-store, no-cache', 'Pragma': 'no-cache', 'Expires': 'Thu, 01 Jan 1970 00:00:00 GMT'})
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function
