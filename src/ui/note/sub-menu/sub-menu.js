import React from 'react'
import {Divider, Empty, Icon, Menu, Dropdown} from 'antd'
import FileCard from './file-card'
import FileResource from '../../../application/file-resource'
import '../../../resources/css/sub-menu.css'
import Files from '../../../utils/files'
import {NoteTagModel} from '../../../model/note-tag'
import File from '../../../model/file'

const NOTE_WORKSPACE_PATH = () => window.localStorage.getItem('workspace')
const NOTES_TAGS_FILE = () => window.localStorage.getItem('workspace') + '/__tags'
const DEFAULT_EDITED_FILE_NAME = {
  old: null,
  now: '',
  type: ''
}

class SubMenu extends React.Component {
  state = {
    selectedDirPath: '',
    editedFileName: DEFAULT_EDITED_FILE_NAME
  }

  closeEditInput = () => {
    this.setState({editedFileName: DEFAULT_EDITED_FILE_NAME})
  }

  back = () => {
    const {selectedDirStack} = this.props
    if (selectedDirStack.length > 1) {
      selectedDirStack.pop();
      this.openFile({path: selectedDirStack[selectedDirStack.length - 1], type: 'dir'})
      this.props.updateSelectedDirStack(selectedDirStack)
    }
  }

  openFile = file => {
    this.setState({selectedDirPath: file.path})
    if (file.type === 'dir') {
      this.props.updateSelectedDir(file.path)
      return
    }
    if (file.path === this.props.currentEditFile.path) {
      return
    }
    this.props.updateCurrentEditFile(
      FileResource.findFile(file.path)
    )
  }

  changeFileName = now => {
    const {editedFileName} = this.state
    editedFileName.now = now
    this.setState({editedFileName})
  }

  updateFileName = () => {
    const {editedFileName} = this.state

    const {notesTags} = this.props
    const {old, now, type} = editedFileName
    if (Files.nameByPath(old) !== now) {
      this.props.modifyFileName(old, now, type)
    }
    if (type === 'file') {
      const _path = old.split(NOTE_WORKSPACE_PATH())[1]
      this.props.updateNotesTags(
        NOTES_TAGS_FILE(),
        NoteTagModel.updateNoteTagPath(_path, now, notesTags))
    }
  }

  pinFile = (old, now) => {
    const type = 'file'
    const {notesTags} = this.props

    this.props.modifyFileName(old, now, type)
    const _path = old.split(NOTE_WORKSPACE_PATH())[1]
    this.props.updateNotesTags(
      NOTES_TAGS_FILE(),
      NoteTagModel.updateNoteTagPath(_path, now, notesTags))
  }

  openEditInput = file => {
    const editedFileName = {
      old: file.path,
      now: Files.nameByPath(file.path),
      type: file.type
    }
    this.setState({editedFileName})
  }

  sort = (filesOrDirs) => {
    let dirs = [], files = [], pined = []
    filesOrDirs.forEach(item => {
      if (item.type === 'dir') {
        dirs.push(item)
      }
      if (File.isPined(item.path)) {
        pined.push(item)
      }
      if (!File.isPined(item.path) && item.type === 'file') {
        files.push(item)
      }
    })
    return [
      ...dirs.sort((a, b) => a.name > b.name ? -1 : 1),
      ...pined.sort((a, b) => a.name > b.name ? -1 : 1),
      ...files.sort((a, b) => a.name > b.name ? -1 : 1)
    ]
  }

  subFiles = selectedDir => {
    const {editedFileName, selectedDirPath} = this.state
    return this.sort(selectedDir.sub)
      .map(file => {
        return <FileCard key={file.path}
                         selectedPath={selectedDirPath}
                         deleteFileOrDir={this.props.deleteFileOrDir}
                         file={file}
                         pinFile={this.pinFile}
                         editedFileName={editedFileName}
                         changeFileName={this.changeFileName}
                         updateFileName={this.updateFileName}
                         openEditInput={this.openEditInput}
                         openFile={this.openFile}
                         closeEditInput={this.closeEditInput}
        />
      })
  }

  create = ({key}) => {
    const {selectedDir} = this.props
    const path = selectedDir.path
    this.props.createFileOrDir({path, type: key})
  }

  render() {
    const menu = (
      <Menu onClick={this.create}>
        <Menu.Item key='dir'>
          <span>创建文件夹</span>
        </Menu.Item>
        <Menu.Item key='md'>
          <span>创建markdown</span>
        </Menu.Item>
      </Menu>
    )
    const {selectedDir} = this.props
    const subFiles = this.subFiles(selectedDir)
    return <div className='layout_right_content_layout_left_menu'>
      <div className='layout_right_content_layout_left_menu_scroll'>
        <div className='layout_right_content_layout_left_menu_tool'>
          <div className='back-icon cursor_pointer'
               onClick={this.back}>
            <Icon type="enter"/>
          </div>
          <div className='sub-menu-tool-title'>
            {Files.nameByPath(selectedDir.path)}
          </div>
          <Dropdown overlay={menu}>
                    <span className='create-icon'>
                      <Icon type="plus"/>
                    </span>
          </Dropdown>
        </div>
        <Divider/>
        {
          subFiles.length
            ? subFiles
            : <Empty
              style={{marginTop: '20%', width: '250px'}}
              description={false}
              image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        }
        <div style={{height: 40}}/>
      </div>
      <div className='layout_right_content_layout_left_menu_bottom'>
        <Divider/>
        共 {selectedDir.sub.length} 项
      </div>
    </div>
  }
}

export default SubMenu