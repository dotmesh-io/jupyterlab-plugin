# installing backend

To install the backend, assuming you've followed the conda based setup [xkcd example](http://jupyterlab.readthedocs.io/en/stable/developer/xkcd_extension_tutorial.html):
```
conda install pip
pip install datadots-api==0.1.2
jupyter serverextension enable jupyterlab_dotscience_backend
```

# installing frontend
```
jupyter labextension install jupyterlab_dotscience --no-build
```

