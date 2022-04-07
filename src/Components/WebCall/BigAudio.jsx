import React from 'react';
import Audio from './Audio';
import { AudioOff , VideoOff } from '../../assets/images';
import ProfileImage from '../../Components/WebChat/Common/ProfileImage'
import { initialNameHandle } from '../../Helpers/Chat/User';

class BigAudio extends React.Component{

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.videoMuted !== this.props.videoMuted || nextProps.audioMuted !== this.props.audioMuted || nextProps.jid !== this.props.jid){
            return true;
        }
        return false;
    }

    render(){
        let { audioMuted, videoMuted, rosterData, stream } = this.props;
        const token = localStorage.getItem('token');
        console.log("rosterData", rosterData.image)
        const iniTail = initialNameHandle(rosterData, rosterData.displayName || rosterData.nickName);

        return(
            <div className="avatar-wrapper">
            <div className="participantCallStatus audio">
            {audioMuted &&
                <i title="Participant is muted" className="AudioOffRemote"><AudioOff/></i>
            }
            {videoMuted &&
                <i title="Participant has stopped the camera" className="videoOffRemote"><VideoOff/></i>
            }
            </div>
            <div className="avatar" id="dominantSpeakerAvatar">
                <div className="avatar-info">
                 <ProfileImage
                    name = {iniTail}
                    chatType='chat'
                    temporary={true}
                    userToken={token}
                    imageToken={rosterData.image}
                />
                {/* <Video stream={stream} muted={false}/> */}
                {stream.audio && <Audio stream={stream.audio} muted={false}/>}
            </div>
            </div>
            <span className="ParticipantInfo lg">{rosterData.displayName || rosterData.nickName}</span>
            </div>
        )
    }

}

export default BigAudio;
