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

import * as prettyBytes from 'pretty-bytes'

import '../style/index.css';

//const API_URL = 'http://127.0.0.1:8000/example.json'

const COMMITS_API_URL = '/dotscience/commits'
const STATUS_API_URL = '/dotscience/status'

type GenericObject = { [key: string]: any };

type Commit = {
  Id: string;
  Metadata: GenericObject;
}

var COMMIT_DATA: Commit[] = []
var COMMIT_TOGGLE_STATES: GenericObject = {}
var CURRENT_FETCH_DATA_TIMEOUT_ID: any = null
var STATUS_DATA: any = {}
var LAST_STATUS_JSON_STRING: any = ''

const plugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab_dotscience_plugin',
  activate: (app: JupyterLab, restorer: ILayoutRestorer): void => {
    const { shell } = app;

    // make the root widget that will be added to the Jupyter UI
    const rootWidget = new Widget()
    rootWidget.id = 'dotscience-manager'
    rootWidget.title.label = 'Dotscience'

    const rootContainer = document.createElement('div')
    rootContainer.className = 'dotscience-root-container'

    // make the status header and content elements
    const statusHeader = document.createElement('header')
    const statusContent = document.createElement('div')

    statusHeader.className = 'dotscience-header'
    statusContent.className = 'dotscience-status-content'

    statusHeader.textContent = 'Status'
    statusContent.textContent = 'loading'

    // make the commits header and content elements
    const commitsHeader = document.createElement('header')
    const commitsContent = document.createElement('div')

    commitsHeader.className = 'dotscience-header'
    commitsContent.className = 'dotscience-commits-content'

    commitsHeader.textContent = 'Commits'
    commitsContent.textContent = 'no commits'

    // build up the tree of elements
    rootContainer.appendChild(statusHeader)
    rootContainer.appendChild(statusContent)
    rootContainer.appendChild(commitsHeader)
    rootContainer.appendChild(commitsContent)

    rootWidget.node.appendChild(rootContainer)

    shell.addToLeftArea(rootWidget, { rank: 50 });

    const fetchCommitData = () => {
      return fetch(COMMITS_API_URL)
        .then(response => {
          return response.json()
        })
    }

    const fetchStatusData = () => {
      return fetch(STATUS_API_URL)
        .then(response => {
          return response.json()
        })
    }

    const fetchData = () => {
      if (CURRENT_FETCH_DATA_TIMEOUT_ID) {
        clearTimeout(CURRENT_FETCH_DATA_TIMEOUT_ID)
        CURRENT_FETCH_DATA_TIMEOUT_ID = null
      }

      Promise.all([
        fetchCommitData(),
        fetchStatusData(),
      ]).then(results => {


        console.log('-------------------------------------------');
        console.log('-------------------------------------------');
        console.dir('data')
        console.dir(results)

        // update the commit list if it has changed
        const commitData = results[0]
        
        if(commitData.length!=COMMIT_DATA.length) {
          COMMIT_DATA = commitData
          populateCommits()
        }

        // update the status if it has changed
        const statusData = results[1]
        const stringifiedStatusData = JSON.stringify(statusData)

        if(stringifiedStatusData != LAST_STATUS_JSON_STRING) {
          LAST_STATUS_JSON_STRING = stringifiedStatusData
          STATUS_DATA = statusData
          populateStatus()
        }

        CURRENT_FETCH_DATA_TIMEOUT_ID = setTimeout(fetchData, 1000)
      })
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
        populateCommits()
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

    const getFileSizeDiff = (changedFile) => Math.abs(changedFile.current_size - changedFile.committed_size)

    const getNotebookSummary = (notebooks) => {
      const notebookNames = Object.keys(notebooks)
      if(notebookNames.length <= 0) return ''

      const parts = notebookNames.map((name) => {
        const runCount = notebooks[name].runs
        return `
<li><b>${ name }</b> (${ runCount } run${ runCount == 1 ? '' : 's'})</li>
        `
      }).join("\n")

      return `
<div>
  <p>${ notebookNames.length } notebook${ notebookNames.length == 1 ? '' : 's' }:</p>
  <ul class="dotscience-summary-ul">${parts}</ul>
</div>
`
    }

    const getStatusFilesChanged = (changedFiles) => {
      if(changedFiles.length <= 0) return ''
      const parts = changedFiles.map((changedFile) => {
        const fileDiff = getFileSizeDiff(changedFile)
        return `
<li><b>${ changedFile.filename }</b> (${ prettyBytes(fileDiff) } changed)</li>
        `
      }).join("\n")

      const totalBytesChanged = changedFiles.reduce((all, changedFile) => all + getFileSizeDiff(changedFile), 0)

      return `
<div>
  <p>${ changedFiles.length } changed file${ changedFiles.length == 1 ? '' : 's' } (${ prettyBytes(totalBytesChanged) } changed):</p>
  <ul class="dotscience-summary-ul">${parts}</ul>
</div>
`
    }

    const getStatusUnknownFiles = (unknownFiles) => {
      if(unknownFiles.length <= 0) return ''

      const parts = unknownFiles.map((unknownFile) => {
        return `
<li><b>${ unknownFile.filename }</b></li>
        `
      }).join("\n")

      return `
<div>
  <p>${ unknownFiles.length } unknown file${ unknownFiles.length == 1 ? '' : 's' }:</p>
  <ul class="dotscience-summary-ul">${parts}</ul>
  <hr />
  <p>Please use the <a target="_blank" href="https://github.com/dotmesh-io/dotscience-python">Dotscience Python Library</a> to annotate these files!</p>
</div>
`
    }

    const getStatusSummary = (status, errorDetails) => {

      let extra = ''
      let statusClassname = ''
      if(status == 'error') {
        statusClassname = 'dotscience-error-text'

        const baseErrorDetails = `
<div class="dotscience-error-text">
  <p> ${ errorDetails.message } </p>
</div>
`
        let additionalErrorDetails = ''

        if(errorDetails.type == 'json') {
          additionalErrorDetails = `
<ul class="dotscience-summary-ul">
  <li>notebook: <b>${ errorDetails.notebook }</b></li>
  <li>cell: <b>${ errorDetails.cell }</b></li>
  <li>field: <b>${ errorDetails.field }</b></li>
</ul>
`
        }
        extra = `
${ baseErrorDetails }
${ additionalErrorDetails }
`
      }

      return `
<div>
  <p>Status: <b class="${ statusClassname }">${ status }</b></p>
  ${ extra }
</div>
`
    }

    const populateStatus = () => {
      const statusSummary = getStatusSummary(STATUS_DATA.status, STATUS_DATA.error_detail)
      const notebookSummary = getNotebookSummary(STATUS_DATA.notebooks)
      const changedFileHTML = getStatusFilesChanged(STATUS_DATA.changed_files || [])
      const unknownFileHTML = getStatusUnknownFiles(STATUS_DATA.unclaimed_files || [])

      statusContent.innerHTML = `
<div>
${statusSummary}
${notebookSummary}
${changedFileHTML}
${unknownFileHTML}
</div>
`

    }

    const populateCommits = () => {
      commitsContent.innerHTML = ''

      COMMIT_DATA.forEach((commit, id) => {
        const commitContainer = getCommitContainer(commit, id)
        commitsContent.appendChild(commitContainer)
      })

      const gapContainer = document.createElement('div')
      gapContainer.className = 'dotscience-bottom-gap'

      commitsContent.appendChild(gapContainer)
    }

    app.restored.then(() => {
      shell.layoutModified.connect(() => { fetchData() });
      fetchData()
    });
  },
  autoStart: true,
  requires: [ILayoutRestorer]
};

export default plugin;
