VERSION=$1
cd jupyterlab_dotscience_backend && bump2version --new-version $VERSION
cd ../jupyterlab_dotscience && npm --no-git-tag-version version $VERSION
git commit -am "Bump to version ${VERSION}" && git tag $VERSION
git push && git push --tags