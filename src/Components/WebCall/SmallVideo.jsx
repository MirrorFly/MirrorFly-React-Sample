import React from 'react';
import Video from './Video';
import Audio from './Audio';
import ProfileImage from '../../Components/WebChat/Common/ProfileImage'
import { ReactComponent as AudioOff } from '../../assets/images/webcall/audio-mute.svg';
import { ReactComponent as VideoOff } from '../../assets/images/webcall/video-off.svg';
import Store from '../../Store';
import { pinUser } from '../../Actions/CallAction';
import { getLocalUserDetails, initialNameHandle } from '../../Helpers/Chat/User';
import { capitalizeFirstLetter } from '../../Helpers/Utility';
import {
    CALL_BUSY_STATUS_MESSAGE, CALL_ENGAGED_STATUS_MESSAGE,
    CALL_STATUS_DISCONNECTED, CALL_STATUS_ENGAGED, CALL_STATUS_HOLD,
    CALL_HOLD_STATUS_MESSAGE, CALL_STATUS_BUSY, CALL_STATUS_CONNECTED, CALL_STATUS_CALLING, CALL_STATUS_CONNECTING, CALL_STATUS_RINGING, CALL_STATUS_ENDED,
} from '../../Helpers/Call/Constant';
import { IconPin, IconPinActive } from '../../assets/images';
import { handleAudioClasses } from '../../Helpers/Call/Call';
import {getFromLocalStorageAndDecrypt} from '../WebChat/WebChatEncryptDecrypt';

class SmallVideo extends React.Component {

