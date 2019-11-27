import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="jupyterlab_dotscience_backend",
    version='0.2.23',
    author="dotmesh",
    author_email="luke@dotmesh.com",
    description="Backend component for dotmesh",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/dotmesh-io/jupyterlab-plugin",
    packages=setuptools.find_packages(),
    install_requires=['datadots-api>=0.2.4'],
    classifiers=(
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ),
)
