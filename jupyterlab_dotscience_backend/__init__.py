"""
JupyterLab dotscience: proxy through to local dotscience instance
"""

from notebook.utils import url_path_join

__version__ = '0.0.1'
from .build import LatexBuildHandler
from .synctex import LatexSynctexHandler

from notebook.base.handlers import APIHandler

# TODO pip3 install datadots-api==0.1.2
from dotmesh.client import DotmeshClient

# XXX is this right???
path_regex = r'(?P<path>(?:(?:/[^/]+)+|/?))'

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
    base_url = web_app.settings['base_url']
    dotscience = url_path_join(base_url, 'dotscience')
    commits = url_path_join(latex, 'commits')

    handlers = [(f'{commits}{path_regex}',
                 DotmeshAPIProxy,
                 {"notebook_dir": nb_server_app.notebook_dir}
                )]
    web_app.add_handlers('.*$', handlers)


class DotmeshAPIProxy(APIHandler):
    """
    A handler that makes API calls to dotmesh and returns the commits on the
    hard-coded dotscience-project dot.
    """

    def initialize(self, notebook_dir):
        # Not sure if we need this, but it might come in handy.
        self.notebook_dir = notebook_dir

    @web.authenticated
    # TODO make this asynchronous so that it doesn't block jupyter server on
    # making API calls to dotmesh
    # @gen.coroutine
    def get(self, path=''):
        """
        Get the commits on the dotscience-project dot.
        """
        self.finish(
            DotmeshClient(
                cluster_url="http://172.17.0.1:32607/rpc",
                username="admin",
                api_key=os.environ.get("DOTMESH_API_KEY", "password"),
            ).getDot("dotscience-project").getBranch("master").log()
        )
