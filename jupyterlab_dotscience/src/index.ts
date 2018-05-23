import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

/*
import {
  each
} from '@phosphor/algorithm';
*/

import {
  TabBar, Widget, Title
} from '@phosphor/widgets';

import '../style/index.css';

const LIST_DATA = [
  "apples",
  "oranges",
]

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab_dotscience_plugin',
  activate: (app: JupyterLab, restorer: ILayoutRestorer): void => {
    const { shell } = app;
    const tabs = new TabBar<Widget>({ orientation: 'vertical' });
    const header = document.createElement('header');

    restorer.add(tabs, 'dotscience-manager');
    tabs.id = 'dotscience-manager';
    tabs.title.label = 'Dotscience';
    header.textContent = 'Commits';
    tabs.node.insertBefore(header, tabs.contentNode);
    shell.addToLeftArea(tabs, { rank: 50 });

    app.restored.then(() => {
      const populate = () => {
        tabs.clearTabs();

        LIST_DATA.forEach(title => {
          const tabTitle = new Title<Widget>({label: title, owner: tabs})
          tabs.addTab(tabTitle)
        })

//        each(shell.widgets('main'), widget => { tabs.addTab(widget.title); });
      };

      // Connect signal handlers.
      shell.layoutModified.connect(() => { populate(); });
      tabs.tabActivateRequested.connect((sender, tab) => {
        //shell.activateById(tab.title.owner.id);
        console.log('-------------------------------------------');
        console.log('-------------------------------------------');
        console.log(`activate tab: ${tab}`)
        console.dir(tab)
      });
      tabs.tabCloseRequested.connect((sender, tab) => {
        tab.title.owner.close();
      });

      // Populate the tab manager.
      populate();
    });
  },
  autoStart: true,
  requires: [ILayoutRestorer]
};

export default plugin;