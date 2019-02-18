import setuptools
import versioneer

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="jupyterlab_dotscience_backend",
    version=versioneer.get_version(),
    cmdclass=versioneer.get_cmdclass(),
    author="dotmesh",
    author_email="luke@dotmesh.com",
    description="Backend component for dotmesh",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/dotmesh-io/jupyterlab-plugin",
    packages=setuptools.find_packages(),
    classifiers=(
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ),
)
