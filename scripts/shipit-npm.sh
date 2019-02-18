#!/bin/sh

set -ex

if [ x$CI_DOCKER_TAG == x ]
then
    # Non-CI build
    CI_DOCKER_TAG=latest
fi

NPM_TOKEN="$@"

echo "### Building base container"

BASE=dotscience-npm-base:$CI_DOCKER_TAG

docker build -t $BASE -f Dockerfile.js.build .

echo "### Shipping package to npm"

docker run $BASE /bin/bash -c "cd dsbuild/jupyterlab_dotscience; mkdir .git ; npm version from-git; npm run build; echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}'>.npmrc; npm publish --access public"
