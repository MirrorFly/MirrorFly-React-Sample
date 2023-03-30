import React from 'react';
import ImageComponent from '../WebChat/Common/ImageComponent'
const ParticipantsBadge = (props) => {
    const {jid, userToken, image, thumbImage, contactName} = props;

    const handleRemoveParticipant = () =>{
        return  props.removeParticipant(jid);
    }

    return(
        <li>
            <div>
                <span className="badgeImg">
                    <ImageComponent
                        userToken={userToken}
                        imageToken={thumbImage !== "" ? thumbImage : image}
                        temporary={true}
                        chatType="chat"
                    />
                    </span>
                    <span title={contactName} className="badgeTitle">{contactName}</span>
                    <i className="badgeAction" onClick={() => handleRemoveParticipant()} >X</i>
                </div>
        </li>
    )
}

export default ParticipantsBadge;
