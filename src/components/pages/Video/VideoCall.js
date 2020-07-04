/* eslint-disable no-unused-vars */
import React from "react";
import * as Cookies from "js-cookie";
import { css } from "@emotion/core";
import AgoraVideoCall from "../../AgoraVideoCall/AgoraCanvas";
import { AGORA_APP_ID } from "../../../agora.config";

// TODO Add Support for Audio Calling. 
// TODO Add Support for Screen-Share and Whiteboard (MVP Level Decision)
class VideoCall extends React.Component {
  constructor(props) {
    super(props);
    this.videoProfile = "1080p_5";
    this.mode = "live";
    this.channel = Cookies.get("channel") || "test";
    this.transcode = Cookies.get("transcode") || "interop";
    this.attendeeMode = Cookies.get("attendeeMode") || "video";
    this.baseMode = Cookies.get("baseMode") || "avc";
    this.appId = AGORA_APP_ID;
    if (!this.appId) {
      return alert("Get App ID first!");
    }
    this.uid = undefined;
  }

  render() {

    const display_video = css`
        -webkit-app-region: drag;
        height: 10px; 
        width: 100%;
    `;

    return (
      <div className="font-sans min-h-screen">
        <div style={display_video} className="bg-black"></div>
        <div className="flex" style={{ height: "calc(100vh - 10px)" }}>
          <div className="bg-black text-white flex-1 p-0 w-100">
            <AgoraVideoCall
              videoProfile={this.videoProfile}
              channel={this.channel}
              transcode={this.transcode}
              attendeeMode={this.attendeeMode}
              baseMode={this.baseMode}
              appId={this.appId}
              uid={this.uid}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default VideoCall;