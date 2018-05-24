import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

/*
import {
  each
} from '@phosphor/algorithm';
*/

import {
  Widget, //TabBar, Title
} from '@phosphor/widgets';

import '../style/index.css';

//const API_URL = 'http://127.0.0.1:8000/example.json'

const API_URL = '/dotscience/commits'

type GenericObject = { [key: string]: any };

type Commit = {
  Id: string;
  Metadata: GenericObject;
}

var COMMIT_DATA: Commit[] = []
var COMMIT_TOGGLE_STATES: GenericObject = {}

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab_dotscience_plugin',
  activate: (app: JupyterLab, restorer: ILayoutRestorer): void => {
    const { shell } = app;

    const commitList = new Widget()
    const header = document.createElement('header')
    const container = document.createElement('div')

    commitList.id = 'dotscience-manager'
    commitList.title.label = 'Dotscience'

    header.textContent = 'Commits'
    container.textContent = 'no commits'

    commitList.node.appendChild(header)
    commitList.node.appendChild(container)

    shell.addToLeftArea(commitList, { rank: 50 });

    console.log(commitList)

/*
    const tabs = new TabBar<Widget>({ orientation: 'vertical' });
    const header = document.createElement('header');

    restorer.add(tabs, 'dotscience-manager');
    tabs.id = 'dotscience-manager';
    tabs.title.label = 'Dotscience';
    header.textContent = 'Commits';
    tabs.node.insertBefore(header, tabs.contentNode);
    shell.addToLeftArea(tabs, { rank: 50 });
*/
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

    const datePadding = (st: any) => {
      var stringSt = st.toString()
      return stringSt.length == 2 ? stringSt : '0' + stringSt
    }

    const getCommitTitle = (commit: any, id: any) => {
      const timestampNumber = Number(commit.Metadata.timestamp) / 1000000
      const timestampDate = new Date(timestampNumber)
      const timestampDateTitle = datePadding(timestampDate.getDate())  + "/" + datePadding(timestampDate.getMonth()+1) + "/" + timestampDate.getFullYear() + " " + datePadding(timestampDate.getHours()) + ":" + datePadding(timestampDate.getMinutes())

      const titleContainer = document.createElement('div')
      titleContainer.className = 'dotscience-commit-title'

      const dateContainer = document.createElement('div')
      dateContainer.className = 'date'
      dateContainer.textContent = timestampDateTitle

      const messageContainer = document.createElement('div')
      messageContainer.className = 'message'
      messageContainer.textContent = commit.Metadata.message

      titleContainer.appendChild(dateContainer)
      titleContainer.appendChild(messageContainer)

      return titleContainer
    }

    const getCommitToggleButton = (commit: any, id: any) => {
      const toggleContainer = document.createElement('div')
      toggleContainer.className = 'dotscience-commit-toggle'

      const toggleButton = document.createElement('button')
      
      toggleButton.textContent = COMMIT_TOGGLE_STATES[commit.Id] ? '- hide' : '+ show'

      toggleButton.addEventListener('click', () => {
        const existingValue = COMMIT_TOGGLE_STATES[commit.Id] || false
        COMMIT_TOGGLE_STATES[commit.Id] = !existingValue
        populate()
      })

      toggleContainer.appendChild(toggleButton)

      return toggleContainer
    }

    const getCommitMetadata = (commit: any, id: any) => {
      const metadataContainer = document.createElement('div')
      metadataContainer.className = 'dotscience-commit-metadata'

      if(!COMMIT_TOGGLE_STATES[commit.Id]) return metadataContainer

      const metadataList = document.createElement('ul')
      metadataContainer.appendChild(metadataList)

      Object.keys(commit.Metadata || {}).forEach((key) => {
        const metadataItem = document.createElement('li')
        metadataItem.textContent = `${key}: ${commit.Metadata[key]}`
        metadataList.appendChild(metadataItem)
      })

      return metadataContainer
    }

    const getCommitContainer = (commit: any, id: any) => {
      const titleContainer = getCommitTitle(commit, id)
      const toggleContainer = getCommitToggleButton(commit, id)
      const metadataContainer = getCommitMetadata(commit, id)

      const commitContainer = document.createElement('div')
      commitContainer.className = 'dotscience-commit-container'

      commitContainer.appendChild(titleContainer)
      commitContainer.appendChild(toggleContainer)
      commitContainer.appendChild(metadataContainer)

      return commitContainer
    }

    const populate = () => {
      container.innerHTML = ''

      COMMIT_DATA.forEach((commit, id) => {
        const commitContainer = getCommitContainer(commit, id)
        container.appendChild(commitContainer)
      })


      /*
      tabs.clearTabs();
      COMMIT_DATA.forEach((commit, id) => {
        

        const tabLabel = timestampDateTitle + ' - ' + commit.Metadata.message
        const tabTitle = new Title<Widget>({label: tabLabel, owner: tabs})

        const commitInfo: Widget = new Widget()

        commitInfo.id = `dotscience-commit-${id}`
        commitInfo.title.label = tabLabel
        commitInfo.title.closable = false
        commitInfo.addClass('dotscience-commit-info-widget')

        const containerDiv = document.createElement('div')
        containerDiv.className = 'dotscience-commit-info-container'
        commitInfo.node.appendChild(containerDiv)

        tabs.addTab(commitInfo)
      })
      */
    }

    app.restored.then(() => {
      shell.layoutModified.connect(() => { fetchData() });
      /*
      tabs.tabActivateRequested.connect((sender, tab) => {
        //shell.activateById(tab.title.owner.id);
        console.log('-------------------------------------------');
        console.log('-------------------------------------------');
        console.log(`activate tab: ${tab}`)
        console.dir(tab)
      });
      tabs.tabCloseRequested.connect((sender, tab) => {
        tab.title.owner.close();
      });*/
      fetchData()
    });
  },
  autoStart: true,
  requires: [ILayoutRestorer]
};

export default plugin;