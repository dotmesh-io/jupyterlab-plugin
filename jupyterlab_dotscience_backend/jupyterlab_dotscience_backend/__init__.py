"""
JupyterLab dotscience: proxy through to local dotscience instance
"""

from notebook.utils import url_path_join

__version__ = '0.0.2'

import os, json
from tornado import web
from notebook.base.handlers import APIHandler
import requests

# TODO pip3 install datadots-api==0.1.2
from dotmesh.client import DotmeshClient, DotName

import logging
logging.getLogger('jsonrpcclient.client.request').setLevel(logging.ERROR)
logging.getLogger('jsonrpcclient.client.response').setLevel(logging.ERROR)

# XXX is this right???
path_regex = r'(?P<path>(?:(?:/[^/]+)+|/?))'

import socket, struct
def get_default_gateway_linux():
    """Read the default gateway directly from /proc."""
    with open("/proc/net/route") as fh:
        for line in fh:
            fields = line.strip().split()
            if fields[1] != '00000000' or not int(fields[3], 16) & 2:
                continue

            return socket.inet_ntoa(struct.pack("<L", int(fields[2], 16)))

import sys
if sys.platform == "darwin":
    # probably not in a container! so try to connect to dotmesh on localhost
    # (dev mode)
    CLUSTER_URL = "http://127.0.0.1:32607/rpc"
else:
    CLUSTER_URL = "http://dotmesh-server-inner:32607/rpc"

COMMITTER_STATUS_URL = "http://" + os.environ.get("DOTSCIENCE_COMMITTER_HOSTNAME", "committer") + "/status"

def log_stdout(text):
  if os.getenv("TASK.DEBUG_LOGGING") != "" and os.getenv("TASK.DEBUG_LOGGING") is not None:
    print(text)
  
def _jupyter_server_extension_paths():
    return [{
        'module': 'jupyterlab_dotscience_backend'
    }]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookApp): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    # Prepend the base_url so that it works in a jupyterhub setting

    # the /dotscience/commits endpoint will load the workspace dot commits
    # from the dotmesh api

    # the /dotscience/status endpoint will load the status from the
    # committer endpoint
    base_url = web_app.settings['base_url']
    dotscience = url_path_join(base_url, 'dotscience')
    commits = url_path_join(dotscience, 'commits')
    status = url_path_join(dotscience, 'status')

    print("=========================")
    print("Jupyter Dotscience plugin backend loaded.")
    print("base_url: %s" % (web_app.settings['base_url'],))
    print("commits: %s" % (commits,))
    print("status: %s" % (status,))
    print("=========================")

    handlers = [
        (
            commits+path_regex,
            DotmeshAPIProxy,
            {"notebook_dir": nb_server_app.notebook_dir},
        ),(
            status+path_regex,
            CommitterStatusProxy,
            {"notebook_dir": nb_server_app.notebook_dir},
        )
    ]
    web_app.add_handlers('.*$', handlers)

class DotmeshAPIProxy(APIHandler):
    """
    A handler that makes API calls to dotmesh and returns the commits on the
    configured dotscience-project dot.
    """

    def initialize(self, notebook_dir):
        # Not sure if we need this, but it might come in handy.
        self.notebook_dir = notebook_dir

    # TODO make this asynchronous so that it doesn't block jupyter server on
    # making API calls to dotmesh
    # @gen.coroutine
    def get(self, path=''):
        """
        Get the commits on the dotscience-project dot.
        """
        # Just use the name of the workspace dot (rather than including the
        # namespace) because it's cloned locally under the admin account. See
        # https://github.com/dotmesh-io/dotscience-agent/issues/70

        dotname = os.environ.get("DOTSCIENCE_PROJECT_DOT_LOCAL", "dotscience-project")
        workspaceDot = DotName.fromDotNameWithOptionalNamespace(
            dotname
        ).name
        log_stdout("Loading logs for dot: %s from url: %s" % (dotname, CLUSTER_URL))
        self.finish(
            json.dumps(DotmeshClient(
                cluster_url=CLUSTER_URL,
                username="admin",
                api_key=os.environ.get("DOTMESH_API_KEY", "password"),
            ).getDot(workspaceDot).getBranch("master").log())
        )

class CommitterStatusProxy(APIHandler):
    """
    A handler that makes API calls to the committer to get it's current status
    """

    def initialize(self, notebook_dir):
        # Not sure if we need this, but it might come in handy.
        self.notebook_dir = notebook_dir

    # TODO make this asynchronous so that it doesn't block jupyter server on
    # making API calls to the committer
    # @gen.coroutine
    def get(self, path=''):
        """
        Get the current status of the committer
        """
        log_stdout("Loading committer status from url: %s" % (COMMITTER_STATUS_URL))
        r = requests.get(COMMITTER_STATUS_URL)
        log_stdout(json.dumps(r.json()))
        self.finish(json.dumps(r.json()))


from ._version import get_versions
__version__ = get_versions()['version']
del get_versions
