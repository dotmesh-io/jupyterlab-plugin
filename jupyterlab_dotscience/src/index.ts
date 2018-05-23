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

//const API_URL = 'http://127.0.0.1:8000/example.json'

const API_URL = '/dotscience/commits'

type CommitMetadata = {
  author: string;
  message: string;
  timestamp: string;
}

type Commit = {
  Id: string;
  Metadata: CommitMetadata;
}

var COMMIT_DATA: Commit[] = []

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

    const fetchData = () => {
      fetch(API_URL).then(response => {
        return response.json();
      }).then(data => {
        if(data.length!=COMMIT_DATA.length) {
          COMMIT_DATA = data
          populate()
        }
        setTimeout(fetchData, 1000)
      });
    }

    const populate = () => {
      tabs.clearTabs();
      COMMIT_DATA.forEach(commit => {
        const timestampNumber = Number(commit.Metadata.timestamp) / 1000000
        const timestampDate = new Date(timestampNumber)
        const timestampDateTitle = timestampDate.getDate()  + "/" + (timestampDate.getMonth()+1) + "/" + timestampDate.getFullYear() + " " + timestampDate.getHours() + ":" + timestampDate.getMinutes();

        const tabLabel = timestampDateTitle + ' - ' + commit.Metadata.message
        const tabTitle = new Title<Widget>({label: tabLabel, owner: tabs})
        tabs.addTab(tabTitle)
      })
    }

    app.restored.then(() => {
      shell.layoutModified.connect(() => { fetchData() });
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
      fetchData()
    });
  },
  autoStart: true,
  requires: [ILayoutRestorer]
};

export default plugin;