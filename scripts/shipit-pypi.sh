#!/bin/sh

set -ex

if [ "x$CI_DOCKER_TAG" = "x" ]
then
    # Non-CI build
    CI_DOCKER_TAG=latest
fi

TWINE_ARGS="$@"

echo "### Building base container"

BASE=dotscience-python-base:$CI_DOCKER_TAG

docker build -t $BASE -f Dockerfile.python.build .

echo "### Shipping package to PyPi"

docker run $BASE /bin/bash -c "pip install twine ; cd dsbuild ; python3 setup.py sdist bdist_wheel ; twine upload $TWINE_ARGS dist/*"
