import React from 'react';
import ImageComponent from '../WebChat/Common/ImageComponent'
const ParticipantsBadge = (props) => {

    const {jid} = props;

    const handleRemoveParticipant = () =>{
        return  props.removeParticipant(jid);
    }

    return(
        <li>
            <div>
                <span className="badgeImg">
                    <ImageComponent
                        userToken={props.userToken}
                        imageToken={props.image}
                        temporary={true}
                        chatType="chat"
                    />
                    </span>
                    <span title={props.contactName} className="badgeTitle">{props.contactName}</span>
                    <i className="badgeAction" onClick={() => handleRemoveParticipant()} >X</i>
                </div>
        </li>
    )
}

export default ParticipantsBadge;
