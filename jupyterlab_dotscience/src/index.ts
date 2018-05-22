import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';


/**
 * Initialization data for the jupyterlab_dotscience extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_dotscience',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('JupyterLab extension jupyterlab_dotscience is activated!');
  }
};

export default extension;
