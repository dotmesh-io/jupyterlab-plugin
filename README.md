# jupyterlab-dotscience plugin

A JupyterLab extension which enables data & model versioning and summary statistics tracking.

See [dotscience](https://dotscience.com) for more details.

## Deployment
This plugin is in two parts - the frontend and the backend.
The frontend is deployed to npm, the backend to pypi.

To deploy the components automatically you should generally just follow:
```
git tag <some-semver>
git push --tags
```

This will then trigger `jupyterlab-tensorflow`'s gitlab pipeline, which will pull the tag from what you fed to git, install from npm and pypi and use the tag to form part of the final docker tag. After that it will trigger `e2e`'s gitlab pipeline and assuming it all passes, release to `latest`.

If you for any reason need to manually deploy to only npm and pypi, you need to have the following variables in your environment:

| Name  	|  Example 	|   Description	|
|--------------------------	|---------------------	|---------------------	|
| `PYPI_USER` | fred | the username we use to access pypi. Should be in gitlab-ci. |
| `PYPI_PASSWORD` | passw0rd | the password for pypi |
| `NPM_TOKEN` | something-separated-by-dashes | the token for npm. Get it from gitlab-ci or set up your own account and ping Charlotte to add you |
| `CI_COMMIT_TAG` | 0.0.5 | the version to use when releasing the npm package. This should match to a tag in git - if you don't match them then the versions may differ between what's released on pypi and what's released on npm, as the pypi release process pulls the tag from git. Also note this _must_ be a semantic version, otherwise the release will fail :/ |

then run
```
./shipit-pypi.sh -u $PYPI_USER -p $PYPI_PASSWORD
./shipit-npm.sh $NPM_TOKEN
```

You will then need to trigger the docker image repo manually if necessary (see `.gitlab-ci.yml`)


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