    setPinUser = (e, userJid) => {
        e.stopPropagation();
        if (!this.props.setPinUser) return;
        Store.dispatch(pinUser(userJid));
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.showConfrenceDataId !== nextProps.showConfrenceDataId ||
            ((this.props.stream && nextProps.stream) && this.props.stream.id !== nextProps.stream.id) ||
            ((this.props.stream && nextProps.stream) && this.props.stream.video !== nextProps.stream.video) ||
            ((this.props.stream && nextProps.stream) && this.props.stream.audio !== nextProps.stream.audio) ||
            this.props.rosterData.image !== nextProps.rosterData.image ||
            nextProps.videoMuted !== this.props.videoMuted ||
            nextProps.audioMuted !== this.props.audioMuted ||
            nextProps.callStatus !== this.props.callStatus ||
            nextProps.userStatus !== this.props.userStatus ||
            nextProps.tileView !== this.props.tileView ||
            nextProps.tileViewStyle?.width !== this.props.tileViewStyle?.width ||
            nextProps.tileViewStyle?.height !== this.props.tileViewStyle?.height ||
            nextProps.videoTrackId !== this.props.videoTrackId ||
            nextProps.audioTrackId !== this.props.audioTrackId ||
            nextProps.pinUserJid !== this.props.pinUserJid ||
            nextProps.setPinUser !== this.props.setPinUser ||
            nextProps.jid !== this.props.jid) {
            return true;
        }
        return false;
    }

    render() {
        let { videoMuted, audioMuted, stream, rosterData, pinUserJid, userStatus, inverse } = this.props;
        let displayName = rosterData.displayName !== undefined && rosterData.displayName !== null ? rosterData.displayName : rosterData.nickname;
        let jid = (rosterData.username) ? rosterData.username : rosterData.fromUser;
        let vcardData = getLocalUserDetails();
        let muted = false;
        if (jid === vcardData.fromUser) {
            muted = true;
        }
        const token = getFromLocalStorageAndDecrypt('token');
        let userStatusDisplay = "";
        if (userStatus && userStatus.toLowerCase() !== CALL_STATUS_CONNECTED) {
            if (userStatus.toLowerCase() === CALL_STATUS_BUSY) {
                userStatusDisplay = CALL_BUSY_STATUS_MESSAGE;
            } else if (userStatus.toLowerCase() === CALL_STATUS_ENGAGED) {
                userStatusDisplay = CALL_ENGAGED_STATUS_MESSAGE;
            } else if (userStatus.toLowerCase() === CALL_STATUS_HOLD) {
                userStatusDisplay = CALL_HOLD_STATUS_MESSAGE;
            } else if (userStatus.toLowerCase() === CALL_STATUS_CALLING) {
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if (userStatus.toLowerCase() === CALL_STATUS_CONNECTING) {
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if (userStatus.toLowerCase() === CALL_STATUS_RINGING) {
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if (userStatus.toLowerCase() === CALL_STATUS_DISCONNECTED) {
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            } else if (userStatus.toLowerCase() === CALL_STATUS_ENDED) {
                userStatusDisplay = capitalizeFirstLetter(CALL_STATUS_DISCONNECTED)
            }
        }

        let pinClass = "RemoteVideo-contianer ";
        if (this.props.setPinUser && pinUserJid === this.props.jid) {
            pinClass = pinClass + "pin-user";
        }

        const getInitalName = (rosterDataVal) => {
            const localUser = rosterDataVal.fromUser === vcardData.fromUser;
            if (localUser) return vcardData.nickName;
            else return rosterDataVal.initialName;
        }
        const initialName = initialNameHandle(rosterData, getInitalName(rosterData));

        return (
            <span
                key={this.props.elKey}
                style={this.props.tileViewStyle}
                className={`${pinClass}${userStatus && userStatus.toLowerCase() !== CALL_STATUS_CONNECTED ? " user-connecting" : ""}`}
                onClick={(e) => this.setPinUser(e, this.props.jid)}>
                {(videoMuted || !stream.video || (this.props.callStatus && this.props.callStatus.toLowerCase() === CALL_STATUS_DISCONNECTED)) &&
                    <>
                        <ProfileImage
                            name={initialName}
                            chatType='chat'
                            userToken={token}
                            temporary={false}
                            imageToken={rosterData.thumbImage !== "" ? rosterData.thumbImage : rosterData.image}
                        />
                    </>
                }
                <span className="ParticipantInfo">{displayName}</span>
                {stream && stream.video && !videoMuted && this.props.callStatus &&
                    this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && <Video stream={stream.video} muted={muted} id={stream.video.id} inverse={inverse} />}
                {stream && stream.screenshare && this.props.callStatus &&
                    this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && <Video stream={stream.screenshare} muted={muted} id={stream.screenshare.id} inverse={inverse} />}
                {stream && stream.audio && <Audio stream={stream.audio} muted={muted} id={stream.audio.id} />}
                <div className="remoteCallStatus">
                    {audioMuted &&
                        <i title="Participant is muted" className="AudioOffRemote"><AudioOff /></i>
                    }
                    {videoMuted &&
                        <i title="Participant has stopped the camera" className="videoOffRemote"><VideoOff /></i>
                    }
                    <>
                    {!audioMuted &&
                        <div className={`audio_indication left height_adjust transistion_adjust ${handleAudioClasses(60)}`}>
                            <div className="audio_indicator audio_indicator_1"></div>
                            <div className="audio_indicator audio_indicator_2"></div>
                            <div className="audio_indicator audio_indicator_3"></div>
                        </div>
                     }
                    </>
                </div>
                {!this.props.tileView && (
                    <>
                        {this.props.setPinUser && (
                            <>
                                {pinUserJid === this.props.jid ? (
                                    <i onClick={(e) => this.setPinUser(e, this.props.jid)} className="pinned active">
                                        <IconPinActive />
                                    </i>
                                ) : (
                                    <i onClick={(e) => this.setPinUser(e, this.props.jid)} className="pinned">
                                        <IconPin />
                                    </i>
                                )}
                            </>
                        )}
                    </>
                )}
                {userStatus && userStatusDisplay !== "" && userStatus.toLowerCase() !== CALL_STATUS_CONNECTED &&
                    <div className="overlay-text">
                        {userStatusDisplay}
                    </div>
                }
            </span>
        );
    }
}

export default SmallVideo
