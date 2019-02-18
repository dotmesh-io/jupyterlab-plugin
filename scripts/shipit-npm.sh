#!/bin/sh

set -ex

if [ x$CI_DOCKER_TAG == x ]
then
    # Non-CI build
    CI_DOCKER_TAG=latest
fi

NPM_ARGS="$@"

echo "### Building base container"

BASE=dotscience-npm-base:$CI_DOCKER_TAG

docker build -t $BASE -f Dockerfile.js.build .

echo "### Shipping package to npm"

docker run $BASE /bin/bash -c "cd dsbuild ; npm login $NPM_ARGS; npm version from-git; npm publish jupyterlab_dotscience --access public"
