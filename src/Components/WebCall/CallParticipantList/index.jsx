import React from 'react';
import './CallParticipantList.scss';
import { AudioOff, AudioOn, VideoOff, VideoOn } from '../../../assets/images';
import ProfileImage from '../../WebChat/Common/ProfileImage';
import { capitalizeFirstLetter } from '../../../Helpers/Utility';
import { CALL_BUSY_STATUS_MESSAGE, CALL_ENGAGED_STATUS_MESSAGE, CALL_HOLD_STATUS_MESSAGE, CALL_STATUS_BUSY, CALL_STATUS_CALLING, CALL_STATUS_CONNECTING, CALL_STATUS_DISCONNECTED, CALL_STATUS_ENGAGED, CALL_STATUS_HOLD, CALL_STATUS_RECONNECT, CALL_STATUS_RINGING } from '../../../Helpers/Call/Constant';

class CallParticipantList extends React.Component  {

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.videoMuted !== this.props.videoMuted ||
            nextProps.audioMuted !== this.props.audioMuted ||
            nextProps.name !== this.props.name ||
            nextProps.imageUrl !== this.props.imageUrl||
            nextProps.userStatus !== this.props.userStatus ){
            return true;
        }
        return false;
    }
    
    render() {
        const {userStatus} = this.props;
        const token = localStorage.getItem('token');
        let userStatusDisplay = "";
        if(userStatus && userStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED){
            if(userStatus.toLowerCase() === CALL_STATUS_BUSY){
                userStatusDisplay = CALL_BUSY_STATUS_MESSAGE;
            } else if(userStatus.toLowerCase() === CALL_STATUS_ENGAGED){
                userStatusDisplay = CALL_ENGAGED_STATUS_MESSAGE;
            } else if(userStatus.toLowerCase() === CALL_STATUS_HOLD){
                userStatusDisplay = CALL_HOLD_STATUS_MESSAGE;
            } else {
                userStatusDisplay = capitalizeFirstLetter(userStatus.toLowerCase())
            }
        }
        const statusAimation = (UserStatus) => {
            const userStatusText =  UserStatus && UserStatus.toLowerCase();
            return userStatusText === CALL_STATUS_RINGING || userStatusText === CALL_STATUS_CONNECTING ||  userStatusText === CALL_STATUS_RECONNECT || userStatusText === CALL_STATUS_CALLING ? true : false;
        }
        return (            
            <li key={this.props.roster?.userId}>
                <div>
                    <ProfileImage
                        name = {this.props.initialName}
                        chatType='chat'
                        userToken={token}
                        temporary={false}
                        imageToken={this.props.imageUrl}
                    />
                    <span className="name">{this.props.name}</span>
                    {userStatus ==="CONNECTED" ?
                    <div className="callStatusIcon">
                        <i className={this.props.audioMuted ? "audio mute" : "audio" }>
                            { this.props.audioMuted ? <AudioOff /> : <AudioOn /> }
                        </i>
                        <i className={this.props.videoMuted ? "video mute" : "video" }>
                            { this.props.videoMuted ? <VideoOff /> : <VideoOn /> }
                        </i>
                    </div>
                    :
                    <div className="callStatusText">
                        {userStatusDisplay}{statusAimation(userStatus) &&
                        <div className="callingAnimation">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                        }
                    </div>
                    }
                </div>
            </li>         
        );
    }
}

export default CallParticipantList;
