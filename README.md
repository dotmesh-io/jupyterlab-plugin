# jupyterlab-dotscience plugin

A JupyterLab extension which enables data & model versioning and summary statistics tracking.

See [dotscience](https://dotscience.com) for more details.

## Deployment
This plugin is in two parts - the frontend and the backend.
The frontend is deployed to npm, the backend to pypi. Both will have an associated git tag at the time of release, which will be used to ping [jupyterlab-tensorflow]() to rebuild the docker image with the latest releases.

To deploy the components you should generally just follow:
```
git tag <some-semver>
git push --tags
```
but if you for any reason need to manually deploy, you need to have the following variables in your environment:
| Name  	|  Example 	|   Description	|
|--------------------------	|---------------------	|---------------------	|
| `PYPI_USER` | fred | the username we use to access pypi. Should be in gitlab-ci. |
| `PYPI_PASSWORD` | passw0rd | the password for pypi |

then run
```
./shipit-pypi.sh
./shipit-npm.sh
```
# Run Jupyter lab on your host

```
source ~/miniconda/bin/activate jupyterlab-ext
jupyter lab --watch
```

# installing backend

To install the backend, assuming you've followed the conda based setup [xkcd example](http://jupyterlab.readthedocs.io/en/stable/developer/xkcd_extension_tutorial.html):
```
conda install pip
pip install datadots-api==0.1.2
pip install -e jupyterlab_dotscience_backend
jupyter serverextension enable --py jupyterlab_dotscience_backend --sys-prefix
```

[More details](http://jupyter-notebook.readthedocs.io/en/stable/examples/Notebook/Distributing%20Jupyter%20Extensions%20as%20Python%20Packages.html#Enable-a-Server-Extension)

# installing frontend
```
jupyter labextension install jupyterlab_dotscience --no-build
```

## Summary statistics

For python applications look at the [dotscience-python](https://pypi.org/project/dotscience/) library. For other languages we do not yet have a library, but this [specification](https://docs.dotscience.com/references/run-metadata-format/#basic-structure) should give you some idea what is expected.
