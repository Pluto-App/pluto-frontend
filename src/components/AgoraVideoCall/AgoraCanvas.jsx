/**
 * From Agora OpenAgoraWWeb-React GitHub Repo
 */

/* eslint-disable no-unused-vars */
import React from 'react'
import { merge } from 'lodash'
import AgoraRTC from 'agora-rtc-sdk'
const { remote } = window.require('electron');

const tile_canvas = {
  '1': ['span 12/span 24'],
  '2': ['span 12/span 12/13/25', 'span 12/span 12/13/13'],
  '3': ['span 6/span 12', 'span 6/span 12', 'span 6/span 12/7/19'],
  '4': ['span 6/span 12', 'span 6/span 12', 'span 6/span 12', 'span 6/span 12/7/13'],
  '5': ['span 3/span 4/13/9', 'span 3/span 4/13/13', 'span 3/span 4/13/17', 'span 3/span 4/13/21', 'span 9/span 16/10/21'],
  '6': ['span 3/span 4/13/7', 'span 3/span 4/13/11', 'span 3/span 4/13/15', 'span 3/span 4/13/19', 'span 3/span 4/13/23', 'span 9/span 16/10/21'],
  '7': ['span 3/span 4/10/1', 'span 3/span 4/13/1', 'span 3/span 4/16/1', 'span 3/span 4/19/1', 'span 3/span 4/13/21', 'span 3/span 4/13/25', 'span 9/span 16/10/21'],
}

/**
 * @prop appId uid
 * @prop transcode attendeeMode videoProfile channel baseMode
 */
class AgoraCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.client = {}
    this.localStream = {}
    this.shareClient = {}
    this.shareStream = {}
    this.state = {
      displayMode: 'tile',
      streamList: [],
      readyState: false
    }
  }

  componentWillMount() {
    let $ = this.props
    // init AgoraRTC local client
    this.client = AgoraRTC.createClient({ mode: $.transcode })
    this.client.init($.appId, () => {
      console.log("AgoraRTC client initialized")
      this.subscribeStreamEvents()
      this.client.join($.appId, $.channel, $.uid, (uid) => {
        console.log("User " + uid + " join channel successfully")
        console.log('At ' + new Date().toLocaleTimeString())
        this.localStream = this.streamInit(uid, $.attendeeMode, $.videoProfile)
        this.localStream.init(() => {
          if ($.attendeeMode !== 'audience') {
            this.addStream(this.localStream, true)
            this.client.publish(this.localStream, err => {
              console.log("Publish local stream error: " + err);
            })
          }
          this.setState({ readyState: true })
        },
          err => {
            console.log("getUserMedia failed", err)
            this.setState({ readyState: true })
          })
      })
    })
  }

  componentDidMount() {
    // add listener to control btn group
    let canvas = document.querySelector('#ag-canvas')
    let btnGroup = document.querySelector('.ag-btn-group')
    canvas.addEventListener('mousemove', () => {
      if (global._toolbarToggle) {
        clearTimeout(global._toolbarToggle)
      }
      btnGroup.classList.add('active')
      global._toolbarToggle = setTimeout(function () {
        btnGroup.classList.remove('active')
      }, 1000)
    })
  }

  componentDidUpdate() {
    let canvas = document.querySelector('#ag-canvas')
    let no = this.state.streamList.length
    this.state.streamList.map((item, index) => {
      let id = item.getId()
      let dom = document.querySelector('#ag-item-' + id)
      if (!dom) {
        dom = document.createElement('section')
        dom.setAttribute('id', 'ag-item-' + id)
        dom.setAttribute('class', 'ag-item')
        canvas.appendChild(dom)
        item.play('ag-item-' + id)
      }
      dom.setAttribute('style', `grid-area: ${tile_canvas[no][index]}`)
      item.player.resize && item.player.resize()
    })
  }

  componentWillUnmount () {
    this.client && this.client.unpublish(this.localStream)
    this.localStream && this.localStream.close()
    this.client && this.client.leave(() => {
      console.log('Client succeed to leave.')
    }, () => {
      console.log('Client failed to leave.')
    })
  }

  streamInit = (uid, attendeeMode, videoProfile, config) => {
    let defaultConfig = {
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    }

    switch (attendeeMode) {
      case 'audio-only':
        defaultConfig.video = false
        break;
      case 'audience':
        defaultConfig.video = false
        defaultConfig.audio = false
        break;
      default:
      case 'video':
        break;
    }

    let stream = AgoraRTC.createStream(merge(defaultConfig, config))
    stream.setVideoProfile(videoProfile)
    return stream
  }

  subscribeStreamEvents = () => {
    let rt = this
    rt.client.on('stream-added', function (evt) {
      let stream = evt.stream
      console.log("New stream added: " + stream.getId())
      console.log('At ' + new Date().toLocaleTimeString())
      console.log("Subscribe ", stream)
      rt.client.subscribe(stream, function (err) {
        console.log("Subscribe stream failed", err)
      })
    })

    rt.client.on('peer-leave', function (evt) {
      console.log("Peer has left: " + evt.uid)
      console.log(new Date().toLocaleTimeString())
      console.log(evt)
      rt.removeStream(evt.uid)
    })

    rt.client.on('stream-subscribed', function (evt) {
      let stream = evt.stream
      console.log("Got stream-subscribed event")
      console.log(new Date().toLocaleTimeString())
      console.log("Subscribe remote stream successfully: " + stream.getId())
      console.log(evt)
      rt.addStream(stream)
    })

    rt.client.on("stream-removed", function (evt) {
      let stream = evt.stream
      console.log("Stream removed: " + stream.getId())
      console.log(new Date().toLocaleTimeString())
      console.log(evt)
      rt.removeStream(stream.getId())
    })
  }

  removeStream = (uid) => {
    this.state.streamList.map((item, index) => {
      if (item.getId() === uid) {
        item.close()
        let element = document.querySelector('#ag-item-' + uid)
        if (element) {
          element.parentNode.removeChild(element)
        }
        let tempList = [...this.state.streamList]
        tempList.splice(index, 1)
        this.setState({
          streamList: tempList
        })
      }

    })
  }

  addStream = (stream, push = false) => {
    let repeatition = this.state.streamList.some(item => {
      return item.getId() === stream.getId()
    })
    if (repeatition) {
      return
    }
    if (push) {
      this.setState({
        streamList: this.state.streamList.concat([stream])
      })
    }
    else {
      this.setState({
        streamList: [stream].concat(this.state.streamList)
      })
    }

  }

  handleCamera = (e) => {
    document.getElementById("")
    if(this.localStream.isVideoOn()) {
      this.localStream.disableVideo()
      document.getElementById("video-icon").innerHTML = "videocam_off"
    } else {
      this.localStream.enableVideo()
      document.getElementById("video-icon").innerHTML = "videocam"
    }
  }

  handleMic = (e) => {
    if (this.localStream.isAudioOn()) {
      this.localStream.disableAudio()
      document.getElementById("mic-icon").innerHTML = "mic_off"
    } else {
      this.localStream.enableAudio()
      document.getElementById("mic-icon").innerHTML = "mic"
    }
  }

  switchDisplay = (e) => {
    if (e.currentTarget.classList.contains('disabled') || this.state.streamList.length <= 1) {
      return
    }
    if (this.state.displayMode === 'pip') {
      this.setState({ displayMode: 'tile' })
    }
    else if (this.state.displayMode === 'tile') {
      this.setState({ displayMode: 'pip' })
    }
    else if (this.state.displayMode === 'share') {
      // do nothing or alert, tbd
    }
    else {
      console.error('Display Mode can only be tile/pip/share')
    }
  }

  hideRemote = (e) => {
    if (e.currentTarget.classList.contains('disabled') || this.state.streamList.length <= 1) {
      return
    }
    let list
    let id = this.state.streamList[this.state.streamList.length - 1].getId()
    list = Array.from(document.querySelectorAll(`.ag-item:not(#ag-item-${id})`))
    list.map(item => {
      if (item.style.display !== 'none') {
        item.style.display = 'none'
      }
      else {
        item.style.display = 'block'
      }
    })

  }

  handleExit = (e) => {
    if (e.currentTarget.classList.contains('disabled')) {
      return
    }
    try {
      this.client && this.client.unpublish(this.localStream)
      this.localStream && this.localStream.close()
      this.client && this.client.leave(() => {
        console.log('Client succeed to leave.')
      }, () => {
        console.log('Client failed to leave.')
      })
    }
    finally {
      this.setState({ readyState: false })
      this.client = null
      this.localStream = null
      var window = remote.getCurrentWindow();
      window.close();
    }
  }

  render() {
    const style = {
      display: 'grid',
      gridGap: '5px',
      alignItems: 'center',
      justifyItems: 'center',
      gridTemplateRows: 'repeat(12, auto)',
      gridTemplateColumns: 'repeat(24, auto)'
    }
    const videoControlBtn = this.props.attendeeMode === 'video' ?
      (<span
        onClick={this.handleCamera}
        className="ag-btn videoControlBtn"
        title="Enable/Disable Video">
        <i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} id="video-icon">videocam</i>
      </span>) : ''

    const audioControlBtn = this.props.attendeeMode !== 'audience' ?
      (<span
        onClick={this.handleMic}
        className="ag-btn audioControlBtn"
        title="Enable/Disable Audio">
        <i className="material-icons focus:outline-none md-light" style={{ fontSize: "30px" }} id="mic-icon">mic</i>
      </span>) : ''

    const exitBtn = (
      <span
        onClick={this.handleExit}
        className={this.state.readyState ? 'ag-btn exitBtn' : 'ag-btn exitBtn disabled'}
        title="Exit">
        <i className="material-icons exit focus:outline-none md-light" style={{ fontSize: "30px" }} >logout</i>
      </span>
    )

    return (
      <div id="ag-canvas" style={style}>
        <div className="ag-btn-group">
          {exitBtn}
          {videoControlBtn}
          {audioControlBtn}
        </div>
      </div>
    )
  }
}

export default AgoraCanvas