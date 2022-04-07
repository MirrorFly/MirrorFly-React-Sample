import React from 'react';
import Audio from './Audio';
import ProfileImage from '../../Components/WebChat/Common/ProfileImage'
import { ReactComponent as AudioOff } from '../../assets/images/webcall/audio-mute.svg';
import { ReactComponent as VideoOff } from '../../assets/images/webcall/video-off.svg';
import {getLocalUserDetails} from '../../Helpers/Chat/User';

class SmallAudio extends React.Component{

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.videoMuted !== this.props.videoMuted || nextProps.audioMuted !== this.props.audioMuted || nextProps.jid !== this.props.jid){
            return true;
        }
        return false;
    }
    render(){
        let { videoMuted, audioMuted, stream, rosterData } = this.props;
        let displayName = rosterData.displayName !== undefined && rosterData.displayName !== null ? rosterData.displayName : rosterData.nickname;
        let jid = (rosterData.username) ? rosterData.username : rosterData.jid;
        let vcardData = getLocalUserDetails();
        let muted = false;
        if(jid === vcardData.username){
            muted = true;
        }
        const token = localStorage.getItem('token');
        console.log("rosterData.image", rosterData.image);
        return(
            <span className="RemoteVideo-contianer">
                <ProfileImage
                    temporary={true}
                    chattype='chat'
                    userToken={token}
                    imageToken={rosterData.image}
                />
                <span className="ParticipantInfo">{displayName}</span>
                {/* <Video stream={stream} muted={muted}/> */}
                {stream.audio && <Audio stream={stream.audio} muted={muted}/>}
                <div className="remoteCallStatus">
                    { audioMuted &&
                        <i title="Participant is muted" className="AudioOffRemote"><AudioOff/></i>
                    }
                    { videoMuted &&
                        <i title="Participant has stopped the camera" className="videoOffRemote"><VideoOff/></i>
                    }
                </div>
                <div className="overlay-text">
                    {"connecting..."}
                </div>
            </span>
        );
    }
}

export default SmallAudio
