VERSION=$1
cd jupyterlab_dotscience_backend && bump2version --new-version $VERSION
cd ../jupyterlab_dotscience && npm --no-git-tag-version version from-git
git push && git push --tags