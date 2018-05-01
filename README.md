# JupyterLab Dotmesh plugin


## Testing

Setting up JupyterLab:

```bash
$ virtualenv jl
$ cd jl && source bin/activate
$ pip install jupyterlab
$ jupyter lab
```

Working on the [plugin](http://jupyterlab.readthedocs.io/en/latest/developer/extension_dev.html):

```bash
$ jupyter labextension install
$ jupyter labextension list
```

Now you can update the front-end `dm-versioning.js` and either reload via the Jupyter UI or using `jupyter lab build`.