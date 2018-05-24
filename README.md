# jupyterlab-dotscience plugin

A JupyterLab extension which enables data & model versioning and summary statistics tracking.

See [dotscience](https://github.com/dotmesh-io/dotscience) for more details.

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

An example of outputting summary statistics from a Jupyterlab Notebook cell:

```python
import json
print('DOTSCIENCE_SUMMARY=' + json.dumps({
    "apples":10
}))
```
