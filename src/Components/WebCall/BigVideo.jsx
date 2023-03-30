import React from 'react';
import Video from './Video';
import ProfileImage from '../../Components/WebChat/Common/ProfileImage'
import { CALL_STATUS_CONNECTED, CALL_STATUS_HOLD } from '../../Helpers/Call/Constant';
import { AudioOff, DropdownArrow, IconPinActive, VideoOff } from '../../assets/images';
import { initialNameHandle } from '../../Helpers/Chat/User';
import { handleAudioClasses } from '../../Helpers/Call/Call';
import {getFromLocalStorageAndDecrypt} from '../WebChat/WebChatEncryptDecrypt';

class BigVideo extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        if( this.props.showConfrenceDataId !== nextProps.showConfrenceDataId ||
            ((this.props.stream && nextProps.stream) && this.props.stream.id !== nextProps.stream.id) ||
            ((this.props.stream && nextProps.stream) && this.props.stream.video !== nextProps.stream.video) ||
            this.props.rosterData.image !== nextProps.rosterData.image ||
            nextProps.videoMuted !== this.props.videoMuted ||
            nextProps.audioMuted !== this.props.audioMuted ||
            nextProps.volumeLevel !== this.props.volumeLevel ||
            nextProps.showVoiceDetect !== this.props.showVoiceDetect ||
            nextProps.remoteStreamLength !== this.props.remoteStreamLength ||
            nextProps.callStatus !== this.props.callStatus ||
            nextProps.pinUserJid !== this.props.pinUserJid ||
            nextProps.setPinUser !== this.props.setPinUser ||
            nextProps.jid !== this.props.jid){
            return true;
        }
        return false;
    }

    render() {
        let { audioMuted, videoMuted, rosterData, stream, volumeLevel, showVoiceDetect, inverse } = this.props;
        const token = getFromLocalStorageAndDecrypt('token');
        const initial = initialNameHandle(rosterData, rosterData.initialName);
        return (
            <>
                {!videoMuted && this.props.callStatus && (this.props.callStatus.toLowerCase() === CALL_STATUS_CONNECTED || this.props.callStatus.toLowerCase() === CALL_STATUS_HOLD) && stream && stream.video &&
                    <div className="VideoWrapper">
                        <div className="VideoWrapperInner">
                        <div className="participantCallStatus video">
                        {(this.props.setPinUser && this.props.jid === this.props.pinUserJid) &&
                            <i className="pinned"><IconPinActive /></i>
                            }                        <>
                        {audioMuted &&
                        <i title="Participant is muted" className="AudioOffRemote"><AudioOff /></i>
                    }
                        {!audioMuted && 
                               <div className={`audio_indication left height_adjust transistion_adjust ${handleAudioClasses(60)}`}>
                                <div className="audio_indicator audio_indicator_1"></div>
                                <div className="audio_indicator audio_indicator_2"></div>
                                <div className="audio_indicator audio_indicator_3"></div>
                            </div>
                        }
                        </>                        
                        </div>
                            <Video stream={stream.video} muted={false} id={stream.video.id} inverse={inverse}/>
                            {/* <Video stream={stream.video} muted={false} id={stream.video.id} inverse={inverse}/> */}
                        <div onClick={this.props.handleVideoFullView} className="VideofullView">
                            <i><DropdownArrow/> </i>
                        </div>
                        </div>
                        <span className="ParticipantInfo lg">{rosterData.displayName || rosterData.nickName}</span>
                    </div>
                }
                {(videoMuted || !stream || !stream.video || (this.props.callStatus && (this.props.callStatus.toLowerCase() !== CALL_STATUS_CONNECTED && this.props.callStatus.toLowerCase() !== CALL_STATUS_HOLD))) &&
                    <div className="avatar-wrapper">
                    <div className="participantCallStatus audio">
                        {videoMuted && <i title="Participant has stopped the camera" className="videoOffRemote"><VideoOff /></i>}
                        {audioMuted &&
                            <i title="Participant is muted" className="AudioOffRemote"><AudioOff /></i>
                        }
                         {!audioMuted &&
                               <div className={`audio_indication left height_adjust transistion_adjust ${handleAudioClasses(60)}`}>
                                <div className="audio_indicator audio_indicator_1"></div>
                                <div className="audio_indicator audio_indicator_2"></div>
                                <div className="audio_indicator audio_indicator_3"></div>
                            </div>
                        }
                        {(this.props.setPinUser && this.props.jid === this.props.pinUserJid) &&
                            <i className="pinned"><IconPinActive /></i>
                        }
                    </div>
                    <div className="avatar" id="dominantSpeakerAvatar">
                         <div className={"avatar-info " + (showVoiceDetect ? " v-detect" : "")}>
                             <span style={{ "transform": "scale(" + volumeLevel + ")"}} className="voice"></span>
                            <ProfileImage
                                name = {initial}
                                chatType='chat'
                                userToken={token}
                                temporary={false}
                                imageToken={rosterData.thumbImage !== "" ? rosterData.thumbImage : rosterData.image}
                            />
                        </div>
                    </div>
                    <div onClick={this.props.handleVideoFullView} className="VideofullView">
                            <i><DropdownArrow/> </i>
                        </div>
                        <span className="ParticipantInfo lg">{rosterData.displayName || rosterData.nickName}</span>
                    </div>
                }
            </>
        )
    }
}

export default BigVideo;
