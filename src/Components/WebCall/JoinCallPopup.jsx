import React from "react";
import { connect } from 'react-redux';
import { AudioOff, AudioOn, VideoOff, VideoOn } from "../../assets/images";
import SDK from "../SDK";
import Video from "./Video";
import "./CallControlButtons.scss";
import { toast } from 'react-toastify';
import { getCallDisplayDetailsForOnetoManyCall } from "../../Helpers/Call/Call";
import { muteLocalAudio, muteLocalVideo } from "../callbacks";
import { isMuteAudioAction, showConfrence } from "../../Actions/CallAction";
import Store from '../../Store';

class JoinCallPopup extends React.Component {
  /**
   * WebChatPopup Component.
   *
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.state = {
        roomLink: "",
        videoMuted: this.props.showConfrenceData?.data?.localVideoMuted
    }
  }

  
  handleSubscribe = async() => {
    if(this.state.roomLink !== null){
        const subscribeRoom = await SDK.subscribeCall(this.state.roomLink);
        if(subscribeRoom.statusCode !== 200){
          this.handleCancel();
          toast.error(subscribeRoom.message);
        } 
    }
  };

  handleJoin = async() => {      
    const joinRoom = await SDK.joinCall(this.state.roomLink);
    console.log("joinRoom", joinRoom);
  }

  updateRoomLinkValue = (evt) => {
    this.setState({
        roomLink: evt.target.value
      });
  }

  handleCancel() {
    this.props.closePopup();
  }

  handleVideoMute = async () => {
    let localVideoMuted = this.state.videoMuted;
    const videoMuteResult = await SDK.muteVideo(!localVideoMuted);
    console.log('CallPopup videoMuteResult :>> ', videoMuteResult?.statusCode);
    if (videoMuteResult?.statusCode === 200) {
      muteLocalVideo(!localVideoMuted);
      this.setState({
        videoMuted: !localVideoMuted
      });
    } else if (videoMuteResult?.statusCode === 500) {
      const { data = {} } = this.props.showConfrenceData || {};
      Store.dispatch(showConfrence({ ...data, videoPermissionDisabled: true }));
    }
  }

  handleAudioMute = async () => {
    const { callLogData: { callAudioMute = false } = {} } = Store.getState();
    const audioMuteResult = await SDK.muteAudio(!callAudioMute);
    console.log('CallPopup audioMuteResult :>> ', audioMuteResult?.statusCode);
    if (audioMuteResult?.statusCode === 200) {
      muteLocalAudio(!callAudioMute);
      Store.dispatch(isMuteAudioAction(!callAudioMute));
    }
  }

  render() {
    let localVideoMuted = this.state.videoMuted;
    let localAudioMuted = this.props.showConfrenceData?.data?.localAudioMuted;
    let localStream = this.props.showConfrenceData?.data?.localStream;
    let status = this.props.showConfrenceData?.data?.status;
    let rosterData = {};
    if(status === "SUBSCRIBED"){
      let remoteStreamDatas = this.props.showConfrenceData?.data?.remoteStream;
      let userList = [];
      remoteStreamDatas.map((remostream) => {
        userList.push(remostream.fromJid);
      })
      rosterData = getCallDisplayDetailsForOnetoManyCall(userList);
    }
    return (
      <div className="userprofile logout">
        <div className="logout-popup">
          <div className="logout-label">
            <label>{"Please enter the room link to join the call"}</label>
          </div>
          <div className="logout-noteinfo">
            <input 
                type="text" 
                name="roomLink" 
                autoComplete="off" 
                placeholder="Room Link" 
                onChange={this.updateRoomLinkValue}
                value={this.state.roomLink}                  
            >
            </input>
            <button
              type="button"
              name="btn-cancel"
              className="btn-cancel"
              onClick={this.handleCancel}>
              {"Cancel"}
            </button>
            <button
              type="button"
              name="btn-logout"
              className="btn-logout"
              data-id={"jesthandleLogout"}
              onClick={this.handleSubscribe}>
              {"Subscribe"}
            </button>
          </div>
          { localStream &&          
            <div>
              { status === "SUBSCRIBED" ? 
                <div>
                  <div>
                    {"Members in call: " + rosterData.displayName}
                    </div>
                    <div>
                      <button
                        type="button"
                        name="btn-logout"
                        className="btn-logout"
                        onClick={this.handleJoin}>
                        {"Join"}
                      </button>
                    </div> 
                  </div> 
                :
                <div>{"Fetching details ..."}</div> 
              }
              <Video stream={localStream.video} muted={true} id={localStream.video.id} inverse={true}/>
              <div className="caling-button-group button-group-center">                
                  <span className={`${localAudioMuted ? "mute" : ""}`} title="Mute / Unmute" onClick={this.handleAudioMute} >
                      <i className={localAudioMuted ? "audioBtn mute" : "audioBtn "}>
                            { localAudioMuted ? <AudioOff/> : <AudioOn/> }
                      </i>
                  </span>
                  <span className={`${localVideoMuted ? "mute" : ""}`} title="Start / Stop Camera" onClick={this.handleVideoMute}>
                      <i className={localVideoMuted ? "videoBtn mute" : "videoBtn"}>
                      { localVideoMuted ? <VideoOff/> : <VideoOn/> }
                      </i>
                  </span>                
              </div>
            </div>
          }
          
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
      showConfrenceData: state.showConfrenceData
  }
}
export default connect(mapStateToProps, null)(JoinCallPopup);
